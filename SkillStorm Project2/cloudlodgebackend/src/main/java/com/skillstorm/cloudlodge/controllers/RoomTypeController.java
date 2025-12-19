package com.skillstorm.cloudlodge.controllers;

import java.util.ArrayList;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillstorm.cloudlodge.models.RoomType;
import com.skillstorm.cloudlodge.services.RoomTypeService;
import com.skillstorm.cloudlodge.services.S3Service;

@RestController
@RequestMapping("/roomtypes")
public class RoomTypeController {
    private final RoomTypeService roomTypeService;
    private final S3Service s3Service;
    private final ObjectMapper objectMapper;
    
    public RoomTypeController(RoomTypeService roomTypeService, S3Service s3Service) {
        this.roomTypeService = roomTypeService;
        this.s3Service = s3Service;
        this.objectMapper = new ObjectMapper();
    }

    // GET all room types
    @GetMapping
    public ResponseEntity<List<RoomType>> getAllRoomTypes() {
        try {
            List<RoomType> roomTypes = roomTypeService.getAllRoomTypes();
            return new ResponseEntity<>(roomTypes, HttpStatus.OK);
        }
        catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .header("Error", "Sorry! We have an internal Error! Please check back later.")
                    .build();
        }
    }

    // GET room type by ID
    @GetMapping("/{id}")
    public ResponseEntity<RoomType> getRoomTypeById(@PathVariable String id) {
        try {
            RoomType roomType = roomTypeService.getRoomTypeById(id)
                    .orElseThrow(() -> new IllegalArgumentException("RoomType not found with id " + id));

            return new ResponseEntity<>(roomType, HttpStatus.OK);
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
    // CREATE new room type
    @PostMapping(value = "/create", consumes = "multipart/form-data")
    public ResponseEntity<RoomType> createRoomType(
        @RequestPart("roomType") String roomTypeJson,
        @RequestPart(value = "images", required = false) List<MultipartFile> images
    ) {
        try {
            RoomType roomType = objectMapper.readValue(roomTypeJson, RoomType.class);

            List<String> imageUrls = new ArrayList<>();
            if (images != null) {
                for (MultipartFile file : images) {
                    imageUrls.add(s3Service.uploadFile(file, "images"));
                }
            }
            roomType.setImages(imageUrls);

            RoomType created = roomTypeService.save(roomType);
            return new ResponseEntity<>(created, HttpStatus.CREATED);
        }
        catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }


    //UPDATE room type by ID
    @PutMapping(value = "/update/{id}", consumes = "multipart/form-data")
    public ResponseEntity<RoomType> updateRoomType(
        @PathVariable String id, 
        @RequestPart("roomType") String roomTypeJson,
        @RequestPart(value = "images", required = false) List<MultipartFile> images,
        @RequestPart(value = "deleteImages", required = false) String deleteImagesJson
    ) {
        try {
            // Configure ObjectMapper to handle enums gracefully
            objectMapper.configure(com.fasterxml.jackson.databind.DeserializationFeature.READ_UNKNOWN_ENUM_VALUES_AS_NULL, false);
            objectMapper.configure(com.fasterxml.jackson.databind.DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
            
            // Parse roomType JSON string
            RoomType roomType = objectMapper.readValue(roomTypeJson, RoomType.class);
            roomType.setId(id);
            
            List<String> currentImages = 
                roomType.getImages() != null ? new ArrayList<>(roomType.getImages()) : new ArrayList<>();
            
            // Parse deleteImages JSON array
            List<String> deleteImagesList = new ArrayList<>();
            if (deleteImagesJson != null && !deleteImagesJson.trim().isEmpty()) {
                deleteImagesList = objectMapper.readValue(
                    deleteImagesJson,
                    objectMapper.getTypeFactory().constructCollectionType(List.class, String.class)
                );
            }
            
            // Remove image URLs from the database list
            // Note: Images remain in S3 and can be cleaned up later with a scheduled job
            if (!deleteImagesList.isEmpty()) {
                for (String url : deleteImagesList) {
                    currentImages.remove(url);
                }
            }

            // Upload and add new images
            if (images != null && !images.isEmpty()) {
                for (MultipartFile file : images) {
                    String url = s3Service.uploadFile(file, "images");
                    currentImages.add(url);
                }
            }

            // Set the updated images list back on the roomType
            roomType.setImages(currentImages);
            
            RoomType updatedRoomType = roomTypeService.save(roomType);
            
            return new ResponseEntity<>(updatedRoomType, HttpStatus.OK);
        }
        catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .header("Error", "Sorry! We have an internal Error! Please check back later.")
                    .build();
        }
    }

    // DELETE room type by ID
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteRoomType(@PathVariable String id) {
        try {
            roomTypeService.delete(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .header("Error", "Sorry! We have an internal Error! Please check back later.")
                    .build();
        }
    }
}