package com.skillstorm.cloudlodge.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.skillstorm.cloudlodge.models.User;
import com.skillstorm.cloudlodge.services.UserService;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;
    public UserController(UserService userService) {
        this.userService = userService;
    }

    // GET ALL USERS
    @GetMapping
    public ResponseEntity<Iterable<User>> getAllUsers() {
        try {
            Iterable<User> users = userService.findAll();
            return new ResponseEntity<>(users, HttpStatus.OK);
        }
        catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .header("Error", "Sorry! We have an internal Error! Please check back later.")
                    .build();
        }
    }   
    
    // GET /users/{id}
    @GetMapping("/{id}")
    public ResponseEntity<User> getUser(@PathVariable String id) {
        try {
            User user = userService.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("User not found with id " + id));

            return new ResponseEntity<>(user, HttpStatus.OK);
        }
        catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .header("Error", e.getMessage())
                    .build();
        }
        catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .header("Error", "Sorry! We have an internal Error! Please check back later.")
                    .build();
        }
    }


    // GET /users/email/{email}
    @GetMapping("/email/{email}")
    public ResponseEntity<User> getUserByEmail(@PathVariable String email) {
        try {
            User user = userService.findByEmail(email).orElseThrow(() -> new IllegalArgumentException("User not found with email " + email));
            return new ResponseEntity<>(user, HttpStatus.OK);
        }
        catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .header("Error: ", e.getMessage())
            .build();
        }
        catch (Exception e) {
            return ResponseEntity.internalServerError()
            .header("Error: ", "Sorry! We have an internal Error! Please check back later.")
            .build();
        }
    }

    // POST /users/create (create new user)
    @PostMapping("/create")
    public ResponseEntity<User> createUser(@RequestBody User user) {
        try {
            User createdUser = userService.save(user);
            return new ResponseEntity<>(createdUser, HttpStatus.CREATED);
        }
        catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .header("Error", "Sorry! We have an internal Error! Please check back later.")
                    .build();
        }
    }

    // PUT /users/update/{id} (update user)
    @PutMapping("/update/{id}")
    public ResponseEntity<User> updateUser(@PathVariable String id, @RequestBody User updatedUser) {
        try {
            updatedUser.setId(id);
            User updatedUserResult = userService.save(updatedUser);
            return new ResponseEntity<>(updatedUserResult, HttpStatus.OK);
        }
        catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .header("Error", "Sorry! We have an internal Error! Please check back later.")
                    .build();
        }
    }

    // DELETE /users/delete/{id}
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable String id) {
        try {
            userService.delete(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .header("Error", "Sorry! We have an internal Error! Please check back later.")
                    .build();
        }
    }
}
