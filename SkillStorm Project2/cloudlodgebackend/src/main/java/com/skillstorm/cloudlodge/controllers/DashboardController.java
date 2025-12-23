package com.skillstorm.cloudlodge.controllers;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.skillstorm.cloudlodge.models.Payment;
import com.skillstorm.cloudlodge.models.Reservation;
import com.skillstorm.cloudlodge.models.Room;
import com.skillstorm.cloudlodge.models.RoomAvailability;
import com.skillstorm.cloudlodge.services.PaymentService;
import com.skillstorm.cloudlodge.services.ReservationService;
import com.skillstorm.cloudlodge.services.RoomAvailabilityService;
import com.skillstorm.cloudlodge.services.RoomService;

@RestController
public class DashboardController {
    @Autowired
    private RoomService roomService;
    @Autowired
    private ReservationService reservationService;
    @Autowired
    private PaymentService paymentService;
    @Autowired
    private RoomAvailabilityService roomAvailabilityService;

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> dashboard(
        @RequestParam(value = "date", required = false) String dateStr,
        @RequestParam(value = "period", required = false, defaultValue = "day") String period,
        @RequestParam(value = "reservationMonth", required = false) String reservationMonth
    ) {
        Map<String, Object> data = new HashMap<>();
        LocalDate targetDate = dateStr != null ? LocalDate.parse(dateStr) : LocalDate.now();

        // 1. Occupancy Rate (for targetDate)
        List<Room> allRooms = roomService.findAllResolved().stream().map(r -> {
            Room room = new Room();
            room.setId(r.getId());
            room.setIsActive(r.getIsActive());
            return room;
        }).toList();
        List<RoomAvailability> booked = roomAvailabilityService.findByDate(targetDate);
        int totalRooms = allRooms.size();
        int bookedRooms = booked.size();
        double occupancyRate = totalRooms == 0 ? 0.0 : (double) bookedRooms / totalRooms * 100.0;
        occupancyRate = Math.round(occupancyRate * 100.0) / 100.0;
        data.put("occupancyRate", occupancyRate);
        data.put("occupiedRooms", bookedRooms);
        data.put("totalRooms", totalRooms);

        // 2. Income (for targetDate and period)
        List<Payment> allPayments = paymentService.findAll();
        double income = allPayments.stream()
            .filter(p -> p.getStatus() == Payment.Status.SUCCEEDED &&
                p.getCreatedAt() != null &&
                p.getCreatedAt().atZone(java.time.ZoneId.systemDefault()).toLocalDate().equals(targetDate))
            .mapToDouble(Payment::getAmount)
            .sum();
        data.put("income", income);

        // Dynamic income history and labels
        List<Double> incomeHistory;
        List<String> incomeLabels;
        if (period.equals("month")) {
            // Show daily income for the month of targetDate
            int daysInMonth = targetDate.lengthOfMonth();
            incomeHistory = new java.util.ArrayList<>();
            incomeLabels = new java.util.ArrayList<>();
            for (int i = 1; i <= daysInMonth; i++) {
                LocalDate day = targetDate.withDayOfMonth(i);
                double dayIncome = allPayments.stream()
                    .filter(p -> p.getStatus() == Payment.Status.SUCCEEDED &&
                        p.getCreatedAt() != null &&
                        p.getCreatedAt().atZone(java.time.ZoneId.systemDefault()).toLocalDate().equals(day))
                    .mapToDouble(Payment::getAmount)
                    .sum();
                incomeHistory.add(dayIncome);
                incomeLabels.add(String.valueOf(i));
            }
        } else {
            // Show hourly income for the target day
            incomeHistory = new java.util.ArrayList<>();
            incomeLabels = new java.util.ArrayList<>();
            for (int h = 0; h < 24; h++) {
                int hour = h;
                double hourIncome = allPayments.stream()
                    .filter(p -> p.getStatus() == Payment.Status.SUCCEEDED &&
                        p.getCreatedAt() != null &&
                        p.getCreatedAt().atZone(java.time.ZoneId.systemDefault()).toLocalDate().equals(targetDate) &&
                        p.getCreatedAt().atZone(java.time.ZoneId.systemDefault()).getHour() == hour)
                    .mapToDouble(Payment::getAmount)
                    .sum();
                incomeHistory.add(hourIncome);
                incomeLabels.add(String.format("%02d:00", hour));
            }
        }
        data.put("incomeHistory", incomeHistory);
        data.put("incomeLabels", incomeLabels);

        // 3. Inactive Rooms
        long inactiveRooms = allRooms.stream().filter(r -> r.getIsActive() != null && !r.getIsActive()).count();
        data.put("inactiveRooms", inactiveRooms);

        // 4. Upcoming Reservations (by month if provided, else next 7 days)
        List<Reservation> allReservations = reservationService.findAll();
        List<Map<String, Object>> upcomingReservations;
        if (reservationMonth != null && reservationMonth.matches("\\d{4}-\\d{2}")) {
            int year = Integer.parseInt(reservationMonth.substring(0, 4));
            int month = Integer.parseInt(reservationMonth.substring(5, 7));
            LocalDate monthStart = LocalDate.of(year, month, 1);
            LocalDate monthEnd = monthStart.withDayOfMonth(monthStart.lengthOfMonth());
            upcomingReservations = allReservations.stream()
                .filter(r -> r.getCheckInDate() != null &&
                    !r.getCheckInDate().isBefore(monthStart) && !r.getCheckInDate().isAfter(monthEnd)
                    && (r.getStatus() == null || !r.getStatus().name().equals("CANCELLED")))
                .map(r -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("id", r.getId());
                    m.put("userId", r.getUserId());
                    m.put("guestName", r.getUserId()); // Replace with actual guest name if available
                    // Lookup real room number
                    Room room = roomService.findById(r.getRoomUnitId()).orElse(null);
                    m.put("roomNumber", room != null && room.getRoomNumber() != null ? room.getRoomNumber() : r.getRoomUnitId());
                    m.put("checkInDate", r.getCheckInDate().toString());
                    m.put("checkOutDate", r.getCheckOutDate() != null ? r.getCheckOutDate().toString() : "");
                    return m;
                })
                .collect(Collectors.toList());
        } else {
            LocalDate now = LocalDate.now();
            LocalDate weekFromNow = now.plusDays(7);
            upcomingReservations = allReservations.stream()
                .filter(r -> r.getCheckInDate() != null && !r.getCheckInDate().isBefore(now) && !r.getCheckInDate().isAfter(weekFromNow)
                    && (r.getStatus() == null || !r.getStatus().name().equals("CANCELLED")))
                .map(r -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("id", r.getId());
                    m.put("userId", r.getUserId());
                    m.put("guestName", r.getUserId()); // Replace with actual guest name if available
                    // Lookup real room number
                    Room room = roomService.findById(r.getRoomUnitId()).orElse(null);
                    m.put("roomNumber", room != null && room.getRoomNumber() != null ? room.getRoomNumber() : r.getRoomUnitId());
                    m.put("checkInDate", r.getCheckInDate().toString());
                    m.put("checkOutDate", r.getCheckOutDate() != null ? r.getCheckOutDate().toString() : "");
                    return m;
                })
                .collect(Collectors.toList());
        }
        data.put("upcomingReservations", upcomingReservations);

        // 5. Recent Payments (last 7 days)
        List<Map<String, Object>> recentPayments = allPayments.stream()
            .filter(p -> p.getCreatedAt() != null && p.getCreatedAt().isAfter(java.time.Instant.now().minusSeconds(7 * 24 * 60 * 60)))
            .map(p -> {
                Map<String, Object> m = new HashMap<>();
                m.put("id", p.getId());
                m.put("guestName", ""); // Replace with actual guest name if available
                m.put("amount", p.getAmount());
                m.put("status", p.getStatus().toString());
                m.put("date", p.getCreatedAt().toString());
                return m;
            })
            .collect(Collectors.toList());
        data.put("recentPayments", recentPayments);

        return ResponseEntity.ok(data);
    }
}
