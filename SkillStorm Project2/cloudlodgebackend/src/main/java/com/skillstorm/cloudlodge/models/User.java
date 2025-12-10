package com.skillstorm.cloudlodge.models;

import java.time.Instant;
import java.util.List;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "users")
public class User {

    @Id
    private String id;
    
    private String authProvider;     // google, facebook, etc.
    private String providerId;
    private String email;
    private String password;
    private String fullName;
    private Role role;
    public enum Role {GUEST,ADMIN,MANAGER}; //only allow 3 types of user roles
    private String phone;
    private List<SavedPaymentMethod> savedPaymentMethods;
    private Address billingAddress;
    private Preferences preferences;

    @CreatedDate
    private Instant createdAt;

    public static class SavedPaymentMethod {
        private String stripePaymentMethodId;
        private String brand;
        private String last4;

        //default constructor for saved payment method
        public SavedPaymentMethod() {}

        //getters and setters
        public String getStripePaymentMethodId() {return stripePaymentMethodId;}
        public void setStripePaymentMethodId(String stripePaymentMethodId) {this.stripePaymentMethodId = stripePaymentMethodId;}

        public String getBrand() {return brand;}
        public void setBrand(String brand) {this.brand = brand;}

        public String getLast4() {return last4;}
        public void setLast4(String last4) {this.last4 = last4;}
    }

    public static class Preferences {
        private String bedType;
        private Boolean smoking;
        
        //default constructor for preferences
        public Preferences() {}

        //getters and setters for preferences
        public String getBedType() {return bedType;}
        public void setBedType(String bedType) {this.bedType = bedType;}

        public Boolean getSmoking() {return smoking;}
        public void setSmoking(Boolean smoking) {this.smoking = smoking;}
    }

    public static class Address {
        private String street;
        private String apartment; // optional
        private String city;
        private String state;
        private String zip;
        private String country;

        //default constructor for address
        public Address() {}

        //getters and setters for address
        public String getStreet() {return street;}
        public void setStreet(String street) {this.street = street;}

        public String getApartment() { return apartment;}
        public void setApartment(String apartment) {this.apartment = apartment;}

        public String getCity() {return city;}
        public void setCity(String city) {this.city = city;}

        public String getState() {return state;}
        public void setState(String state) {this.state = state;}

        public String getZip() {return zip;}
        public void setZip(String zip) {this.zip = zip;}

        public String getCountry() {return country;}
        public void setCountry(String country) {this.country = country;}
    }

    //default constructor for user class
    public User() {}
    
    //getters and setters for user class
    public String getId() {return id;}
    public void setId(String id) {this.id = id;}

    public String getAuthProvider() {return authProvider;}
    public void setAuthProvider(String authProvider) {this.authProvider = authProvider;}

    public String getProviderId() {return providerId;}
    public void setProviderId(String providerId) {this.providerId = providerId;}
    
    public String getEmail() {return email;}
    public void setEmail(String email) {this.email = email;}

    public String getFullName() {return fullName;}
    public void setFullName(String fullName) {this.fullName = fullName;}

    public Role getRole() {return role;}
    public void setRole(Role role) {this.role = role;}

    public String getPhone() {return phone;}
    public void setPhone(String phone) {this.phone = phone;}

    public List<SavedPaymentMethod> getSavedPaymentMethods() {return savedPaymentMethods;}
    public void setSavedPaymentMethods(List<SavedPaymentMethod> savedPaymentMethods) {this.savedPaymentMethods = savedPaymentMethods;}

    public Address getBillingAddress() {return billingAddress;}
    public void setBillingAddress(Address billingAddress) {this.billingAddress = billingAddress;}

    public Preferences getPreferences() {return preferences;}
    public void setPreferences(Preferences preferences) {this.preferences = preferences;}

    public Instant getCreatedAt() {return createdAt;}
    public void setCreatedAt(Instant createdAt) {this.createdAt = createdAt;}

    public String getPassword() {return password;}

    public void setPassword(String password) {this.password = password;}
}
