package com.skillstorm.cloudlodge.models;

import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

//allows us to store less redundant data in Room documents by referencing RoomTypes that multiple rooms use
@Document(collection = "roomTypes")
public class RoomType {

    @Id
    private String id;

    private RoomCategory roomCategory;
    private Double pricePerNight;
    private Integer maxGuests;
    private List<String> amenities;
    private String description;
    private List<String> images;

    public enum RoomCategory {STANDARD,DELUXE,SUITE,PENTHOUSE}

    //default constructor
    public RoomType() {}

    //getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public RoomCategory getRoomCategory() { return roomCategory; }
    public void setRoomCategory(RoomCategory roomCategory) { this.roomCategory = roomCategory; }

    public Double getPricePerNight() { return pricePerNight; }
    public void setPricePerNight(Double pricePerNight) { this.pricePerNight = pricePerNight; }

    public Integer getMaxGuests() { return maxGuests; }
    public void setMaxGuests(Integer maxGuests) { this.maxGuests = maxGuests; }

    public List<String> getAmenities() { return amenities; }
    public void setAmenities(List<String> amenities) { this.amenities = amenities; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public List<String> getImages() { return images; }
    public void setImages(List<String> images) { this.images = images; }
}
