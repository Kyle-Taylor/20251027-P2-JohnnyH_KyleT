package com.skillstorm.cloudlodge.models;

import java.time.LocalDate;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

//tracks availability per room per day
//each booked date for a room gets its own document
@Document(collection = "roomAvailability")
public class RoomAvailability {

    @Id
    private String id;

    private String roomUnitId;
    private LocalDate date;         // single booked date (YYYY-MM-DD)
    private String reservationId;   // reservation that owns this date

    //default constructor
    public RoomAvailability() {}

    //getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getRoomUnitId() { return roomUnitId; }
    public void setRoomUnitId(String roomUnitId) { this.roomUnitId = roomUnitId; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public String getReservationId() { return reservationId; }
    public void setReservationId(String reservationId) { this.reservationId = reservationId; }
}
