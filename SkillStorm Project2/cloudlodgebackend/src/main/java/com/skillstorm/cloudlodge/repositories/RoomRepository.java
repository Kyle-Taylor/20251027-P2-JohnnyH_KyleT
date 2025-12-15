package com.skillstorm.cloudlodge.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.skillstorm.cloudlodge.models.Room;

@Repository
public interface RoomRepository extends MongoRepository<Room, String> {
    Page<Room> findByRoomNumber(Integer roomNumber, Pageable pageable);
    Page<Room> findByIsActive(Boolean isActive, Pageable pageable);
    Page<Room> findByRoomNumberAndIsActive(Integer roomNumber, Boolean isActive, Pageable pageable);
}

