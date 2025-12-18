package com.skillstorm.cloudlodge.services;


import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.skillstorm.cloudlodge.models.ResolvedRoom;
import com.skillstorm.cloudlodge.models.Room;
import com.skillstorm.cloudlodge.models.RoomAvailability;
import com.skillstorm.cloudlodge.models.RoomType;
import com.skillstorm.cloudlodge.repositories.RoomRepository;

@Service
public class RoomService {
    private final RoomRepository roomRepository;
    private final RoomTypeService roomTypeService;
    private final RoomAvailabilityService roomAvailabilityService;

    public RoomService(RoomRepository roomRepository, RoomTypeService roomTypeService, RoomAvailabilityService roomAvailabilityService) {
        this.roomRepository = roomRepository;
        this.roomTypeService = roomTypeService;
        this.roomAvailabilityService = roomAvailabilityService;
    }

    // Get all resolved rooms (Room merged with RoomType)
    public List<ResolvedRoom> findAllResolved() {
        List<Room> rooms = roomRepository.findAll();
        List<ResolvedRoom> resolvedRooms = new ArrayList<>();
        for (Room room : rooms) {
            RoomType roomType = null;
            if (room.getRoomTypeId() != null) {
                roomType = roomTypeService.getRoomTypeById(room.getRoomTypeId()).orElse(null);
            }
            resolvedRooms.add(mergeRoomWithType(room, roomType));
        }
        return resolvedRooms;
    }

    private ResolvedRoom mergeRoomWithType(Room room, RoomType roomType) {
        // Use override if present, else fallback to roomType
        Double price = room.getPriceOverride() != null ? room.getPriceOverride() : (roomType != null ? roomType.getPricePerNight() : null);
        List<String> amenities = room.getAmenitiesOverride() != null ? room.getAmenitiesOverride() : (roomType != null ? roomType.getAmenities() : null);
        String description = room.getDescriptionOverride() != null ? room.getDescriptionOverride() : (roomType != null ? roomType.getDescription() : null);
        // Combine RoomType images (base) with imagesOverride (uploaded)
        List<String> images = new java.util.ArrayList<>();
        if (roomType != null && roomType.getImages() != null) {
            images.addAll(roomType.getImages());
        }
        if (room.getImagesOverride() != null) {
            images.addAll(room.getImagesOverride());
        }
        if (images.isEmpty()) {
            images = null;
        }
        Integer maxGuests = room.getMaxGuestsOverride() != null ? room.getMaxGuestsOverride() : (roomType != null ? roomType.getMaxGuests() : null);
        String roomCategory = roomType != null && roomType.getRoomCategory() != null ? roomType.getRoomCategory().name() : null;

        // Determine if the room is booked for today
        boolean booked = false;
        try {
            List<RoomAvailability> availabilities = roomAvailabilityService.findByRoomUnitId(room.getId());
            LocalDate today = LocalDate.now();
            booked = availabilities.stream().anyMatch(a -> today.equals(a.getDate()));
        } catch (Exception e) {
            // If error, assume not booked
        }

        return new ResolvedRoom(
            room.getId(),
            room.getRoomNumber(),
            room.getIsActive(),
            price,
            amenities,
            description,
            images,
            maxGuests,
            room.getRoomTypeId(),
            roomCategory,
            booked
        );
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

    public Page<ResolvedRoom> searchResolvedRooms(
    Integer roomNumber,
    Boolean isActive,
    String roomCategory,
    Pageable pageable
) {
    List<Room> rooms;

    if (roomNumber != null && isActive != null) {
        rooms = roomRepository
            .findByRoomNumberAndIsActive(roomNumber, isActive, Pageable.unpaged())
            .getContent();
    } else if (roomNumber != null) {
        rooms = roomRepository
            .findByRoomNumber(roomNumber, Pageable.unpaged())
            .getContent();
    } else if (isActive != null) {
        rooms = roomRepository
            .findByIsActive(isActive, Pageable.unpaged())
            .getContent();
    } else {
        rooms = roomRepository.findAll();
    }

    List<ResolvedRoom> filtered = new ArrayList<>();

    for (Room room : rooms) {
        RoomType roomType = room.getRoomTypeId() != null
            ? roomTypeService.getRoomTypeById(room.getRoomTypeId()).orElse(null)
            : null;

        ResolvedRoom resolved = mergeRoomWithType(room, roomType);

        if (roomCategory != null &&
            (resolved.getRoomCategory() == null ||
             !resolved.getRoomCategory().equalsIgnoreCase(roomCategory))
        ) {
            continue;
        }

        filtered.add(resolved);
    }

    int start = (int) pageable.getOffset();
    int end = Math.min(start + pageable.getPageSize(), filtered.size());
    List<ResolvedRoom> pageContent =
        start > end ? List.of() : filtered.subList(start, end);

    return new PageImpl<>(
        pageContent,
        pageable,
        filtered.size()
    );
}

}
