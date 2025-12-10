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

import com.skillstorm.cloudlodge.models.ResolvedRoom;
import com.skillstorm.cloudlodge.models.Room;
import com.skillstorm.cloudlodge.services.RoomService;


@RestController
@RequestMapping("/rooms")
public class RoomController {
    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

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

    //UPDATE room by ID
    @PutMapping("/update/{id}")
    public ResponseEntity<Room> updateRoom(@PathVariable String id, @RequestBody Room room) {
        try {
            room.setId(id);
            Room updatedRoom = roomService.save(room);
            return new ResponseEntity<>(updatedRoom, HttpStatus.OK);
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

}
