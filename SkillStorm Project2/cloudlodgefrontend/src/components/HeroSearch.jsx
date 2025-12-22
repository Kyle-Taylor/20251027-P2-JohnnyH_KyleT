import React, { useEffect, useMemo, useState } from "react";
import { Box, Typography, IconButton, ClickAwayListener } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import dayjs from "dayjs";
import CalendarPopup from "./CalandarPopup";

export default function HeroSearch({ onSearchChange }) {
    // Listen for autofill event from parent (room type selection)
    useEffect(() => {
      function handleAutofill(e) {
        const { guests, startDate, endDate } = e.detail || {};
        if (guests) setGuests(guests);
        if (startDate && endDate) {
          setRange({ start: dayjs(startDate), end: dayjs(endDate) });
          // Trigger search after state updates
          setTimeout(() => {
            if (onSearchChange) {
              onSearchChange({
                startDate,
                endDate,
                guests: guests || 1
              });
            }
          }, 0);
        }
      }
      window.addEventListener('heroSearchAutofill', handleAutofill);
      return () => window.removeEventListener('heroSearchAutofill', handleAutofill);
    }, [onSearchChange]);
  const [activeSection, setActiveSection] = useState(null);
  const [guests, setGuests] = useState(0);
  const [showDateError, setShowDateError] = useState(false);
  const [showGuestError, setShowGuestError] = useState(false);

    // Default calendar range: today and tomorrow
    const today = dayjs().startOf("day");
    const tomorrow = today.add(1, "day");
    const [range, setRange] = useState({ start: today, end: tomorrow });

  const handleSearch = (e) => {
    // Prevent event bubbling
    e.stopPropagation();
    
    const missingDates = !range.start || !range.end;
    const missingGuests = guests === 0;
    
    setShowDateError(missingDates);
    setShowGuestError(missingGuests);
    
    if (missingDates || missingGuests) {
      // Clear errors after 3 seconds
      setTimeout(() => {
        setShowDateError(false);
        setShowGuestError(false);
      }, 3000);
      return;
    }
    
    if (!onSearchChange) {
      console.error("onSearchChange prop is missing");
      return;
    }

    onSearchChange({
      startDate: range.start.format("YYYY-MM-DD"),
      endDate: range.end.format("YYYY-MM-DD"),
      guests
    });
  };

  function handleSelect(date) {
    // Clear date error when user selects dates
    setShowDateError(false);
    
    // Ensure date is a dayjs object
    const dayjsDate = dayjs.isDayjs(date) ? date : dayjs(date);
    
    setRange(prev => {
      if (!prev.start || (prev.start && prev.end)) {
        const newRange = { start: dayjsDate, end: null };
        return newRange;
      }
      if (dayjsDate.isBefore(prev.start, "day")) {
        const newRange = { start: dayjsDate, end: prev.start };
        return newRange;
      }
      const newRange = { ...prev, end: dayjsDate };
      return newRange;
    });
  }

  const datesLabel =
    range.start && range.end
      ? `${range.start.format("MMM D")} - ${range.end.format("MMM D")}`
      : "Add dates";

  return (
    <ClickAwayListener onClickAway={() => setActiveSection(null)}>
      <Box sx={{ position: "relative", width: "100%", maxWidth: 680 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            height: 56,
            width: "100%",
            borderRadius: "999px",
            bgcolor: "background.paper",
            boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
          }}
        >
          {/* Dates */}
          <Box
            onClick={() => setActiveSection(s => (s === "dates" ? null : "dates"))}
            sx={{
              flex: 1,
              px: 2,
              py: 1,
              borderRadius: "999px",
              cursor: "pointer",
              "&:hover": { bgcolor: "rgba(255,255,255,0.06)" },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Typography sx={{ fontSize: 12, fontWeight: 600, color: "text.primary" }}>
                When
              </Typography>
              {showDateError && (
                <ErrorOutlineIcon 
                  sx={{ 
                    fontSize: 14, 
                    color: "#ef4444",
                    animation: "shake 0.3s",
                    "@keyframes shake": {
                      "0%, 100%": { transform: "translateX(0)" },
                      "25%": { transform: "translateX(-4px)" },
                      "75%": { transform: "translateX(4px)" },
                    }
                  }} 
                />
              )}
            </Box>
            <Typography sx={{ fontSize: 14, color: showDateError ? "#ef4444" : "text.secondary" }}>
              {datesLabel}
            </Typography>
          </Box>

          {/* Divider */}
          <Box sx={{ height: 40, width: 2, bgcolor: "divider", mx: 2 }} />

          {/* Guests */}
          <Box
            sx={{
              flex: 1,
              px: 2,
              py: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderRadius: "999px",
            }}
          >
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Typography sx={{ fontSize: 12, fontWeight: 600, color: "text.primary" }}>
                  Who
                </Typography>
                {showGuestError && (
                  <ErrorOutlineIcon 
                    sx={{ 
                      fontSize: 14, 
                      color: "#ef4444",
                      animation: "shake 0.3s",
                      "@keyframes shake": {
                        "0%, 100%": { transform: "translateX(0)" },
                        "25%": { transform: "translateX(-4px)" },
                        "75%": { transform: "translateX(4px)" },
                      }
                    }} 
                  />
                )}
              </Box>
              <Typography sx={{ fontSize: 14, color: showGuestError ? "#ef4444" : "text.secondary" }}>
                {guests === 0 ? "Add guests" : `${guests} guest${guests > 1 ? "s" : ""}`}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <IconButton
                size="small"
                disabled={guests === 0}
                onClick={(e) => {
                  e.stopPropagation();
                  setGuests(g => Math.max(0, g - 1));
                }}
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: "999px",
                  border: "1px solid",
                  borderColor: "divider",
                  color: "text.primary",
                }}
              >
                −
              </IconButton>

              <IconButton
                size="small"
                disabled={guests === 15}
                onClick={(e) => {
                  e.stopPropagation();
                  setGuests(g => {
                    setShowGuestError(false); // Clear error when adding guests
                    return Math.min(15, g + 1);
                  });
                }}
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: "999px",
                  border: "1px solid",
                  borderColor: "divider",
                  color: "text.primary",
                }}
              >
                +
              </IconButton>
            </Box>
          </Box>

          {/* Search button */}
          <IconButton
            sx={{
              mr: 1,
              borderRadius: "50%",
              bgcolor: "primary.main",
              color: "#fff",
              width: 40,
              height: 40,
              "&:hover": { bgcolor: "primary.dark" },
            }}
            onClick={handleSearch}
          >
            <SearchIcon />
          </IconButton>
        </Box>

        {/* Popup */}
        {activeSection === "dates" && (
          <Box
            sx={{
              position: "absolute",
              top: 72,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 20,
            }}
          >
            <CalendarPopup range={range} onSelect={handleSelect} />
          </Box>
        )}
      </Box>
    </ClickAwayListener>
  );
}