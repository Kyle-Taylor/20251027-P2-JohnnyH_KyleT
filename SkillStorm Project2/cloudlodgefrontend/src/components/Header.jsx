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
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { clearToken } from "../store/authSlice";
import { useGetProfileQuery, useLazySearchRoomsQuery } from "../store/apiSlice";

export default function Header({
  setRooms,
  setLoading,
  setError,
  showSearch = true,
  hideGuests = false,
  searchMaxWidth,
  searchHeight,
  searchParams
}) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);
  const [userInfo, setUserInfo] = useState(null);
  const token = useSelector((state) => state.auth.token);
  const { data: profile } = useGetProfileQuery(undefined, { skip: !token });
  const [triggerSearch] = useLazySearchRoomsQuery();

  useEffect(() => {
    if (!token) {
      setUserInfo(null);
      return undefined;
    }
    if (profile) {
      const fullName = profile?.fullName || profile?.full_name || "";
      const role = profile?.role || "";
      setUserInfo({
        name: fullName || "Guest",
        role: role ? role.toString().toUpperCase() : "GUEST",
      });
      return undefined;
    }
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const role = payload.role || "";
      setUserInfo({
        name: "Guest",
        role: role ? role.toString().toUpperCase() : "GUEST",
      });
    } catch {
      setUserInfo(null);
    }
    return undefined;
  }, [token, profile]);

  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleProfile = () => {
    handleMenuClose();
    navigate("/profile");
    console.log("Go to profile");
  };

  const handleSignOut = () => {
    handleMenuClose();
    dispatch(clearToken());
    navigate("/login");
  };

  async function runSearch({ startDate, endDate, guests }) {
    if (!setRooms || !setLoading || !setError) return;

    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);
      if (guests !== undefined && guests !== null && guests !== "") {
        params.set("guests", String(guests));
      }

      if (searchParams && typeof searchParams === "object") {
        Object.entries(searchParams).forEach(([key, value]) => {
          if (value === undefined || value === null || value === "") return;
          params.set(key, String(value));
        });
      }

      const data = await triggerSearch(Object.fromEntries(params.entries())).unwrap();
      setRooms(data?.content || data);
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
          bgcolor: "rgba(15, 17, 19, 0.92)",
          borderBottom: "1px solid rgba(125, 211, 252, 0.16)",
          top: 0,
          zIndex: 1200,
          backdropFilter: "blur(10px)",
          backgroundImage:
            "linear-gradient(120deg, rgba(125,211,252,0.08), rgba(15,17,19,0.9))",
        }}
      >
        <Toolbar sx={{ height: 72 }}>
          {/* Logo */}
          <Box
            sx={{ display: "flex", alignItems: "center", mr: 2, cursor: "pointer" }}
            onClick={() => navigate("/")}
          >
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
                letterSpacing: "0.08em",
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
              <HeroSearch
                onSearchChange={runSearch}
                hideGuests={hideGuests}
                maxWidth={searchMaxWidth}
                height={searchHeight}
              />
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
                  bgcolor: "rgba(24, 26, 27, 0.9)",
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
                  bgcolor: "rgba(21, 26, 31, 0.96)",
                  color: "#e3e6ea",
                  border: "1px solid rgba(125, 211, 252, 0.18)",
                  boxShadow: "0 18px 40px rgba(6, 15, 24, 0.45)",
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
