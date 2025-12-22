package com.skillstorm.cloudlodge.services;

import java.util.Optional;

import org.springframework.stereotype.Service;

import com.skillstorm.cloudlodge.dtos.UserDTO;
import com.skillstorm.cloudlodge.models.User;
import com.skillstorm.cloudlodge.repositories.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Get user by ID
    public Optional<User> findById(String id) {
        return userRepository.findById(id);
    }

    // Get user by email
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    // Create or update user
    public User save(User user) {
        return userRepository.save(user);
    }

    // Delete user
    public void delete(String id) {
        userRepository.deleteById(id);
    }

    public UserDTO getUserForRole(User user, String role) {
    // TODO implement role-based filtering here
    return new UserDTO(
        user.getFullName(),
        user.getEmail(),
        user.getPhone(),
        user.getAuthProvider(),
        role
    );
}

}
