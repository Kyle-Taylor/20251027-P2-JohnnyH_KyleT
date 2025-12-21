package com.skillstorm.cloudlodge.repositories;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import com.skillstorm.cloudlodge.models.Reservation;

@Repository
public interface ReservationRepository extends MongoRepository<Reservation, String> {

    // find all reservations for a user
    List<Reservation> findByUserId(String userId);

    // find all reservations for a specific room unit
    List<Reservation> findByRoomUnitId(String roomUnitId);

    // find reservations that overlap a date range (useful for searching availability)
    List<Reservation> findByCheckInDateBetween(LocalDate start, LocalDate end);

    // Alternate query that accepts java.util.Date (MongoDB Date) to match stored DateTime values
    // Use this when documents contain full datetime values (e.g., 2025-03-15T00:00:00.000Z)
    @org.springframework.data.mongodb.repository.Query("{ 'checkInDate' : { $gte: ?0, $lte: ?1 } }")
    List<Reservation> findByCheckInDateBetweenDates(java.util.Date start, java.util.Date end);

    // find reservations where check-out falls within a range
    List<Reservation> findByCheckOutDateBetween(LocalDate start, LocalDate end);

    // find reservations that overlap a date range for a specific room unit
    @Query("""
    {
    'checkInDate': { $lt: ?1 },
    'checkOutDate': { $gt: ?0 }
    }
    """)
    List<Reservation> findOverlappingReservations(
        LocalDate start,
        LocalDate end
    );

}
