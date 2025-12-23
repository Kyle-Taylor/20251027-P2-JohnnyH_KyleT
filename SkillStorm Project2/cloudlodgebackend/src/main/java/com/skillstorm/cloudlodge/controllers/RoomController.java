package com.skillstorm.cloudlodge.controllers;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.skillstorm.cloudlodge.models.ResolvedRoom;
import com.skillstorm.cloudlodge.models.Room;
import com.skillstorm.cloudlodge.services.RoomService;
import com.skillstorm.cloudlodge.services.S3Service;
import org.springframework.security.core.Authentication;
import com.skillstorm.cloudlodge.models.User;


@RestController
@RequestMapping("/rooms")
public class RoomController {
    private final RoomService roomService;
    private final S3Service s3Service;

    public RoomController(RoomService roomService, S3Service s3Service) {
        this.roomService = roomService;
        this.s3Service = s3Service;
    }

    /*
    // GET all resolved rooms
    @GetMapping
    public ResponseEntity<List<ResolvedRoom>> getAllRooms() {
        try {
            List<ResolvedRoom> rooms = roomService.findAllResolved();
            return new ResponseEntity<>(rooms, HttpStatus.OK);
        }
        catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .header("Error", "Sorry! We have an internal Error! Please check back later.")
                    .build();
        }
    }
    */
    

    // GET all resolved rooms
    @GetMapping
    public ResponseEntity<List<ResolvedRoom>> getAllRooms(Authentication auth) {
        try {
            User user = (User) auth.getPrincipal();

            // Convert enum to string for consistency across app
            String role = user.getRole() != null ? user.getRole().name() : "GUEST";

            // Pass role string to service for filtering
            List<ResolvedRoom> rooms = roomService.findAllResolvedForRole(role);

            return new ResponseEntity<>(rooms, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .header("Error", "Sorry! We have an internal Error! Please check back later.")
                    .build();
        }
    }


    // GET room by ID
    @GetMapping("/{id}")
    public ResponseEntity<Room> getRoomById(@PathVariable String id) {
        try {
            Room room = roomService.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Room not found with id " + id));

            return new ResponseEntity<>(room, HttpStatus.OK);
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

    // CREATE new room (/rooms/create)
    @PostMapping("/create")
    public ResponseEntity<Room> createRoom(@RequestBody Room room) {
        try {
            Room createdRoom = roomService.save(room);
            return new ResponseEntity<>(createdRoom, HttpStatus.CREATED);
        }
        catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .header("Error", "Sorry! We have an internal Error! Please check back later.")
                    .build();
        }
    }

    // UPDATE room by ID
@PutMapping(value = "/update/{id}", consumes = "multipart/form-data")
public ResponseEntity<Room> updateRoom(
        @PathVariable String id,
        @RequestPart("room") Room room,
        @RequestPart(value = "images", required = false) List<MultipartFile> images,
        @RequestPart(value = "deleteImages", required = false) String deleteImagesJson
) {
    try {
        room.setId(id);

        // Load existing room to preserve current images
        Room existing = roomService.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Room not found"));

        List<String> currentImages = new ArrayList<>(
                existing.getImagesOverride() != null
                        ? existing.getImagesOverride()
                        : List.of()
        );

        // Remove deleted images
        if (deleteImagesJson != null && !deleteImagesJson.isBlank()) {
            List<String> deleteImages = new com.fasterxml.jackson.databind.ObjectMapper()
                    .readValue(
                            deleteImagesJson,
                            new com.fasterxml.jackson.databind.ObjectMapper()
                                    .getTypeFactory()
                                    .constructCollectionType(List.class, String.class)
                    );
            currentImages.removeAll(deleteImages);
        }

        // Upload and append new images
        if (images != null && !images.isEmpty()) {
            for (MultipartFile file : images) {
                currentImages.add(s3Service.uploadFile(file, "images"));
            }
        }

        room.setImagesOverride(currentImages.isEmpty() ? null : currentImages);

        Room updatedRoom = roomService.save(room);
        return new ResponseEntity<>(updatedRoom, HttpStatus.OK);

    } catch (Exception e) {
        return ResponseEntity.internalServerError()
                .header("Error", "Sorry! We have an internal Error! Please check back later.")
                .build();
    }
}


    // Set room active/inactive
    @PutMapping("/set-active/{id}")
    public ResponseEntity<Room> setRoomActiveStatus(
            @PathVariable String id,
            @RequestParam Boolean isActive
    ) {
        try {
            Room room = roomService.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Room not found with id " + id));
            room.setIsActive(isActive);
            Room updatedRoom = roomService.save(room);
            return new ResponseEntity<>(updatedRoom, HttpStatus.OK);
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

    // DELETE room by ID
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteRoom(@PathVariable String id) {
        try {
            roomService.delete(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .header("Error", "Sorry! We have an internal Error! Please check back later.")
                    .build();
        }
    }

    @GetMapping("/search")
    public Page<ResolvedRoom> searchRooms(
        @RequestParam(required = false) Integer roomNumber,
        @RequestParam(required = false) Boolean isActive,
        @RequestParam(required = false) String roomCategory,
        @RequestParam(required = false) String startDate,
        @RequestParam(required = false) String endDate,
        @RequestParam(required = false) Integer guests,
        Pageable pageable
    ) {
        return roomService.searchResolvedRooms(
            roomNumber,
            isActive,
            roomCategory,
            startDate,
            endDate,
            guests,
            pageable
        );
    }

}
