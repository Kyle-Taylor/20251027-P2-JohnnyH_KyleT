import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import HotelIcon from "@mui/icons-material/Hotel";
import HomeIcon from "@mui/icons-material/Home";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import SettingsIcon from "@mui/icons-material/Settings";

export default function SideNav() {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <Box
      sx={{
        width: 240,
        flexShrink: 0,
        bgcolor: "#181a1b",
        color: "#fff",
        borderRight: "2px solid #232323",
        display: { xs: "none", md: "flex" },
        flexDirection: "column",
      }}
    >
      <Box sx={{ flexGrow: 1, pt: 3 }}>
        <List>
          <ListItem
            selected={location.pathname === "/rooms"}
            onClick={() => navigate("/rooms")}
            button
            sx={{
              cursor: 'pointer',
              '&:hover': { bgcolor: '#232b3b' },
              bgcolor: location.pathname === '/rooms' ? '#26324a' : 'inherit',
              color: location.pathname === '/rooms' ? '#90caf9' : 'inherit',
            }}
          >
            <ListItemIcon sx={{ color: "#90caf9" }}>
              <HotelIcon />
            </ListItemIcon>
            <ListItemText primary="Rooms" />
          </ListItem>

          <ListItem
            selected={location.pathname === "/roomtypes"}
            onClick={() => navigate("/roomtypes")}
            button
            sx={{
              cursor: 'pointer',
              '&:hover': { bgcolor: '#232b3b' },
              bgcolor: location.pathname === '/roomtypes' ? '#26324a' : 'inherit',
              color: location.pathname === '/roomtypes' ? '#90caf9' : 'inherit',
            }}
          >
            <ListItemIcon sx={{ color: "#bdbdbd" }}>
              <MeetingRoomIcon />
            </ListItemIcon>
            <ListItemText primary="Room Types" />
          </ListItem>

          <ListItem button sx={{ cursor: 'pointer', '&:hover': { bgcolor: '#232b3b' } }}>
            <ListItemIcon sx={{ color: "#bdbdbd" }}>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItem>

          <ListItem button sx={{ cursor: 'pointer', '&:hover': { bgcolor: '#232b3b' } }}>
            <ListItemIcon sx={{ color: "#bdbdbd" }}>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItem>
        </List>
      </Box>
    </Box>
  );
}
