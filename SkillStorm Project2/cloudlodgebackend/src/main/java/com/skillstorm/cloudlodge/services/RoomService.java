package com.skillstorm.cloudlodge.services;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.skillstorm.cloudlodge.models.ResolvedRoom;
import com.skillstorm.cloudlodge.models.Room;
import com.skillstorm.cloudlodge.models.RoomAvailability;
import com.skillstorm.cloudlodge.models.RoomType;
import com.skillstorm.cloudlodge.repositories.ReservationRepository;
import com.skillstorm.cloudlodge.repositories.RoomRepository;

@Service
public class RoomService {

    private final RoomRepository roomRepository;
    private final RoomTypeService roomTypeService;
    private final RoomAvailabilityService roomAvailabilityService;
    private final ReservationRepository reservationRepository;

    public RoomService(
        RoomRepository roomRepository,
        RoomTypeService roomTypeService,
        RoomAvailabilityService roomAvailabilityService,
        ReservationRepository reservationRepository
    ) {
        this.roomRepository = roomRepository;
        this.roomTypeService = roomTypeService;
        this.roomAvailabilityService = roomAvailabilityService;
        this.reservationRepository = reservationRepository;
    }

    /* =========================
       BASE MERGE (NO AVAILABILITY)
       ========================= */
    private ResolvedRoom mergeRoomWithType(Room room, RoomType roomType) {

        Double price = room.getPriceOverride() != null
            ? room.getPriceOverride()
            : roomType != null ? roomType.getPricePerNight() : null;

        List<String> amenities = room.getAmenitiesOverride() != null
            ? room.getAmenitiesOverride()
            : roomType != null ? roomType.getAmenities() : null;

        String description = room.getDescriptionOverride() != null
            ? room.getDescriptionOverride()
            : roomType != null ? roomType.getDescription() : null;

        List<String> images = new ArrayList<>();
        if (roomType != null && roomType.getImages() != null) {
            images.addAll(roomType.getImages());
        }
        if (room.getImagesOverride() != null) {
            images.addAll(room.getImagesOverride());
        }
        if (images.isEmpty()) images = null;

        Integer maxGuests = room.getMaxGuestsOverride() != null
            ? room.getMaxGuestsOverride()
            : roomType != null ? roomType.getMaxGuests() : null;

        String roomCategory =
            roomType != null ? roomType.getRoomCategory() : null;

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
            false // availability injected later
        );
    }

    /* =========================
       FIND ALL (TODAY ONLY)
       ========================= */
    public List<ResolvedRoom> findAllResolved() {
        List<Room> rooms = roomRepository.findAll();
        List<ResolvedRoom> resolved = new ArrayList<>();

        LocalDate today = LocalDate.now();

        for (Room room : rooms) {
            RoomType roomType = room.getRoomTypeId() != null
                ? roomTypeService.getRoomTypeById(room.getRoomTypeId()).orElse(null)
                : null;

            ResolvedRoom rr = mergeRoomWithType(room, roomType);

            boolean bookedToday = roomAvailabilityService
                .findByRoomUnitId(room.getId())
                .stream()
                .anyMatch(a -> today.equals(a.getDate()));

            rr.setBooked(bookedToday);
            resolved.add(rr);
        }

        return resolved;
    }

    /* =========================
       SEARCH (DATE RANGE AWARE)
       ========================= */
    public Page<ResolvedRoom> searchResolvedRooms(
        Integer roomNumber,
        Boolean isActive,
        String roomCategory,
        String startDate,
        String endDate,
        Integer guests,
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

        LocalDate start = startDate != null ? LocalDate.parse(startDate) : null;
        LocalDate end   = endDate   != null ? LocalDate.parse(endDate)   : null;

        Set<String> bookedRoomIds = new HashSet<>();
        if (start != null && end != null) {
            List<RoomAvailability> booked =
                roomAvailabilityService.findBookedInRange(start, end);

            for (RoomAvailability ra : booked) {
                bookedRoomIds.add(ra.getRoomUnitId());
            }
        }

        List<ResolvedRoom> filtered = new ArrayList<>();

        for (Room room : rooms) {

            boolean isBookedInRange = bookedRoomIds.contains(room.getId());
            if (isBookedInRange) continue;

            RoomType roomType = room.getRoomTypeId() != null
                ? roomTypeService.getRoomTypeById(room.getRoomTypeId()).orElse(null)
                : null;

            ResolvedRoom rr = mergeRoomWithType(room, roomType);
            rr.setBooked(false);

            if (roomCategory != null &&
                (rr.getRoomCategory() == null ||
                !rr.getRoomCategory().equalsIgnoreCase(roomCategory))) {
                continue;
            }

            if (guests != null &&
                (rr.getMaxGuests() == null || rr.getMaxGuests() < guests)) {
                continue;
            }

            filtered.add(rr);
        }

        int startIdx = (int) pageable.getOffset();
        int endIdx = Math.min(startIdx + pageable.getPageSize(), filtered.size());

        List<ResolvedRoom> page =
            startIdx >= filtered.size() ? List.of() : filtered.subList(startIdx, endIdx);

        return new PageImpl<>(page, pageable, filtered.size());
    }

    /* =========================
       BASIC CRUD
       ========================= */
    public Optional<Room> findById(String id) {
        return roomRepository.findById(id);
    }

    public Room save(Room room) {
        return roomRepository.save(room);
    }

    public void delete(String id) {
        roomRepository.deleteById(id);
    }
}
