import React from "react";
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

export default function RoomsSideNav() {
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
          <ListItem selected>
            <ListItemIcon sx={{ color: "#90caf9" }}>
              <HotelIcon />
            </ListItemIcon>
            <ListItemText primary="Rooms" />
          </ListItem>

          <ListItem>
            <ListItemIcon sx={{ color: "#bdbdbd" }}>
              <MeetingRoomIcon />
            </ListItemIcon>
            <ListItemText primary="Room Types" />
          </ListItem>

          <ListItem>
            <ListItemIcon sx={{ color: "#bdbdbd" }}>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItem>

          <ListItem>
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
