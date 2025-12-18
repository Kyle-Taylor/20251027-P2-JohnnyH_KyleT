package com.skillstorm.cloudlodge.controllers;

import com.skillstorm.cloudlodge.models.LoginRequest;
import com.skillstorm.cloudlodge.models.RegisterRequest;
import com.skillstorm.cloudlodge.models.User;
import com.skillstorm.cloudlodge.services.AuthService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:5173") // adjust to your frontend URL
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            String token = authService.login(request);
            Map<String, String> body = new HashMap<>();
            body.put("token", token);
            return ResponseEntity.ok(body);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            User user = authService.register(request);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal() == "anonymousUser") {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        User user = (User) auth.getPrincipal();
        return ResponseEntity.ok(user);
    }

    // Add this logout endpoint
    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        // Client should remove the JWT from storage
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }
}
