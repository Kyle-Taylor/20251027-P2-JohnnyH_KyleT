package com.skillstorm.cloudlodge.services;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.skillstorm.cloudlodge.models.RoomType;
import com.skillstorm.cloudlodge.repositories.RoomTypeRepository;

@Service
public class RoomTypeService {
    private final RoomTypeRepository roomTypeRepository;
    public RoomTypeService(RoomTypeRepository roomTypeRepository) {
        this.roomTypeRepository = roomTypeRepository;
    }

    // Get all room
    public List<RoomType> getAllRoomTypes() {
        return roomTypeRepository.findAll();
    }

    // get room by ID
    public Optional<RoomType> getRoomTypeById(String id) {
        return roomTypeRepository.findById(id);
    }

    // Create or update room
    public RoomType save(RoomType roomType) {
        return roomTypeRepository.save(roomType);
    }

    // Delete room
    public void delete(String id) {
        roomTypeRepository.deleteById(id);
    }
}
