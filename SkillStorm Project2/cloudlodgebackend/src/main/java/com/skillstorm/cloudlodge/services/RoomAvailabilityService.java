package com.skillstorm.cloudlodge.services;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import com.skillstorm.cloudlodge.models.RoomAvailability;
import com.skillstorm.cloudlodge.repositories.RoomAvailabilityRepository;

@Service
public class RoomAvailabilityService {

    private final RoomAvailabilityRepository repo;
    public RoomAvailabilityService(RoomAvailabilityRepository repo) {
        this.repo = repo;
    }

    // Get all room availabilities
    public List<RoomAvailability> findAll() {
        return repo.findAll();
    }

    // Get room availability for a room unit
    public List<RoomAvailability> findByRoomUnitId(String roomUnitId) {
        return repo.findByRoomUnitId(roomUnitId);
    }

    // Get room availability by date (LocalDate)
    // Convert LocalDate to UTC Date range and attempt to match DateTime-stored documents.
    public List<RoomAvailability> findByDate(LocalDate date) {
        try {
            java.time.ZoneOffset zone = java.time.ZoneOffset.UTC;
            java.time.Instant startInstant = date.atStartOfDay().toInstant(zone);
            java.time.Instant endInstant = date.plusDays(1).atStartOfDay().toInstant(zone).minusNanos(1);

            java.util.Date startDate = java.util.Date.from(startInstant);
            java.util.Date endDate = java.util.Date.from(endInstant);

            return repo.findByDateBetweenDates(startDate, endDate);
        }
        catch (Exception e) {
            // Fallback to direct LocalDate equality if the repository supports it
            return repo.findByDate(date);
        }
    }

    // Get room availability by reservation ID
    public List<RoomAvailability> findByReservationId(String reservationId) {
        return repo.findByReservationId(reservationId);
    }

    // Save or update room availability
    public RoomAvailability save(RoomAvailability availability) {
        return repo.save(availability);
    }

    // Delete room availability by ID
    public void delete(String id) {
        repo.deleteById(id);
    }
}
