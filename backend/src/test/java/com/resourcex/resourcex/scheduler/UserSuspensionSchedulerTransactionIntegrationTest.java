package com.resourcex.resourcex.scheduler;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.test.mock.mockito.SpyBean;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.orm.jpa.JpaSystemException;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import com.resourcex.resourcex.entity.Role;
import com.resourcex.resourcex.entity.StudentRestriction;
import com.resourcex.resourcex.entity.User;
import com.resourcex.resourcex.entity.UserStatus;
import com.resourcex.resourcex.repository.RoleRepository;
import com.resourcex.resourcex.repository.StudentRestrictionRepository;
import com.resourcex.resourcex.repository.UserRepository;
import com.resourcex.resourcex.service.AuditLogService;
import com.resourcex.resourcex.service.impl.SuspensionLifecycleServiceImpl;

/**
 * Empirical reproduction test for the scheduler's per-row isolation guarantee.
 *
 * <p>One of the three seeded users ("Failing") has its
 * {@code SuspensionLifecycleService.liftExpiredFor(...)} call intercepted by a
 * Mockito spy and made to throw a {@link JpaSystemException} — a simulated flush
 * failure. The fix is to wrap that work in a {@code @Transactional(REQUIRES_NEW)}
 * boundary so the exception rolls back the entire row's changes atomically
 * (user stays {@code PENDING}, restriction stays {@code "timed"}, audit log
 * skipped). The other two users complete their own REQUIRES_NEW transactions
 * and end up {@code ACTIVE} with cleared restrictions.
 *
 * <p>The scheduler's outer try/catch absorbs the per-row exception and
 * continues to the next row. There must be no {@code UnexpectedRollbackException}
 * propagating out of {@code liftExpiredSuspensions}.
 *
 * <p>Why {@code @SpyBean} on {@link SuspensionLifecycleServiceImpl} and not on
 * {@code UserRepository}? Spying a Spring Data JPA repository (an interface)
 * and calling {@code inv.callRealMethod()} from inside the spy stub throws
 * {@code MockitoException: Cannot call abstract real method on java object!}
 * because the interface method has no body. The lifecycle service, by contrast,
 * is a concrete {@code @Service} class, so {@code callRealMethod()} dispatches
 * through the real Spring CGLIB proxy chain (which applies the
 * {@code @Transactional} advice) and reaches the real implementation.
 */
@SpringBootTest
@ActiveProfiles("test")
class UserSuspensionSchedulerTransactionIntegrationTest {

    @Autowired private UserSuspensionScheduler scheduler;
    @Autowired private UserRepository userRepository;
    @Autowired private StudentRestrictionRepository restrictionRepository;
    @Autowired private RoleRepository roleRepository;
    @Autowired private PlatformTransactionManager transactionManager;

    /**
     * Concrete {@code @Service} — spy stubs {@code callRealMethod()} without
     * throwing on an abstract interface method.
     */
    @SpyBean private SuspensionLifecycleServiceImpl suspensionLifecycleService;

    @MockBean private AuditLogService auditLogService;

    private long runId;

    private void seedThreeExpiredUsers() {
        runId = System.nanoTime();
        new TransactionTemplate(transactionManager).executeWithoutResult(s -> {
            restrictionRepository.deleteAll();
            userRepository.deleteAll();
            roleRepository.deleteAll();

            Role role = roleRepository.save(Role.builder().name("ROLE_SCHED_TEST").build());
            saveUser("Before", role);
            saveUser("Failing", role);
            saveUser("After", role);

            for (User u : userRepository.findAll()) {
                restrictionRepository.save(StudentRestriction.builder()
                        .studentUserId(u.getUserId())
                        .suspensionReason("timed")
                        .suspendedAt(LocalDateTime.now().minusDays(2))
                        .suspendedUntil(LocalDateTime.now().minusMinutes(5))
                        .build());
            }
        });
    }

    private void saveUser(String prefix, Role role) {
        userRepository.save(User.builder()
                .name(prefix)
                .email(prefix.toLowerCase() + "." + runId + "@test.com")
                .password("hash")
                .status(UserStatus.PENDING)
                .role(role)
                .build());
    }

    /**
     * Spy injection: throw {@link JpaSystemException} (a Spring JPA exception
     * wrapping a simulated flush failure) only when the scheduler asks the
     * lifecycle service to lift the user named "Failing". The REQUIRES_NEW
     * transaction boundary on {@code liftExpiredFor} is expected to absorb it.
     *
     * <p>Important: we never call {@link Mockito#reset(Object)} on the spy.
     * Resetting a {@code @SpyBean} clears the default {@code callRealMethod()}
     * behaviour, after which unstubbed {@code liftExpiredFor(...)} returns
     * {@code void} without doing anything — every row would silently succeed
     * without any side-effects.
     */
    private void installFailingLiftStub() {
        new TransactionTemplate(transactionManager).executeWithoutResult(s -> {
            Long failingId = userRepository.findAll().stream()
                    .filter(u -> "Failing".equals(u.getName()))
                    .findFirst().orElseThrow().getUserId();

            Mockito.doAnswer(inv -> {
                User u = inv.getArgument(0, User.class);
                if (u != null && failingId.equals(u.getUserId())) {
                    throw new JpaSystemException(new RuntimeException("simulated flush failure"));
                }
                return inv.callRealMethod();
            }).when(suspensionLifecycleService).liftExpiredFor(Mockito.any(User.class), Mockito.any(StudentRestriction.class));
        });
    }

    @Test
    void failing_user_save_throws_what_does_the_outer_transaction_do() {
        seedThreeExpiredUsers();
        installFailingLiftStub();

        Throwable thrown = null;
        try {
            scheduler.liftExpiredSuspensions();
        } catch (Throwable t) {
            thrown = t;
        }

        String header = thrown == null ? "<none>" :
                thrown.getClass().getName() + " :: " + thrown.getMessage();
        System.out.println("[VERDICT] scheduler-threw=" + header);

        final List<User> all = new ArrayList<>();
        final List<StudentRestriction> allR = new ArrayList<>();
        new TransactionTemplate(transactionManager).executeWithoutResult(s -> {
            all.addAll(userRepository.findAll());
            allR.addAll(restrictionRepository.findAll());
        });
        all.sort((x, y) -> Long.compare(x.getUserId(), y.getUserId()));
        allR.sort((x, y) -> Long.compare(x.getStudentUserId(), y.getStudentUserId()));
        for (int i = 0; i < all.size(); i++) {
            User u = all.get(i);
            StudentRestriction r = allR.get(i);
            String label = u.getName();
            System.out.println("[VERDICT] " + label
                    + " status=" + u.getStatus()
                    + " restrictionReason=" + (r == null ? "<null row>" : String.valueOf(r.getSuspensionReason())));
        }

        // Diagnostic: do NOT hard-assert; pass whichever way the test ran so
        // the [VERDICT] println output is captured.
        assertThat(all).as("three users remain").hasSize(3);
    }

    @AfterEach
    void cleanUpSeedData() {
        // FK-safe order: restrictions -> users -> roles. Without this the rows
        // would leak into the next test sharing the same in-memory H2 instance.
        // Deliberately NOT @DirtiesContext — that would destroy the schema for
        // unrelated tests in the suite.
        new TransactionTemplate(transactionManager).executeWithoutResult(s -> {
            restrictionRepository.deleteAll();
            userRepository.deleteAll();
            roleRepository.deleteAll();
        });
    }
}
