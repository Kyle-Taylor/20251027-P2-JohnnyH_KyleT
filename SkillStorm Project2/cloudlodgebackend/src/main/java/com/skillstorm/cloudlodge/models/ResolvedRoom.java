package com.skillstorm.cloudlodge.models;

import java.util.List;

public class ResolvedRoom {
    private String id;
    private Integer roomNumber;
    private Boolean isActive;
    private Double price;
    private List<String> amenities;
    private String description;
    private List<String> images;
    private Integer maxGuests;
    private String roomTypeId;
    private String roomCategory;
    private boolean booked;

    // Constructors
    public ResolvedRoom() {}

    public ResolvedRoom(String id, Integer roomNumber, Boolean isActive, Double price, List<String> amenities, String description, List<String> images, Integer maxGuests, String roomTypeId, String roomCategory, boolean booked) {
        this.id = id;
        this.roomNumber = roomNumber;
        this.isActive = isActive;
        this.price = price;
        this.amenities = amenities;
        this.description = description;
        this.images = images;
        this.maxGuests = maxGuests;
        this.roomTypeId = roomTypeId;
        this.roomCategory = roomCategory;
        this.booked = booked;
    }
    public boolean isBooked() { return booked; }
    public void setBooked(boolean booked) { this.booked = booked; }

    // Getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public Integer getRoomNumber() { return roomNumber; }
    public void setRoomNumber(Integer roomNumber) { this.roomNumber = roomNumber; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public List<String> getAmenities() { return amenities; }
    public void setAmenities(List<String> amenities) { this.amenities = amenities; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public List<String> getImages() { return images; }
    public void setImages(List<String> images) { this.images = images; }

    public Integer getMaxGuests() { return maxGuests; }
    public void setMaxGuests(Integer maxGuests) { this.maxGuests = maxGuests; }

    public String getRoomTypeId() { return roomTypeId; }
    public void setRoomTypeId(String roomTypeId) { this.roomTypeId = roomTypeId; }

    public String getRoomCategory() { return roomCategory; }
    public void setRoomCategory(String roomCategory) { this.roomCategory = roomCategory; }
}
