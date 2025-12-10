package com.skillstorm.cloudlodge.repositories;

import java.time.LocalDate;
import java.util.Date;
import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.skillstorm.cloudlodge.models.RoomAvailability;

@Repository
public interface RoomAvailabilityRepository extends MongoRepository<RoomAvailability, String> {

    List<RoomAvailability> findByRoomUnitId(String roomUnitId);
    List<RoomAvailability> findByDate(LocalDate date);

    // Match when the stored `date` field is a MongoDB Date (full datetime).
    // Query checks for stored DateTime falling between start and end (inclusive).
    @org.springframework.data.mongodb.repository.Query("{ 'date': { $gte: ?0, $lte: ?1 } }")
    List<RoomAvailability> findByDateBetweenDates(Date start, Date end);
    List<RoomAvailability> findByReservationId(String reservationId);
}
