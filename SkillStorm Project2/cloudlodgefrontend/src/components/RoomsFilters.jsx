import React from "react";
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography
} from "@mui/material";

export default function RoomsFilters({
  roomTypes,
  roomsCount,
  filteredCount,
  filterRoomTypeId,
  filterStatus,
  filterRoomNumber,
  filterPriceMin,
  filterPriceMax,
  onRoomTypeChange,
  onStatusChange,
  onRoomNumberChange,
  onPriceMinChange,
  onPriceMaxChange,
  onClearFilters
}) {
  return (
      <Paper
        elevation={2}
        sx={{
          width: "100%",
          height: "auto",
          p: { xs: 1.25, sm: 1.5 },
          bgcolor: "#323232",
          border: "1px solid #3a3a3a",
          borderRadius: 3
        }}
      >
        <Stack spacing={2}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Filter Rooms
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {filteredCount} of {roomsCount}
            </Typography>
          </Stack>

          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", md: "center" }}
          >
            <FormControl fullWidth size="small">
              <InputLabel>Room Type</InputLabel>
              <Select
                label="Room Type"
                value={filterRoomTypeId}
                onChange={(e) => onRoomTypeChange(e.target.value)}
              >
                <MenuItem value="">All Types</MenuItem>
                {roomTypes.map(rt => (
                  <MenuItem key={rt.id} value={rt.id}>
                    {rt.roomCategory}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                value={filterStatus}
                onChange={(e) => onStatusChange(e.target.value)}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="available">Available</MenuItem>
                <MenuItem value="booked">Booked</MenuItem>
                <MenuItem value="maintenance">Maintenance</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Room #"
              size="small"
              value={filterRoomNumber}
              onChange={(e) => onRoomNumberChange(e.target.value)}
              fullWidth
            />

            <TextField
              label="Min Price"
              size="small"
              type="number"
              value={filterPriceMin}
              onChange={(e) => onPriceMinChange(e.target.value)}
              fullWidth
              inputProps={{ min: 0 }}
            />

            <TextField
              label="Max Price"
              size="small"
              type="number"
              value={filterPriceMax}
              onChange={(e) => onPriceMaxChange(e.target.value)}
              fullWidth
              inputProps={{ min: 0 }}
            />

            <Button
              variant="outlined"
              color="inherit"
              onClick={onClearFilters}
              sx={{ whiteSpace: "nowrap",
                width: "30%",
                color: "#ffffffff"

              }}
            >
              Clear Filters
            </Button>
          </Stack>
        </Stack>
      </Paper>
  );
}
