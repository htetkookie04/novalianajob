package com.jobportal.controller;

import com.jobportal.dto.AdminPasswordChangeRequest;
import com.jobportal.entity.User;
import com.jobportal.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminPasswordController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Matches frontend requirement: /api/admin/update-password
    // Any authenticated user who can access Settings can change their password
    @PostMapping("/update-password")
    public ResponseEntity<?> updatePassword(@Valid @RequestBody AdminPasswordChangeRequest request, Authentication auth) {
        // Ensure user is authenticated
        if (auth == null || auth.getName() == null || auth.getName().isBlank()) {
            return ResponseEntity.status(401).body(new ErrorResponse("Unauthorized"));
        }
        String email = auth.getName();

        // Validate password match
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            return ResponseEntity.badRequest().body(new ErrorResponse("New password and confirm password must match"));
        }

        // Validate minimum password length (also validated by DTO, but double-check for security)
        if (request.getNewPassword().length() < 6) {
            return ResponseEntity.badRequest().body(new ErrorResponse("New password must be at least 6 characters long"));
        }

        // Find user
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.status(404).body(new ErrorResponse("User not found"));
        }

        // Validate old password
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Old password is incorrect"));
        }

        // Hash and save new password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("Password updated successfully"));
    }

    private record MessageResponse(String message) {}
    private record ErrorResponse(String message) {}
}


