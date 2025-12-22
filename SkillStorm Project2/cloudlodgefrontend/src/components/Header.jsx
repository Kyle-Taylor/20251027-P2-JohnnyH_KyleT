import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Paper,
  InputBase,
  IconButton,
  Avatar,
  Menu,
  MenuItem
} from "@mui/material";
import { GlobalStyles } from "@mui/material";
import { useEffect, useRef, useState } from "react";

import CloudLodgeLogo from "../assets/images/CloudLodge.png";
import SearchIcon from "@mui/icons-material/Search";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { useNavigate } from "react-router-dom";  

const API_URL = "http://localhost:8080/rooms";
const DEBOUNCE_MS = 300;

export default function Header({ setRooms, setLoading, setError }) {
  const [query, setQuery] = useState("");
  const timeoutRef = useRef(null);
  const navigate = useNavigate();

  // user menu
  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);

  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleProfile = () => {
    handleMenuClose();
    navigate("/profile");
    console.log("Go to profile");
  };

  const handleSignOut = () => {
    handleMenuClose();
    localStorage.removeItem("token");
    navigate("/login");
    console.log("Sign out");
  };

  async function runSearch(value) {
    const trimmed = value.trim();

    try {
      setLoading(true);
      setError("");

      let url = API_URL;

      if (trimmed.length > 0) {
        const params = new URLSearchParams();

        if (!isNaN(trimmed)) {
          params.append("roomNumber", trimmed);
        } else {
          params.append("roomCategory", trimmed);
        }

        url = `${API_URL}/search?${params.toString()}`;
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error("Search failed");

      const data = await res.json();
      setRooms(data.content ?? data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      runSearch(query);
    }, DEBOUNCE_MS);

    return () => clearTimeout(timeoutRef.current);
  }, [query]);

  function handleImmediateSearch() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    runSearch(query);
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
                fontFamily: "'Playfair Display', serif",
                fontWeight: 700,
                letterSpacing: "0.12em",
                color: "#e3e6ea",
              }}
            >
              CloudLodge
            </Typography>
          </Box>

          {/* Search */}
          <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
            <Paper
              sx={{
                px: 2,
                py: 0.5,
                display: "flex",
                alignItems: "center",
                width: 480,
                borderRadius: 999,
                border: "1px solid",
                borderColor: "#23272a",
                bgcolor: "#23272a",
                boxShadow: "none",
              }}
            >
              <InputBase
                placeholder="Search by room # or type"
                fullWidth
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleImmediateSearch();
                }}
                sx={{
                  color: "#e3e6ea",
                  '::placeholder': { color: '#b0b3b8', opacity: 1 },
                }}
              />
              <IconButton onClick={handleImmediateSearch} sx={{ color: "#b0b3b8" }}>
                <SearchIcon />
              </IconButton>
            </Paper>
          </Box>

          {/* User menu */}
          <Box sx={{ ml: "auto" }}>
            <IconButton
              onClick={handleMenuOpen}
              sx={{ display: "flex", gap: 0, p: 0.5 }}
            >
              <Avatar sx={{ width: 36, height: 36, bgcolor: "#23272a", color: "#e3e6ea" }}>
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
              <MenuItem onClick={handleProfile} sx={{ color: "#e3e6ea" }}>Profile</MenuItem>
              <MenuItem onClick={handleSignOut} sx={{ color: "#e3e6ea" }}>Sign Out</MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
    </>
  );
}
