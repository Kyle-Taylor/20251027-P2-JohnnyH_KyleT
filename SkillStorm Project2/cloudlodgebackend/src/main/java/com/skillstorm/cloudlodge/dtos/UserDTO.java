package com.skillstorm.cloudlodge.dtos;
import com.skillstorm.cloudlodge.models.User.Role;

public class UserDTO {
    
    private String fullName;
    private String email;
    private String phone;
    private String authProvider;
    private String role;

    public UserDTO() {
    }

    public UserDTO(String fullName, String email, String phone, String authProvider, String role) {
        this.fullName = fullName;
        this.email = email;
        this.phone = phone;
        this.authProvider = authProvider;
        this.role = role;
    }

    // Getters and setters
    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getAuthProvider() {
        return authProvider;
    }

    public void setAuthProvider(String authProvider) {
        this.authProvider = authProvider;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}
