package com.skillstorm.cloudlodge.dtos;
import com.skillstorm.cloudlodge.models.User.Role;
import com.skillstorm.cloudlodge.models.User.Address;
import com.skillstorm.cloudlodge.models.User.Preferences;
import com.skillstorm.cloudlodge.models.User.SavedPaymentMethod;

import java.time.Instant;
import java.util.List;

public class UserDTO {
    
    private String fullName;
    private String email;
    private String phone;
    private String authProvider;
    private String role;
    private String providerId;
    private String stripeCustomerId;
    private Address billingAddress;
    private Preferences preferences;
    private List<SavedPaymentMethod> savedPaymentMethods;
    private Instant createdAt;

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

    public String getProviderId() {
        return providerId;
    }

    public void setProviderId(String providerId) {
        this.providerId = providerId;
    }

    public String getStripeCustomerId() {
        return stripeCustomerId;
    }

    public void setStripeCustomerId(String stripeCustomerId) {
        this.stripeCustomerId = stripeCustomerId;
    }

    public Address getBillingAddress() {
        return billingAddress;
    }

    public void setBillingAddress(Address billingAddress) {
        this.billingAddress = billingAddress;
    }

    public Preferences getPreferences() {
        return preferences;
    }

    public void setPreferences(Preferences preferences) {
        this.preferences = preferences;
    }

    public List<SavedPaymentMethod> getSavedPaymentMethods() {
        return savedPaymentMethods;
    }

    public void setSavedPaymentMethods(List<SavedPaymentMethod> savedPaymentMethods) {
        this.savedPaymentMethods = savedPaymentMethods;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
