package com.jobportal.config;

import com.jobportal.entity.User;
import com.jobportal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Dev-friendly bootstrap to ensure there is at least one ADMIN account.
 * Fixes common "403 Forbidden" issues when testing admin-only endpoints.
 */
@Component
@Order(1)
public class AdminBootstrap implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.bootstrapAdmin.enabled:true}")
    private boolean bootstrapEnabled;

    @Value("${app.bootstrapAdmin.email:admin@jobportal.com}")
    private String adminEmail;

    @Value("${app.bootstrapAdmin.password:admin123}")
    private String adminPassword;

    @Value("${app.bootstrapSuperAdmin.enabled:true}")
    private boolean bootstrapSuperAdminEnabled;

    @Value("${app.bootstrapSuperAdmin.email:admin@jobportal.com}")
    private String superAdminEmail;

    @Value("${app.bootstrapSuperAdmin.password:admin123}")
    private String superAdminPassword;

    @Value("${app.bootstrapSuperAdmin.forcePassword:true}")
    private boolean forceSuperAdminPassword;

    public AdminBootstrap(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (bootstrapSuperAdminEnabled) ensureSuperAdmin();
        if (bootstrapEnabled) ensureAdmin();
    }

    private void ensureSuperAdmin() {
        userRepository.findByEmail(superAdminEmail).ifPresentOrElse(existing -> {
            existing.setRole(User.Role.SUPER_ADMIN);
            existing.setActive(true);
            if (forceSuperAdminPassword) {
                existing.setPassword(passwordEncoder.encode(superAdminPassword));
            }
            userRepository.save(existing);
        }, () -> {
            User admin = new User();
            admin.setName("Super Admin");
            admin.setEmail(superAdminEmail);
            // Default dev password; change after first login.
            admin.setPassword(passwordEncoder.encode(superAdminPassword));
            admin.setRole(User.Role.SUPER_ADMIN);
            admin.setActive(true);
            userRepository.save(admin);
        });
    }

    private void ensureAdmin() {
        // Ensure the configured admin email is an ADMIN (useful for local/dev testing).
        userRepository.findByEmail(adminEmail).ifPresentOrElse(existing -> {
            // Don't downgrade a SUPER_ADMIN
            if (existing.getRole() != User.Role.SUPER_ADMIN) {
                existing.setRole(User.Role.ADMIN);
                // Reset password to default for admin user
                existing.setPassword(passwordEncoder.encode(adminPassword));
            }
            existing.setActive(true);
            userRepository.save(existing);
            System.out.println("Admin user ensured: " + adminEmail + " / " + adminPassword);
        }, () -> {
            User admin = new User();
            admin.setName("Admin User");
            admin.setEmail(adminEmail);
            // Default dev password; change after first login.
            admin.setPassword(passwordEncoder.encode(adminPassword));
            admin.setRole(User.Role.ADMIN);
            admin.setActive(true);
            userRepository.save(admin);
            System.out.println("Admin user created: " + adminEmail + " / " + adminPassword);
        });
    }
}


