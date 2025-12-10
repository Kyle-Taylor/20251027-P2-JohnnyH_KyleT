package com.skillstorm.cloudlodge.services;

import com.skillstorm.cloudlodge.models.LoginRequest;
import com.skillstorm.cloudlodge.models.RegisterRequest;
import com.skillstorm.cloudlodge.models.User;
import com.skillstorm.cloudlodge.repositories.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    // Register a new user
    public User register(RegisterRequest request) throws Exception {
        // Check if email already exists
        if (request.getEmail() == null || request.getPassword() == null) {
            throw new Exception("Email and password are required");
        }

        // TODO: check in DB if email already exists
        // if (userRepository.findByEmail(request.getEmail()).isPresent()) {
        //     throw new Exception("Email already in use");
        // }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setFullName(request.getFullName());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(User.Role.GUEST);   // default role
        user.setAuthProvider("local");    // for local registration
        user.setProviderId(null);

        // Initialize preferences and billing address to avoid nulls
        user.setPreferences(new User.Preferences());
        user.setBillingAddress(new User.Address());
        user.setSavedPaymentMethods(new ArrayList<>());

        // TODO: save user to DB
        // userRepository.save(user);

        return user;
    }

    // Login user
    public String login(LoginRequest request) throws Exception {
        if (request.getEmail() == null || request.getPassword() == null) {
            throw new Exception("Email and password are required");
        }

        // TODO: fetch user from DB
        // Optional<User> optionalUser = userRepository.findByEmail(request.getEmail());
        // if (optionalUser.isEmpty()) throw new Exception("Invalid credentials");
        // User user = optionalUser.get();

        // For now, stub user for testing
        User user = new User();
        user.setEmail("test@example.com");
        user.setPassword(passwordEncoder.encode("password")); // stub password

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new Exception("Invalid email or password");
        }

        // Generate JWT token placeholder
        String token = UUID.randomUUID().toString();
        return token;
    }

    // Get current user info (stub for now)
    public User getCurrentUser() throws Exception {
        User user = new User();
        user.setEmail("test@example.com");
        user.setFullName("Test User");
        user.setRole(User.Role.GUEST);
        user.setPreferences(new User.Preferences());
        user.setBillingAddress(new User.Address());
        user.setSavedPaymentMethods(new ArrayList<>());
        return user;
    }

    // Placeholder for OAuth login
    public User oauthLogin(String provider, String providerId, String email, String fullName) {
        // TODO: fetch user by provider + providerId from DB
        
        // If not exists, create new user with role GUEST
        User user = new User();
        user.setAuthProvider(provider);
        user.setProviderId(providerId);
        user.setEmail(email);
        user.setFullName(fullName);
        user.setRole(User.Role.GUEST);

        // Initialize other fields
        user.setPreferences(new User.Preferences());
        user.setBillingAddress(new User.Address());
        user.setSavedPaymentMethods(new ArrayList<>());

        // TODO: save or update user in DB

        return user;
    }
}
