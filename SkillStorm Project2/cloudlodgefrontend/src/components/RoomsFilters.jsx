import React from "react";
import {
  Box,
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
  sortOrder,
  onRoomTypeChange,
  onStatusChange,
  onRoomNumberChange,
  onPriceMinChange,
  onPriceMaxChange,
  onSortChange,
  onClearFilters
}) {
  return (
    <Paper
      elevation={2}
      sx={{
        width: "100%",
        height: "auto",
        p: { xs: 2, md: 2.5 },
        bgcolor: "rgba(24, 26, 27, 0.92)",
        border: "1px solid rgba(125, 211, 252, 0.18)",
        borderRadius: 3,
        position: "relative",
        overflow: "hidden"
      }}
    >
      <Stack spacing={2.5} sx={{ position: "relative" }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Filter Rooms
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {filteredCount} of {roomsCount} rooms shown
            </Typography>
          </Box>
          <Button
            variant="outlined"
            color="inherit"
            onClick={onClearFilters}
            sx={{ whiteSpace: "nowrap", color: "#e6edf6" }}
          >
            Clear Filters
          </Button>
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

          <FormControl fullWidth size="small">
            <InputLabel>Sort</InputLabel>
            <Select
              label="Sort"
              value={sortOrder}
              onChange={(e) => onSortChange(e.target.value)}
            >
              <MenuItem value="roomNumberAsc">Room # (Low to High)</MenuItem>
              <MenuItem value="roomNumberDesc">Room # (High to Low)</MenuItem>
              <MenuItem value="priceAsc">Price (Low to High)</MenuItem>
              <MenuItem value="priceDesc">Price (High to Low)</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Stack>
    </Paper>
  );
}
