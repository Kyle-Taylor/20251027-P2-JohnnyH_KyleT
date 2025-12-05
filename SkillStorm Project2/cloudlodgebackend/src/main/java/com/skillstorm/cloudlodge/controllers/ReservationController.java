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

import com.skillstorm.cloudlodge.models.Reservation;
import com.skillstorm.cloudlodge.services.ReservationService;

@RestController
@RequestMapping("/reservations")
public class ReservationController {

    private final ReservationService reservationService;
    public ReservationController(ReservationService reservationService) {
        this.reservationService = reservationService;
    }

    // GET all reservations
    @GetMapping
    public ResponseEntity<List<Reservation>> getAllReservations() {
        try {
            return new ResponseEntity<>(reservationService.findAll(), HttpStatus.OK);
        }
        catch (Exception e) {
            return ResponseEntity.internalServerError()
                .header("Error", "Sorry! We have an internal Error! Please check back later.")
                .build();
        }
    }

    // GET reservation by ID
    @GetMapping("/{id}")
    public ResponseEntity<Reservation> getReservationById(@PathVariable String id) {
        try {
            Reservation reservation = reservationService.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Reservation not found with id " + id));

            return new ResponseEntity<>(reservation, HttpStatus.OK);
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

    // GET reservations by user
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Reservation>> getByUser(@PathVariable String userId) {
        try {
            return new ResponseEntity<>(reservationService.findByUserId(userId), HttpStatus.OK);
        }
        catch (Exception e) {
            return ResponseEntity.internalServerError()
                .header("Error", "Sorry! We have an internal Error! Please check back later.")
                .build();
        }
    }

    // GET reservations by room unit
    @GetMapping("/room/{roomUnitId}")
    public ResponseEntity<List<Reservation>> getByRoomUnit(@PathVariable String roomUnitId) {
        try {
            return new ResponseEntity<>(reservationService.findByRoomUnitId(roomUnitId), HttpStatus.OK);
        }
        catch (Exception e) {
            return ResponseEntity.internalServerError()
                .header("Error", "Sorry! We have an internal Error! Please check back later.")
                .build();
        }
    }

    // GET reservations by check-in date range
    @GetMapping("/checkin/{start}/{end}")
    public ResponseEntity<List<Reservation>> getByCheckInRange(@PathVariable String start,@PathVariable String end) {

        try {
            return new ResponseEntity<>(reservationService.findByCheckInRange(start, end), HttpStatus.OK);
        }
        catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                .header("Error", e.getMessage())
                .build();
        }
        catch (Exception e) {
            return ResponseEntity.badRequest()
                .header("Error", "Invalid date format. Use YYYY-MM-DD.")
                .build();
        }
    }

    // CREATE reservation
    @PostMapping("/create")
    public ResponseEntity<Reservation> createReservation(@RequestBody Reservation reservation) {
        try {
            Reservation saved = reservationService.save(reservation);
            return new ResponseEntity<>(saved, HttpStatus.CREATED);
        }
        catch (Exception e) {
            return ResponseEntity.internalServerError()
                .header("Error", "Sorry! We have an internal Error! Please check back later.")
                .build();
        }
    }

    // UPDATE reservation
    @PutMapping("/update/{id}")
    public ResponseEntity<Reservation> updateReservation(@PathVariable String id, @RequestBody Reservation reservation) {
        try {
            reservation.setId(id);
            Reservation updated = reservationService.save(reservation);
            return new ResponseEntity<>(updated, HttpStatus.OK);
        }
        catch (Exception e) {
            return ResponseEntity.internalServerError()
                .header("Error", "Sorry! We have an internal Error! Please check back later.")
                .build();
        }
    }

    // DELETE reservation
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteReservation(@PathVariable String id) {
        try {
            reservationService.delete(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        catch (Exception e) {
            return ResponseEntity.internalServerError()
                .header("Error", "Sorry! We have an internal Error! Please check back later.")
                .build();
        }
    }
}
