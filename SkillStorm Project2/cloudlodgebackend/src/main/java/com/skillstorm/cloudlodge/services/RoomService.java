package com.skillstorm.cloudlodge.services;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.skillstorm.cloudlodge.models.Room;
import com.skillstorm.cloudlodge.repositories.RoomRepository;

@Service
public class RoomService {
    private final RoomRepository roomRepository;
    public RoomService(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }

    // Get all rooms
    public List<Room> findAll() {
        return roomRepository.findAll();
    }

    // Get room by ID
    public Optional<Room> findById(String id) {
        return roomRepository.findById(id);
    }

    // Create or update room
    public Room save(Room room) {
        return roomRepository.save(room);
    }

    // Delete room
    public void delete(String id) {
        roomRepository.deleteById(id);
    }
}
