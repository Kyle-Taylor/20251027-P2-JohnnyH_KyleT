package com.skillstorm.cloudlodge.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;

import com.skillstorm.cloudlodge.models.User;
import com.skillstorm.cloudlodge.services.UserService;
import com.skillstorm.cloudlodge.dtos.UserDTO;

@RestController
@RequestMapping("/profile")
public class ProfileController {

    private final UserService userService;

    public ProfileController(UserService userService) {
        this.userService = userService;
    }

    /*
    @GetMapping
    public ResponseEntity<?> getProfile(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // Correctly get email from Principal
        User userPrincipal = (User) authentication.getPrincipal();
        String email = userPrincipal.getEmail();

        User user = userService.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        UserDTO userDTO = new UserDTO(
            user.getFullName(),
            user.getEmail(),
            user.getPhone(),
            user.getAuthProvider(),
            user.getRole().name()
        );

        return ResponseEntity.ok(userDTO);
    }
    */

    
    @GetMapping
    public ResponseEntity<?> getProfile(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // Extract user from principal
        User userPrincipal = (User) authentication.getPrincipal();
        String email = userPrincipal.getEmail();
        String role = userPrincipal.getRole() != null ? userPrincipal.getRole().name() : "GUEST";

        User user = userService.findByEmail(email).orElse(null);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        // Pass role to service for filtering 
        UserDTO userDTO = userService.getUserForRole(user, role);

        return ResponseEntity.ok(userDTO);
    }

    @PutMapping
    public ResponseEntity<?> updateProfile(Authentication authentication, @RequestBody UserDTO userDTO) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // Correctly get email from principal
        User userPrincipal = (User) authentication.getPrincipal();
        String email = userPrincipal.getEmail();

        User user = userService.findByEmail(email).orElse(null);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        // Update allowed fields from DTO
        user.setFullName(userDTO.getFullName());
        String phone = userDTO.getPhone() != null ? userDTO.getPhone().replaceAll("\\D", "") : null;
        if (phone != null && !phone.isBlank()) {
            if (phone.length() != 10) {
                return ResponseEntity.badRequest().body("Phone number must be 10 digits");
            }
            user.setPhone(phone);
        } else {
            user.setPhone(null);
        }

        if (userDTO.getBillingAddress() != null) {
            user.setBillingAddress(userDTO.getBillingAddress());
        }
        if (userDTO.getPreferences() != null) {
            user.setPreferences(userDTO.getPreferences());
        }

        // Persist changes
        User updatedUser = userService.save(user);

        UserDTO responseDto = userService.getUserForRole(updatedUser, updatedUser.getRole() != null ? updatedUser.getRole().name() : "GUEST");

        return ResponseEntity.ok(responseDto);
    }

}
