package com.skillstorm.cloudlodge.repositories;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.skillstorm.cloudlodge.models.RoomType;

@Repository
public interface RoomTypeRepository extends MongoRepository<RoomType, String> {
    
}
