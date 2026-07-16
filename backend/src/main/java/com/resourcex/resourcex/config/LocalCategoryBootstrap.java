package com.resourcex.resourcex.config;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.resourcex.resourcex.entity.Category;
import com.resourcex.resourcex.repository.CategoryRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Local-profile-only bootstrap of default {@link Category} rows.
 *
 * <p>The local profile runs against an in-memory H2 database with Flyway
 * disabled (see {@code application-local.properties}). Hibernate's
 * {@code create-drop} creates the schema from entities, but no migration
 * seeds {@code categories} — the only INSERT lives in
 * {@code V19__schema_integrity_constraints.sql}, which is never executed
 * locally. Result: the {@code /my-posts/add} Category dropdown is empty.
 *
 * <p>This runner mirrors {@link LocalAdminBootstrap}: it is gated by
 * {@link Profile @Profile("local")} and therefore never executes in
 * production or any other profile. It is idempotent: rows are inserted
 * only if the table is empty, and subsequent boots perform a no-op.
 *
 * <p>It deliberately does not enable Flyway, does not introduce SQL files,
 * and does not modify any controller, repository, service, or production
 * configuration.
 */
@Slf4j
@Component
@Profile("local")
@Order(0)
@RequiredArgsConstructor
public class LocalCategoryBootstrap implements ApplicationRunner {

    private final CategoryRepository categoryRepository;

    private static final String[] DEFAULT_LOCAL_CATEGORIES = {
            "Books",
            "Electronics",
            "Lab Equipment",
            "Tools",
            "Sports",
            "Musical Instruments",
            "Calculators",
            "Cameras",
    };

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        long existing = categoryRepository.count();
        if (existing > 0) {
            log.info("[LocalCategoryBootstrap] categories table already populated ({} rows); skipping seed.",
                    existing);
            return;
        }

        int inserted = 0;
        for (String name : DEFAULT_LOCAL_CATEGORIES) {
            if (categoryRepository.findByNameIgnoreCase(name).isPresent()) {
                continue;
            }
            categoryRepository.save(
                    Category.builder()
                            .name(name)
                            .description("Default local category: " + name)
                            .build());
            inserted++;
        }

        log.info("==================================================");
        log.info("Local category seed complete");
        log.info("");
        log.info("Inserted: {}", inserted);
        log.info("Profile:  local");
        log.info("==================================================");
    }
}
