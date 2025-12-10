package com.skillstorm.cloudlodge.controllers;

import java.util.List;

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

import com.skillstorm.cloudlodge.models.RoomType;
import com.skillstorm.cloudlodge.services.RoomTypeService;

@RestController
@RequestMapping("/roomtypes")
public class RoomTypeController {
    private final RoomTypeService roomTypeService;
    public RoomTypeController(RoomTypeService roomTypeService) {
        this.roomTypeService = roomTypeService;
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

    // CREATE new room type (/roomtypes/create)
    @PostMapping("/create")
    public ResponseEntity<RoomType> createRoomType(@RequestBody RoomType roomType) {
        try {
            RoomType createdRoomType = roomTypeService.save(roomType);
            return new ResponseEntity<>(createdRoomType, HttpStatus.CREATED);
        }
        catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .header("Error", "Sorry! We have an internal Error! Please check back later.")
                    .build();
        }
    }

    //UPDATE room type by ID
    @PutMapping("/update/{id}")
    public ResponseEntity<RoomType> updateRoomType(@PathVariable String id, @RequestBody RoomType roomType) {
        try {
            roomType.setId(id);
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
