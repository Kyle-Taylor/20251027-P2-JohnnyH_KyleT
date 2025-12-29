import React, { useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Box, Button, Stack } from "@mui/material";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import EventNoteIcon from "@mui/icons-material/EventNote";
import HotelIcon from "@mui/icons-material/Hotel";
import DashboardIcon from "@mui/icons-material/Dashboard";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";

export default function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const role = useMemo(() => {
    const token = localStorage.getItem("token");
    if (!token) return "GUEST";
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const rawRole = (payload.role || "GUEST").toString().toUpperCase();
      return rawRole.replace(/^ROLE_/, "");
    } catch {
      return "GUEST";
    }
  }, []);

  const showGuest = role === "GUEST";
  const showManager = role === "MANAGER";
  const showAdmin = role === "ADMIN";

  if (showGuest) {
    return null;
  }

  const handleNavigate = (path) => {
    navigate(path);
  };

  const items = [
    ...(showAdmin
      ? [
          { path: "/create-reservation", label: "Book Reservation", icon: <EventAvailableIcon /> },
          { path: "/user-reservations", label: "Reservations", icon: <EventNoteIcon /> },
        ]
      : []),
    ...(showManager || showAdmin
      ? [
          { path: "/rooms", label: "View Rooms", icon: <HotelIcon /> },
          { path: "/roomtypes", label: "Room Types", icon: <MeetingRoomIcon /> },
        ]
      : []),
    ...(showAdmin
      ? [
          { path: "/dashboard", label: "Dashboard", icon: <DashboardIcon /> },
        ]
      : []),
  ];

  return (
    <Box sx={{ display: "flex", alignItems: "center", ml: 2 }}>
      <Stack
        direction="row"
        spacing={1}
        sx={{ alignItems: "center", flexWrap: "nowrap", minWidth: "max-content" }}
      >
        {items.map((item) => (
          <Button
            key={item.path}
            size="small"
            startIcon={item.icon}
            onClick={() => handleNavigate(item.path)}
            variant={location.pathname === item.path ? "contained" : "text"}
            sx={{
              textTransform: "none",
              whiteSpace: "nowrap",
              minHeight: 32,
              color: location.pathname === item.path ? "#e6f0ff" : "#c7d0db",
              bgcolor: location.pathname === item.path ? "rgba(125, 211, 252, 0.18)" : "transparent",
              "&:hover": {
                bgcolor: location.pathname === item.path ? "rgba(125, 211, 252, 0.22)" : "rgba(255,255,255,0.06)",
              },
            }}
          >
            {item.label}
          </Button>
        ))}
      </Stack>
    </Box>
  );
}
