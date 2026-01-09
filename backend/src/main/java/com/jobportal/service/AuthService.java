package com.jobportal.service;

import com.jobportal.dto.LoginRequest;
import com.jobportal.dto.LoginResponse;
import com.jobportal.dto.RegisterRequest;
import com.jobportal.entity.User;
import com.jobportal.repository.UserRepository;
import com.jobportal.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private EmailService emailService;

    @Transactional
    public LoginResponse register(RegisterRequest request) {
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        // Create new user
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(User.Role.USER); // Default role is USER

        // Save user
        User savedUser = userRepository.save(user);

        // Send registration email
        try {
            emailService.sendRegistrationEmail(savedUser.getName(), savedUser.getEmail());
        } catch (Exception e) {
            // Log error but don't fail registration
            System.err.println("Failed to send registration email: " + e.getMessage());
        }

        // Generate token and return
        String token = jwtUtil.generateToken(savedUser.getEmail(), savedUser.getRole().name());
        return new LoginResponse(token, savedUser.getEmail(), savedUser.getRole().name());
    }

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!user.isActive()) {
            throw new RuntimeException("Account is inactive. Please contact administrator.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        return new LoginResponse(token, user.getEmail(), user.getRole().name());
    }
}

