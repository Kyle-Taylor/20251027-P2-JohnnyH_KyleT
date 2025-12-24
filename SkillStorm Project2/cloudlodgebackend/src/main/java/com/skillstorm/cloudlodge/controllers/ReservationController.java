package com.skillstorm.cloudlodge.controllers;

import java.time.LocalDate;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.skillstorm.cloudlodge.models.Reservation;
import com.skillstorm.cloudlodge.models.RoomAvailability;
import com.skillstorm.cloudlodge.services.ReservationService;
import com.skillstorm.cloudlodge.services.RoomAvailabilityService;

@RestController
@RequestMapping("/reservations")
public class ReservationController {

    private final ReservationService reservationService;
    private final RoomAvailabilityService roomAvailabilityService;

    public ReservationController(ReservationService reservationService, RoomAvailabilityService roomAvailabilityService) {
        this.reservationService = reservationService;
        this.roomAvailabilityService = roomAvailabilityService;
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
    public ResponseEntity<Reservation> createReservation(@RequestBody Reservation reservation, Authentication authentication) {
        try {
            if (authentication != null && authentication.getPrincipal() instanceof com.skillstorm.cloudlodge.models.User userPrincipal) {
                if (reservation.getUserId() == null || reservation.getUserId().isBlank()) {
                    reservation.setUserId(userPrincipal.getId());
                }
            }

            Reservation saved = reservationService.save(reservation);
            // Create RoomAvailability entries for each day in the reservation
            LocalDate start = saved.getCheckInDate();
            LocalDate end = saved.getCheckOutDate();
            if (start != null && end != null && start.isBefore(end)) {
                for (LocalDate date = start; date.isBefore(end); date = date.plusDays(1)) {
                    RoomAvailability availability = new RoomAvailability();
                    availability.setRoomUnitId(saved.getRoomUnitId());
                    availability.setDate(date);
                    availability.setReservationId(saved.getId());
                    roomAvailabilityService.save(availability);
                }
            }
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
