package com.skillstorm.cloudlodge.services;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import com.skillstorm.cloudlodge.models.RoomAvailability;
import com.skillstorm.cloudlodge.repositories.RoomAvailabilityRepository;

@Service
public class RoomAvailabilityService {

    private final RoomAvailabilityRepository roomAvailabilityRepository;

    public RoomAvailabilityService(RoomAvailabilityRepository roomAvailabilityRepository) {
        this.roomAvailabilityRepository = roomAvailabilityRepository;
    }

    public List<RoomAvailability> findAll() {
        return roomAvailabilityRepository.findAll();
    }

    public List<RoomAvailability> findByRoomUnitId(String roomUnitId) {
        return roomAvailabilityRepository.findByRoomUnitId(roomUnitId);
    }

    public List<RoomAvailability> findByDate(LocalDate date) {
        return roomAvailabilityRepository.findByDate(date);
    }

    public List<RoomAvailability> findByReservationId(String reservationId) {
        return roomAvailabilityRepository.findByReservationId(reservationId);
    }

    public List<RoomAvailability> findBookedInRange(
            LocalDate start,
            LocalDate end
    ) {
        return roomAvailabilityRepository.findBookedInRange(start, end);
    }

    public RoomAvailability save(RoomAvailability availability) {
        return roomAvailabilityRepository.save(availability);
    }

    public void delete(String id) {
        roomAvailabilityRepository.deleteById(id);
    }

    public void deleteByReservationId(String reservationId) {
        roomAvailabilityRepository.deleteByReservationId(reservationId);
    }
}
