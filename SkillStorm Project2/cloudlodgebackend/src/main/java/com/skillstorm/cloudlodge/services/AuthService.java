package com.skillstorm.cloudlodge.services;

import com.skillstorm.cloudlodge.models.LoginRequest;
import com.skillstorm.cloudlodge.models.RegisterRequest;
import com.skillstorm.cloudlodge.models.User;
import com.skillstorm.cloudlodge.repositories.UserRepository;
import com.skillstorm.cloudlodge.utils.JwtUtils;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtils jwtUtils) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
    }

    // Login returns JWT token
    public String login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        return jwtUtils.generateJwtToken(user.getId(), user.getRole().name());

    }

    // AuthService.java
    public User register(RegisterRequest request) {
        // 1. Validate required fields
        if (request.getEmail() == null || request.getPassword() == null) {
            throw new RuntimeException("Email and password are required");
        }

        // 2. Check for existing user
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already in use");
        }

        // 3. Create new User entity
        User user = new User();
        user.setEmail(request.getEmail());
        user.setFullName(request.getFullName());
        user.setPassword(passwordEncoder.encode(request.getPassword())); // hashed password

        // Optional phone number
        user.setPhone(request.getPhone() != null && !request.getPhone().isBlank() 
                    ? request.getPhone() 
                    : null);

        // Role handling (default to GUEST if invalid)
        try {
            user.setRole(User.Role.valueOf(request.getRole().toUpperCase()));
        } catch (IllegalArgumentException | NullPointerException e) {
            user.setRole(User.Role.GUEST); // default role
        }

        // Other default fields
        user.setAuthProvider("local");
        user.setProviderId(null);
        user.setPreferences(new User.Preferences());
        user.setBillingAddress(new User.Address());
        user.setSavedPaymentMethods(new ArrayList<>());

        // 4. Persist to MongoDB
        return userRepository.save(user);
    }


    // Fetch user by ID
    public User getUserById(String userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
