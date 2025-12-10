package com.skillstorm.cloudlodge.repositories;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.skillstorm.cloudlodge.models.Room;

@Repository
public interface RoomRepository extends MongoRepository<Room, String> {
    
}
