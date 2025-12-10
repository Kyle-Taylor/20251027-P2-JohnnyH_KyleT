package com.skillstorm.cloudlodge.models;

import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "rooms")
public class Room {

    @Id
    private String id;

    private Integer roomNumber;          // unique physical room number in hotel
    private String roomTypeId;           // reference to RoomType document
    private Boolean isActive;            // managers can deactivate rooms (construction, maintenance, etc.) (does not mean booked/unbooked)

    private Double priceOverride;
    private List<String> amenitiesOverride;
    private String descriptionOverride;
    private List<String> imagesOverride;
    private Integer maxGuestsOverride;

    //default constructor
    public Room() {}

    //getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public Integer getRoomNumber() { return roomNumber; }
    public void setRoomNumber(Integer roomNumber) { this.roomNumber = roomNumber; }

    public String getRoomTypeId() { return roomTypeId; }
    public void setRoomTypeId(String roomTypeId) { this.roomTypeId = roomTypeId; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public Double getPriceOverride() { return priceOverride; }
    public void setPriceOverride(Double priceOverride) { this.priceOverride = priceOverride; }

    public List<String> getAmenitiesOverride() { return amenitiesOverride; }
    public void setAmenitiesOverride(List<String> amenitiesOverride) { this.amenitiesOverride = amenitiesOverride; }

    public String getDescriptionOverride() { return descriptionOverride; }
    public void setDescriptionOverride(String descriptionOverride) { this.descriptionOverride = descriptionOverride; }

    public List<String> getImagesOverride() { return imagesOverride; }
    public void setImagesOverride(List<String> imagesOverride) { this.imagesOverride = imagesOverride; }

    public Integer getMaxGuestsOverride() { return maxGuestsOverride; }
    public void setMaxGuestsOverride(Integer maxGuestsOverride) { this.maxGuestsOverride = maxGuestsOverride; }
}
