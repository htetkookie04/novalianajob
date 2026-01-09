package com.jobportal.config;

import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Lightweight schema tweaks needed for new roles (TiDB/MySQL compatible).
 * Runs before other bootstraps.
 */
@Component
@Order(0)
public class SchemaMigration implements org.springframework.boot.CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    public SchemaMigration(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        // MySQL/TiDB: convert ENUM role column to VARCHAR so we can support SUPER_ADMIN.
        try {
            jdbcTemplate.execute("ALTER TABLE users MODIFY COLUMN role VARCHAR(32) NOT NULL");
        } catch (Exception ignored) {
            // Already migrated or insufficient privileges; ignore for dev.
        }
    }
}


