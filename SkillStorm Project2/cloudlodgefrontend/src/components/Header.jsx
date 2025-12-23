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
import { useEffect, useState } from "react";

import CloudLodgeLogo from "../assets/images/CloudLodge.png";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import HeroSearch from "./HeroSearch";
import NavBar from "./NavBar";
import { apiFetch } from "../api/apiFetch";
import { useNavigate } from "react-router-dom";

export default function Header({
  setRooms,
  setLoading,
  setError,
  showSearch = true
}) {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const token = localStorage.getItem("token");
    if (!token) {
      setUserInfo(null);
      return undefined;
    }

    async function loadProfile() {
      try {
        const data = await apiFetch("/profile");
        if (!isMounted) return;
        const fullName = data?.fullName || data?.full_name || "";
        const role = data?.role || "";
        setUserInfo({
          name: fullName || "Guest",
          role: role ? role.toString().toUpperCase() : "GUEST"
        });
      } catch {
        if (!isMounted) return;
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          const role = payload.role || "";
          setUserInfo({
            name: "Guest",
            role: role ? role.toString().toUpperCase() : "GUEST"
          });
        } catch {
          setUserInfo(null);
        }
      }
    }

    loadProfile();
    return () => {
      isMounted = false;
    };
  }, []);

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

      const data = await apiFetch(`/rooms/search?${params.toString()}`);
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
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: "#181a1b",
          borderBottom: "1px solid",
          borderColor: "#23272a",
          top: 0,
          zIndex: 1200,
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

          <NavBar />

          {/* Search (optional) */}
          {showSearch && (
            <Box
              sx={{
                flex: 1,
                display: "flex",
                justifyContent: userInfo?.role === "ADMIN" ? "flex-end" : "center",
                pr: userInfo?.role === "ADMIN" ? 6 : 0,
              }}
            >
              <HeroSearch onSearchChange={runSearch} />
            </Box>
          )}

          {/* User menu */}
          <Box sx={{ ml: "auto", display: "flex", alignItems: "center" }}>
            {userInfo && (
              <Box sx={{ mr: 1.5, textAlign: "right" }}>
                <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#e3e6ea" }}>
                  {userInfo.name}
                </Typography>
                <Typography sx={{ fontSize: 11, letterSpacing: 1, color: "#9aa4b2" }}>
                  {userInfo.role}
                </Typography>
              </Box>
            )}
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
