package com.skillstorm.cloudlodge.repositories;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import com.skillstorm.cloudlodge.models.RoomAvailability;

@Repository
public interface RoomAvailabilityRepository extends MongoRepository<RoomAvailability, String> {

    List<RoomAvailability> findByRoomUnitId(String roomUnitId);
    List<RoomAvailability> findByDate(LocalDate date);
    List<RoomAvailability> findByReservationId(String reservationId);

    void deleteByReservationId(String reservationId);
    @Query("{ 'date': { $gte: ?0, $lt: ?1 } }")
    List<RoomAvailability> findBookedInRange(LocalDate start,LocalDate end);
}
