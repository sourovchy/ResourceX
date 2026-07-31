package com.resourcex.resourcex.service;

import com.resourcex.resourcex.dto.request.RegisterRequest;
import com.resourcex.resourcex.entity.*;
import com.resourcex.resourcex.repository.*;
import com.resourcex.resourcex.service.impl.AdminServiceImpl;
import com.resourcex.resourcex.util.constants.RoleConstants;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Collections;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@ActiveProfiles("test")
public class UserRejectionIntegrationTest {

    @Autowired private AdminServiceImpl adminService;
    @Autowired private AuthService authService;
    @Autowired private UserRepository userRepository;
    @Autowired private StudentProfileRepository studentProfileRepository;
    @Autowired private StudentRestrictionRepository studentRestrictionRepository;
    @Autowired private FileMetadataRepository fileMetadataRepository;
    @Autowired private OtpRepository otpRepository;
    @Autowired private RoleRepository roleRepository;
    @Autowired private PlatformTransactionManager transactionManager;

    @Value("${storage.local-dir:uploads}")
    private String localDir;

    private User admin;
    private String testFileName1 = "test-id-card-rejection-1.jpg";
    private String testFileName2 = "test-avatar-rejection-2.jpg";
    private Path idCardPath;
    private Path avatarPath;

    @BeforeEach
    void setUp() throws IOException {
        // Clear db cleanly
        studentRestrictionRepository.deleteAll();
        studentProfileRepository.deleteAll();
        fileMetadataRepository.deleteAll();
        otpRepository.deleteAll();
        userRepository.deleteAll();
        roleRepository.deleteAll();
        SecurityContextHolder.clearContext();

        // Create uploads dir if it doesn't exist
        Path dirPath = Paths.get(localDir).toAbsolutePath().normalize();
        Files.createDirectories(dirPath);

        // Create dummy physical files on disk
        idCardPath = dirPath.resolve(testFileName1);
        avatarPath = dirPath.resolve(testFileName2);
        Files.write(idCardPath, new byte[]{1, 2, 3});
        Files.write(avatarPath, new byte[]{4, 5, 6});

        // Set up Admin user
        new TransactionTemplate(transactionManager).executeWithoutResult(status -> {
            Role adminRole = roleRepository.save(Role.builder().name(RoleConstants.ROLE_ADMIN).build());
            Role userRole = roleRepository.save(Role.builder().name(RoleConstants.ROLE_USER).build());

            admin = userRepository.save(User.builder()
                    .name("Test Admin")
                    .email("admin@resourcex.com")
                    .password("SecurePassword123!")
                    .status(UserStatus.ACTIVE)
                    .role(adminRole)
                    .build());
        });

        // Authenticate as Admin
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(admin.getEmail(), null, Collections.emptyList()));
    }

    @AfterEach
    void tearDown() throws IOException {
        SecurityContextHolder.clearContext();
        studentRestrictionRepository.deleteAll();
        studentProfileRepository.deleteAll();
        fileMetadataRepository.deleteAll();
        otpRepository.deleteAll();
        userRepository.deleteAll();
        roleRepository.deleteAll();

        // Delete test files if they somehow remain
        Files.deleteIfExists(idCardPath);
        Files.deleteIfExists(avatarPath);
    }

    @Test
    void testCase1_rejectUser_removesEverything() {
        // 1. Create a FileMetadata for ID card
        FileMetadata idCardMeta = fileMetadataRepository.save(FileMetadata.builder()
                .fileUrl("/api/files/" + testFileName1)
                .purpose(FilePurpose.STUDENT_ID)
                .build());

        // 2. Register user
        RegisterRequest request = RegisterRequest.builder()
                .studentId("STU001")
                .name("John Doe")
                .email("john.doe@university.edu")
                .password("SecurePassword123!")
                .phone("01712345678")
                .university("University of Engineering")
                .department("CSE")
                .idCardFileId(idCardMeta.getFileId())
                .build();

        authService.register(request);

        User pendingUser = userRepository.findByEmailIgnoreCase("john.doe@university.edu").orElseThrow();
        assertThat(pendingUser.getStatus()).isEqualTo(UserStatus.PENDING);

        // Link ID card uploader
        idCardMeta.setUser(pendingUser);
        fileMetadataRepository.save(idCardMeta);

        // Associate dummy avatar file
        FileMetadata avatarMeta = fileMetadataRepository.save(FileMetadata.builder()
                .fileUrl("/api/files/" + testFileName2)
                .purpose(FilePurpose.AVATAR)
                .user(pendingUser)
                .build());
        pendingUser.setAvatarFileId(avatarMeta.getFileId());
        userRepository.save(pendingUser);

        // Create dummy OTP token
        otpRepository.save(OtpToken.builder()
                .email("john.doe@university.edu")
                .otpHash("otp-hash-123")
                .tokenPurpose(TokenPurpose.EMAIL_VERIFICATION)
                .expiresAt(java.time.Instant.now().plusSeconds(600))
                .build());

        // Assert setup is successful
        assertThat(idCardPath).exists();
        assertThat(avatarPath).exists();
        assertThat(fileMetadataRepository.findById(idCardMeta.getFileId())).isPresent();
        assertThat(fileMetadataRepository.findById(avatarMeta.getFileId())).isPresent();
        assertThat(otpRepository.countByEmailIgnoreCase("john.doe@university.edu")).isGreaterThan(0);

        // 3. Reject User
        adminService.rejectUser(pendingUser.getUserId(), "Invalid ID Card uploaded");

        // 4. Verify user and profile removed
        assertThat(userRepository.findById(pendingUser.getUserId())).isEmpty();
        assertThat(studentProfileRepository.findByUser_UserId(pendingUser.getUserId())).isEmpty();

        // 5. Verify OTP removed
        assertThat(otpRepository.countByEmailIgnoreCase("john.doe@university.edu")).isEqualTo(0);

        // 6. Verify FileMetadata removed
        assertThat(fileMetadataRepository.findById(idCardMeta.getFileId())).isEmpty();
        assertThat(fileMetadataRepository.findById(avatarMeta.getFileId())).isEmpty();

        // 7. Verify physical files removed (Case 5: no orphan files)
        assertThat(idCardPath).doesNotExist();
        assertThat(avatarPath).doesNotExist();
    }

    @Test
    void testCase2_rejectUser_canRegisterAgainWithSameEmail() {
        // 1. Setup ID card
        FileMetadata idCardMeta = fileMetadataRepository.save(FileMetadata.builder()
                .fileUrl("/api/files/" + testFileName1)
                .purpose(FilePurpose.STUDENT_ID)
                .build());

        // 2. Register
        RegisterRequest request = RegisterRequest.builder()
                .studentId("STU001")
                .name("John Doe")
                .email("john.doe@university.edu")
                .password("SecurePassword123!")
                .phone("01712345678")
                .university("University of Engineering")
                .department("CSE")
                .idCardFileId(idCardMeta.getFileId())
                .build();

        authService.register(request);

        User pendingUser = userRepository.findByEmailIgnoreCase("john.doe@university.edu").orElseThrow();

        // 3. Reject User
        adminService.rejectUser(pendingUser.getUserId(), "Rejected");

        // 4. Re-create dummy file on disk (since rejectUser deleted it)
        try {
            Files.write(idCardPath, new byte[]{1, 2, 3});
        } catch (IOException e) {
            // Ignore
        }

        // Re-save ID card metadata since it was deleted
        FileMetadata newIdCardMeta = fileMetadataRepository.save(FileMetadata.builder()
                .fileUrl("/api/files/" + testFileName1)
                .purpose(FilePurpose.STUDENT_ID)
                .build());

        // 5. Register again with same email and registration succeeds!
        request.setIdCardFileId(newIdCardMeta.getFileId());
        authService.register(request);

        assertThat(userRepository.findByEmailIgnoreCase("john.doe@university.edu")).isPresent();
    }

    @Test
    void testCase3_rejectActiveUser_fails() {
        User activeUser = new TransactionTemplate(transactionManager).execute(status -> {
            Role userRole = roleRepository.findByNameIgnoreCase(RoleConstants.ROLE_USER).orElseThrow();
            return userRepository.save(User.builder()
                    .name("Active User")
                    .email("active@university.edu")
                    .password("SecurePassword123!")
                    .status(UserStatus.ACTIVE)
                    .role(userRole)
                    .build());
        });

        // Attempt to reject active user should fail with ConflictException
        assertThatThrownBy(() -> adminService.rejectUser(activeUser.getUserId(), "Rejected"))
                .isInstanceOf(com.resourcex.resourcex.exception.ConflictException.class);
    }

    @Test
    void testCase4_rejectAlreadyRejectedUser_fails() {
        FileMetadata idCardMeta = fileMetadataRepository.save(FileMetadata.builder()
                .fileUrl("/api/files/" + testFileName1)
                .purpose(FilePurpose.STUDENT_ID)
                .build());

        RegisterRequest request = RegisterRequest.builder()
                .studentId("STU001")
                .name("John Doe")
                .email("john.doe@university.edu")
                .password("SecurePassword123!")
                .phone("01712345678")
                .university("University of Engineering")
                .department("CSE")
                .idCardFileId(idCardMeta.getFileId())
                .build();

        authService.register(request);

        User pendingUser = userRepository.findByEmailIgnoreCase("john.doe@university.edu").orElseThrow();
        Long pendingUserId = pendingUser.getUserId();

        adminService.rejectUser(pendingUserId, "Rejected");

        // Attempting to reject again must fail with ResourceNotFoundException (since user is deleted)
        assertThatThrownBy(() -> adminService.rejectUser(pendingUserId, "Rejected"))
                .isInstanceOf(com.resourcex.resourcex.exception.ResourceNotFoundException.class);
    }
}
