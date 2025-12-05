package com.skillstorm.cloudlodge.services;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.skillstorm.cloudlodge.models.Reservation;
import com.skillstorm.cloudlodge.repositories.ReservationRepository;

@Service
public class ReservationService {

    private final ReservationRepository reservationRepository;
    public ReservationService(ReservationRepository reservationRepository) {
        this.reservationRepository = reservationRepository;
    }

    // Get all reservations
    public List<Reservation> findAll() {
        return reservationRepository.findAll();
    }

    // Get reservation by ID
    public Optional<Reservation> findById(String id) {
        return reservationRepository.findById(id);
    }

    // Get reservations by user ID
    public List<Reservation> findByUserId(String userId) {
        return reservationRepository.findByUserId(userId);
    }

    // Get reservations by room unit
    public List<Reservation> findByRoomUnitId(String roomUnitId) {
        return reservationRepository.findByRoomUnitId(roomUnitId);
    }

    // Search by check-in range (YYYY-MM-DD)
    // Convert LocalDate to UTC Date range to match MongoDB DateTime values stored in the DB.
    public List<Reservation> findByCheckInRange(String start, String end) {
        LocalDate s = LocalDate.parse(start);
        LocalDate e = LocalDate.parse(end);

        // Create start instant at start of day UTC, and end instant at end of day UTC
        java.time.ZoneOffset zone = java.time.ZoneOffset.UTC;
        java.time.Instant startInstant = s.atStartOfDay().toInstant(zone);
        // end of day: set to last nanosecond of the day
        java.time.Instant endInstant = e.plusDays(1).atStartOfDay().toInstant(zone).minusNanos(1);

        java.util.Date startDate = java.util.Date.from(startInstant);
        java.util.Date endDate = java.util.Date.from(endInstant);

        return reservationRepository.findByCheckInDateBetweenDates(startDate, endDate);
    }

    // Create or update reservation
    public Reservation save(Reservation reservation) {
        return reservationRepository.save(reservation);
    }

    // Delete reservation
    public void delete(String id) {
        reservationRepository.deleteById(id);
    }
}
