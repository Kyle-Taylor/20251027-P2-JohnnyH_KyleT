package com.skillstorm.cloudlodge.models;

import java.time.Instant;
import java.time.LocalDate;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

//stores all reservation records for guests booking rooms
@Document(collection = "reservations")
public class Reservation {

    @Id
    private String id;

    private String userId;            // user who booked the room
    private String roomUnitId;        // specific physical room (Room)
    
    private LocalDate checkInDate;    // YYYY-MM-DD
    private LocalDate checkOutDate;   // YYYY-MM-DD
    private Integer numGuests;        // number of guests staying
    
    private Double totalPrice;        // final calculated price at time of booking

    private Status status;
    public enum Status {CONFIRMED, CANCELLED, COMPLETED, PENDING_PAYMENT, MODIFIED}

    private String paymentId;

    @CreatedDate
    private Instant createdAt;

    //default constructor
    public Reservation() {}

    //getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getRoomUnitId() { return roomUnitId; }
    public void setRoomUnitId(String roomUnitId) { this.roomUnitId = roomUnitId; }

    public LocalDate getCheckInDate() { return checkInDate; }
    public void setCheckInDate(LocalDate checkInDate) { this.checkInDate = checkInDate; }

    public LocalDate getCheckOutDate() { return checkOutDate; }
    public void setCheckOutDate(LocalDate checkOutDate) { this.checkOutDate = checkOutDate; }

    public Integer getNumGuests() { return numGuests; }
    public void setNumGuests(Integer numGuests) { this.numGuests = numGuests; }

    public Double getTotalPrice() { return totalPrice; }
    public void setTotalPrice(Double totalPrice) { this.totalPrice = totalPrice; }

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }

    public String getPaymentId() { return paymentId; }
    public void setPaymentId(String paymentId) { this.paymentId = paymentId; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
