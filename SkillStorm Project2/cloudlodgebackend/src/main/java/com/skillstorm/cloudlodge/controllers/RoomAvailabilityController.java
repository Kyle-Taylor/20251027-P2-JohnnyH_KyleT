package com.skillstorm.cloudlodge.controllers;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.skillstorm.cloudlodge.models.RoomAvailability;
import com.skillstorm.cloudlodge.services.RoomAvailabilityService;

@RestController
@RequestMapping("/availability")
public class RoomAvailabilityController {

    private final RoomAvailabilityService availabilityService;

    public RoomAvailabilityController(RoomAvailabilityService availabilityService) {
        this.availabilityService = availabilityService;
    }

    // GET all availability entries
    @GetMapping
    public ResponseEntity<List<RoomAvailability>> getAll() {
        try {
            List<RoomAvailability> all = availabilityService.findAll();
            return new ResponseEntity<>(all, HttpStatus.OK);
        }
        catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .header("Error", "Sorry! We have an internal Error! Please check back later.")
                    .build();
        }
    }

    // GET availability for a specific roomUnitId
    @GetMapping("/room/{roomUnitId}")
    public ResponseEntity<List<RoomAvailability>> getByRoomUnit(@PathVariable String roomUnitId) {
        try {
            List<RoomAvailability> results = availabilityService.findByRoomUnitId(roomUnitId);
            return new ResponseEntity<>(results, HttpStatus.OK);
        }
        catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .header("Error", "Sorry! We have an internal Error! Please check back later.")
                    .build();
        }
    }

    // GET availability by date (YYYY-MM-DD) - parse to LocalDate
    @GetMapping("/date/{date}")
    public ResponseEntity<List<RoomAvailability>> getByDate(@PathVariable String date) {
        try {
            LocalDate parsed = LocalDate.parse(date);
            List<RoomAvailability> results = availabilityService.findByDate(parsed);
            return new ResponseEntity<>(results, HttpStatus.OK);
        }
        catch (DateTimeParseException e) {
            return ResponseEntity.badRequest()
                    .header("Error", "Invalid date format. Use YYYY-MM-DD.")
                    .build();
        }
        catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .header("Error", "Sorry! We have an internal Error! Please check back later.")
                    .build();
        }
    }


    // GET availability by reservationId
    @GetMapping("/reservation/{reservationId}")
    public ResponseEntity<List<RoomAvailability>> getByReservation(@PathVariable String reservationId) {
        try {
            List<RoomAvailability> results = availabilityService.findByReservationId(reservationId);
            return new ResponseEntity<>(results, HttpStatus.OK);
        }
        catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .header("Error", "Sorry! We have an internal Error! Please check back later.")
                    .build();
        }
    }

    // POST create availability entry
    @PostMapping("/create")
    public ResponseEntity<RoomAvailability> create(@RequestBody RoomAvailability availability) {
        try {
            RoomAvailability created = availabilityService.save(availability);
            return new ResponseEntity<>(created, HttpStatus.CREATED);
        }
        catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .header("Error", "Sorry! We have an internal Error! Please check back later.")
                    .build();
        }
    }

    // DELETE availability entry by ID
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        try {
            availabilityService.delete(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .header("Error", "Sorry! We have an internal Error! Please check back later.")
                    .build();
        }
    }
}
