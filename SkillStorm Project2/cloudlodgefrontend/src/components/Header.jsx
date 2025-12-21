import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Avatar,
  Menu,
  MenuItem
} from "@mui/material";
import { GlobalStyles } from "@mui/material";
import { useState } from "react";

import CloudLodgeLogo from "../assets/images/CloudLodge.png";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import HeroSearch from "./HeroSearch";

const API_URL = "http://localhost:8080";

export default function Header({
  setRooms,
  setLoading,
  setError,
  showSearch = true
}) {

  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);

  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleProfile = () => {
    handleMenuClose();
    window.location.href = "/profile";
  };

  const handleSignOut = () => {
    handleMenuClose();
    console.log("Sign out");
  };

  async function runSearch({ startDate, endDate, guests }) {
    if (!setRooms || !setLoading || !setError) return;

    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        startDate,
        endDate,
        guests
      });

      const res = await fetch(`${API_URL}/rooms/search?${params.toString()}`);
      if (!res.ok) throw new Error("Search failed");

      const data = await res.json();
      setRooms(data.content || data);
    } catch (err) {
      setError(err.message || "Search failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <GlobalStyles
        styles={`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&display=swap');`}
      />

      <AppBar
        position="static"
        elevation={0}
        sx={{
          bgcolor: "#181a1b",
          borderBottom: "1px solid",
          borderColor: "#23272a",
        }}
      >
        <Toolbar sx={{ height: 72 }}>
          {/* Logo */}
          <Box sx={{ display: "flex", alignItems: "center", mr: 2 }}>
            <Box
              component="img"
              src={CloudLodgeLogo}
              alt="CloudLodge Logo"
              sx={{ height: 40, width: 40, mr: 1, filter: "brightness(0.85)" }}
            />
            <Typography
              sx={{
                fontFamily: "'Dancing Script', cursive",
                fontWeight: 700,
                letterSpacing: "0.12em",
                color: "#e3e6ea",
              }}
            >
              CloudLodge
            </Typography>
          </Box>

          {/* Search (optional) */}
          {showSearch && (
            <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <HeroSearch onSearchChange={runSearch} />
            </Box>
          )}

          {/* User menu */}
          <Box sx={{ ml: "auto" }}>
            <IconButton
              onClick={handleMenuOpen}
              sx={{ display: "flex", gap: 0, p: 0.5 }}
            >
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: "#23272a",
                  color: "#e3e6ea"
                }}
              >
                <AccountCircleIcon />
              </Avatar>
              <ArrowDropDownIcon
                sx={{
                  color: "#b0b3b8",
                  transform: menuOpen ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "0.2s",
                }}
              />
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={menuOpen}
              onClose={handleMenuClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              PaperProps={{
                sx: {
                  bgcolor: "#23272a",
                  color: "#e3e6ea",
                  boxShadow: 3,
                },
              }}
            >
              <MenuItem onClick={handleProfile}>Profile</MenuItem>
              <MenuItem onClick={handleSignOut}>Sign Out</MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
    </>
  );
}
