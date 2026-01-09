package com.jobportal.service;

import com.jobportal.dto.AdminUserDto;
import com.jobportal.dto.AdminUserCreateRequest;
import com.jobportal.dto.AdminUserUpdateRequest;
import com.jobportal.entity.User;
import com.jobportal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Service
public class AdminUserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<AdminUserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .sorted(Comparator.comparing(User::getId))
                .map(AdminUserDto::from)
                .toList();
    }

    public AdminUserDto createUser(AdminUserCreateRequest request) {
        String email = request.getEmail().trim();
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already registered");
        }

        User.Role role;
        try {
            role = User.Role.valueOf(request.getRole().trim().toUpperCase());
        } catch (Exception e) {
            throw new RuntimeException("Invalid role. Use SUPER_ADMIN, ADMIN, or USER");
        }

        User user = new User();
        user.setName(request.getName().trim());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(role);
        user.setActive(Boolean.TRUE.equals(request.getActive()));

        return AdminUserDto.from(userRepository.save(user));
    }

    public void deleteUser(Long id, Authentication authentication) {
        // Get the user to be deleted
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Get the current authenticated user (SUPER_ADMIN)
        String currentUserEmail = authentication != null ? authentication.getName() : null;
        if (currentUserEmail == null || currentUserEmail.isBlank()) {
            throw new RuntimeException("Unauthorized: No authenticated user");
        }

        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new RuntimeException("Current user not found"));

        // Prevent SUPER_ADMIN from deleting themselves
        if (user.getId().equals(currentUser.getId())) {
            throw new RuntimeException("Cannot delete your own account");
        }

        // SUPER_ADMIN can delete all users, but must ensure at least one active SUPER_ADMIN remains
        if (user.getRole() == User.Role.SUPER_ADMIN) {
            long activeSuperCount = userRepository.countByRoleAndActiveTrue(User.Role.SUPER_ADMIN);
            if (activeSuperCount <= 1) {
                throw new RuntimeException("Cannot delete the last active super admin");
            }
        }

        // Hard delete: Permanently remove user from database
        // SUPER_ADMIN has full authority to delete any user (USER, ADMIN, or other SUPER_ADMIN)
        userRepository.deleteById(id);
    }

    public AdminUserDto updateUser(Long id, AdminUserUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // If email changes, ensure it is unique
        String newEmail = request.getEmail().trim();
        if (!user.getEmail().equalsIgnoreCase(newEmail) && userRepository.existsByEmail(newEmail)) {
            throw new RuntimeException("Email already registered");
        }

        User.Role newRole;
        try {
            newRole = User.Role.valueOf(request.getRole().trim().toUpperCase());
        } catch (Exception e) {
            throw new RuntimeException("Invalid role. Use SUPER_ADMIN, ADMIN, or USER");
        }

        boolean newActive = Boolean.TRUE.equals(request.getActive());

        // Prevent removing/deactivating the last active admin
        boolean adminDemoted = user.getRole() == User.Role.ADMIN && newRole != User.Role.ADMIN;
        boolean adminDeactivated = user.getRole() == User.Role.ADMIN && !newActive;
        if (adminDemoted || adminDeactivated) {
            long activeAdminCount = userRepository.countByRoleAndActiveTrue(User.Role.ADMIN);
            if (activeAdminCount <= 1) {
                throw new RuntimeException("Cannot remove or deactivate the last admin");
            }
        }

        // Prevent removing/deactivating the last active super admin
        boolean superDemoted = user.getRole() == User.Role.SUPER_ADMIN && newRole != User.Role.SUPER_ADMIN;
        boolean superDeactivated = user.getRole() == User.Role.SUPER_ADMIN && !newActive;
        if (superDemoted || superDeactivated) {
            long activeSuperCount = userRepository.countByRoleAndActiveTrue(User.Role.SUPER_ADMIN);
            if (activeSuperCount <= 1) {
                throw new RuntimeException("Cannot remove or deactivate the last super admin");
            }
        }

        user.setName(request.getName().trim());
        user.setEmail(newEmail);
        user.setRole(newRole);
        user.setActive(newActive);

        // Optional password update
        if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword().trim()));
        }

        User saved = userRepository.save(user);
        return AdminUserDto.from(saved);
    }
}


