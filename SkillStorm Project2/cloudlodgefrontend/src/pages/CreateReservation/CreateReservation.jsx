import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Box,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
  Paper,
  IconButton
} from "@mui/material";
import BedIcon from "@mui/icons-material/Bed";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import NightsStayIcon from "@mui/icons-material/NightsStay";
import PeopleIcon from "@mui/icons-material/People";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Header from "../../components/Header";
import SideNav from "../../components/SideNav";
import dayjs from "dayjs";

const API_URL = "http://localhost:8080/";

export default function BookRoom() {
  const [rooms, setRooms] = useState([]);
  const [page, setPage] = useState(1);
  const itemsPerPage = 18;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [booking, setBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [checkInDate, setCheckInDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [checkOutDate, setCheckOutDate] = useState(dayjs().add(1, "day").format("YYYY-MM-DD"));
  const [numGuests, setNumGuests] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetchRooms();
  }, []);

  async function fetchRooms() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(API_URL + "rooms");
      if (!res.ok) throw new Error("Failed to fetch rooms");
      const data = await res.json();
      setRooms(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleOpenModal(room) {
    setSelectedRoom(room);
    setModalOpen(true);
    setBookingError("");
    setBookingSuccess(false);
    // Reset dates when opening modal
    setCheckInDate(dayjs().format("YYYY-MM-DD"));
    setCheckOutDate(dayjs().add(1, "day").format("YYYY-MM-DD"));
    setNumGuests(1);
    setCurrentImageIndex(0);
  }

  function handleCloseModal() {
    setModalOpen(false);
    setSelectedRoom(null);
    setBooking(false);
    setBookingError("");
    setBookingSuccess(false);
  }

  // Calculate number of nights
  function calculateNights() {
    const checkIn = dayjs(checkInDate);
    const checkOut = dayjs(checkOutDate);
    const nights = checkOut.diff(checkIn, "day");
    return nights > 0 ? nights : 0;
  }

  // Calculate total price
  function calculateTotalPrice() {
    if (!selectedRoom) return 0;
    const nights = calculateNights();
    return nights * selectedRoom.price;
  }

  // Handle check-in date change
  function handleCheckInChange(newCheckIn) {
    setCheckInDate(newCheckIn);
    // If check-out is before or same as new check-in, adjust it
    const checkIn = dayjs(newCheckIn);
    const checkOut = dayjs(checkOutDate);
    if (checkOut.isBefore(checkIn) || checkOut.isSame(checkIn, "day")) {
      setCheckOutDate(checkIn.add(1, "day").format("YYYY-MM-DD"));
    }
  }

  // Handle check-out date change
  function handleCheckOutChange(newCheckOut) {
    const checkIn = dayjs(checkInDate);
    const checkOut = dayjs(newCheckOut);
    // Ensure check-out is after check-in
    if (checkOut.isAfter(checkIn)) {
      setCheckOutDate(newCheckOut);
    }
  }

  // Navigate to previous image
  function handlePreviousImage() {
    if (!selectedRoom || !selectedRoom.images || selectedRoom.images.length <= 1) return;
    setCurrentImageIndex((prev) => 
      prev === 0 ? selectedRoom.images.length - 1 : prev - 1
    );
  }

  // Navigate to next image
  function handleNextImage() {
    if (!selectedRoom || !selectedRoom.images || selectedRoom.images.length <= 1) return;
    setCurrentImageIndex((prev) => 
      prev === selectedRoom.images.length - 1 ? 0 : prev + 1
    );
  }

  async function handleBookRoom() {
    if (!selectedRoom) return;
    
    const nights = calculateNights();
    if (nights <= 0) {
      setBookingError("Check-out date must be after check-in date");
      return;
    }

    setBooking(true);
    setBookingError("");
    setBookingSuccess(false);

    try {
      const payload = {
        roomUnitId: selectedRoom.id || selectedRoom._id,
        checkInDate: checkInDate,
        checkOutDate: checkOutDate,
        numGuests: numGuests
      };

      const res = await fetch(`${API_URL}reservations/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Failed to book room");

      setBookingSuccess(true);
      fetchRooms();
      setTimeout(() => {
        setModalOpen(false);
        setBookingSuccess(false);
      }, 1500);
    } catch (err) {
      setBookingError(err.message);
    } finally {
      setBooking(false);
    }
  }

  return (
    <Box>
      <Header setRooms={setRooms} setLoading={setLoading} setError={setError} />

      <Box sx={{ width: "100%" }}>
        {error && <Chip label={error} color="error" sx={{ mb: 2 }} />}

        <Box
          sx={{
            display: "flex",
            width: "100vw",
            maxWidth: "99.2vw",
            minHeight: "100%",
            overflowX: "hidden"
          }}
        >
          <SideNav />

          <Box
            sx={{
              flexGrow: 1,
              minWidth: 0,
              bgcolor: "#2c2b2bff",
              borderLeft: "2px solid #232323",
              borderRight: "2px solid #232323",
              px: { xs: 1, sm: 2, md: 4 },
              py: 2,
              minHeight: "100vh",
              display: "flex",
              flexDirection: "column"
            }}
          >
            {loading ? (
              <Typography>Loading…</Typography>
            ) : (
              <Grid container spacing={3}>
                {rooms
                  .slice((page - 1) * itemsPerPage, page * itemsPerPage)
                  .map(room => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={room.id || room._id}>
                      <Card
                        sx={{
                          borderRadius: 3,
                          bgcolor: "#383838",
                          cursor: room.booked ? "not-allowed" : "pointer",
                          transition: "0.2s",
                          opacity: room.booked ? 0.6 : 1,
                          "&:hover": { transform: room.booked ? "none" : "translateY(-4px)" }
                        }}
                        onClick={() => {
                          if (room.booked) {
                            setBookingError("This room is already booked.");
                            setBookingSuccess(false);
                          } else {
                            handleOpenModal(room);
                          }
                        }}
                      >
                        <Box
                          component="img"
                          src={room.images?.[0] || "https://picsum.photos/400/250"}
                          alt={`Room ${room.roomNumber}`}
                          sx={{ width: "100%", height: 160, objectFit: "cover" }}
                        />

                        <CardContent>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <BedIcon fontSize="small" />
                            <Typography fontWeight={700}>
                              Room #{room.roomNumber}
                            </Typography>
                          </Stack>

                          <Chip label={room.roomCategory} size="small" sx={{ my: 1 }} />

                          <Stack direction="row" justifyContent="space-between">
                            <Chip
                              icon={room.booked ? <CancelIcon /> : <CheckCircleIcon />}
                              label={room.booked ? "Booked" : "Available"}
                              color={room.booked ? "error" : "success"}
                              size="small"
                            />
                            <Typography>${room.price}</Typography>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
              </Grid>
            )}
          </Box>
        </Box>
      </Box>

      {/* Improved Booking Modal */}
      <Dialog 
        open={modalOpen} 
        onClose={handleCloseModal} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            bgcolor: "#2a2a2a"
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h5" fontWeight={600}>
            Book Your Stay
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Complete your reservation details
          </Typography>
        </DialogTitle>

        <DialogContent dividers sx={{ bgcolor: "#323232" }}>
          {selectedRoom && (
            <Grid container spacing={3}>
              {/* Room Image and Info */}
              <Grid item xs={12} md={5}>
                <Box sx={{ position: "relative", mb: 2 }}>
                  <Box
                    component="img"
                    src={selectedRoom.images?.[currentImageIndex] || "https://picsum.photos/400/250"}
                    alt={`Room ${selectedRoom.roomNumber}`}
                    sx={{ 
                      width: "100%", 
                      height: 220, 
                      objectFit: "cover", 
                      borderRadius: 2
                    }}
                  />
                  
                  {/* Navigation Buttons - Only show if there are multiple images */}
                  {selectedRoom.images && selectedRoom.images.length > 1 && (
                    <>
                      <IconButton
                        onClick={handlePreviousImage}
                        sx={{
                          position: "absolute",
                          left: 8,
                          top: "50%",
                          transform: "translateY(-50%)",
                          bgcolor: "rgba(0, 0, 0, 0.6)",
                          color: "white",
                          "&:hover": {
                            bgcolor: "rgba(0, 0, 0, 0.8)"
                          },
                          width: 36,
                          height: 36
                        }}
                      >
                        <ChevronLeftIcon />
                      </IconButton>

                      <IconButton
                        onClick={handleNextImage}
                        sx={{
                          position: "absolute",
                          right: 8,
                          top: "50%",
                          transform: "translateY(-50%)",
                          bgcolor: "rgba(0, 0, 0, 0.6)",
                          color: "white",
                          "&:hover": {
                            bgcolor: "rgba(0, 0, 0, 0.8)"
                          },
                          width: 36,
                          height: 36
                        }}
                      >
                        <ChevronRightIcon />
                      </IconButton>

                      {/* Image indicator dots */}
                      <Stack
                        direction="row"
                        spacing={0.5}
                        sx={{
                          position: "absolute",
                          bottom: 12,
                          left: "50%",
                          transform: "translateX(-50%)",
                          bgcolor: "rgba(0, 0, 0, 0.5)",
                          borderRadius: 2,
                          px: 1,
                          py: 0.5
                        }}
                      >
                        {selectedRoom.images.map((_, idx) => (
                          <Box
                            key={idx}
                            sx={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              bgcolor: idx === currentImageIndex ? "white" : "rgba(255, 255, 255, 0.5)",
                              transition: "all 0.3s"
                            }}
                          />
                        ))}
                      </Stack>
                    </>
                  )}
                </Box>
                
                <Stack spacing={1.5}>
                  <Typography variant="h6" fontWeight={600}>
                    Room #{selectedRoom.roomNumber}
                  </Typography>
                  
                  <Chip 
                    label={selectedRoom.roomCategory} 
                    size="small" 
                    sx={{ width: "fit-content" }}
                  />
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Price per night
                    </Typography>
                    <Typography variant="h6" fontWeight={600} color="primary">
                      ${selectedRoom.price}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Max Guests
                    </Typography>
                    <Typography variant="body1">
                      {selectedRoom.maxGuests} guests
                    </Typography>
                  </Box>

                  {selectedRoom.amenities && selectedRoom.amenities.length > 0 && (
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Amenities
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                        {selectedRoom.amenities.map((amenity, idx) => (
                          <Chip 
                            key={idx} 
                            label={amenity} 
                            size="small" 
                            variant="outlined"
                          />
                        ))}
                      </Stack>
                    </Box>
                  )}
                </Stack>
              </Grid>

              {/* Booking Form */}
              <Grid item xs={12} md={7}>
                <Stack spacing={3}>
                  {/* Date Selection */}
                  <Paper elevation={0} sx={{ p: 2.5, bgcolor: "#2a2a2a", borderRadius: 2 }}>
                    <Stack spacing={2.5}>
                      <Box>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                          <CalendarTodayIcon fontSize="small" color="primary" />
                          <Typography variant="subtitle1" fontWeight={600}>
                            Select Dates
                          </Typography>
                        </Stack>
                        
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <TextField
                              label="Check-in"
                              type="date"
                              value={checkInDate}
                              onChange={e => handleCheckInChange(e.target.value)}
                              InputLabelProps={{ shrink: true }}
                              fullWidth
                              disabled={selectedRoom.booked}
                              inputProps={{
                                min: dayjs().format("YYYY-MM-DD")
                              }}
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  bgcolor: "#323232"
                                }
                              }}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              label="Check-out"
                              type="date"
                              value={checkOutDate}
                              onChange={e => handleCheckOutChange(e.target.value)}
                              InputLabelProps={{ shrink: true }}
                              fullWidth
                              disabled={selectedRoom.booked}
                              inputProps={{
                                min: dayjs(checkInDate).add(1, "day").format("YYYY-MM-DD")
                              }}
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  bgcolor: "#323232"
                                }
                              }}
                            />
                          </Grid>
                        </Grid>
                      </Box>

                      {/* Number of Nights Display */}
                      <Box 
                        sx={{ 
                          display: "flex", 
                          alignItems: "center", 
                          gap: 1,
                          p: 1.5,
                          bgcolor: "#383838",
                          borderRadius: 1
                        }}
                      >
                        <NightsStayIcon fontSize="small" color="primary" />
                        <Typography variant="body2" color="text.secondary">
                          Duration:
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {calculateNights()} {calculateNights() === 1 ? "night" : "nights"}
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>

                  {/* Guest Selection */}
                  <Paper elevation={0} sx={{ p: 2.5, bgcolor: "#2a2a2a", borderRadius: 2 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                      <PeopleIcon fontSize="small" color="primary" />
                      <Typography variant="subtitle1" fontWeight={600}>
                        Guests
                      </Typography>
                    </Stack>
                    
                    <TextField
                      label="Number of Guests"
                      type="number"
                      value={numGuests}
                      onChange={e => setNumGuests(Math.max(1, Math.min(selectedRoom?.maxGuests || 10, Number(e.target.value) || 1)))}
                      inputProps={{ min: 1, max: selectedRoom?.maxGuests || 10 }}
                      fullWidth
                      disabled={selectedRoom.booked}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          bgcolor: "#323232"
                        }
                      }}
                    />
                  </Paper>

                  {/* Price Breakdown */}
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 2.5, 
                      bgcolor: "#2a2a2a", 
                      borderRadius: 2,
                      border: "2px solid",
                      borderColor: "primary.main"
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                      Price Details
                    </Typography>
                    
                    <Stack spacing={1.5} sx={{ mt: 2 }}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">
                          ${selectedRoom.price} × {calculateNights()} {calculateNights() === 1 ? "night" : "nights"}
                        </Typography>
                        <Typography variant="body2">
                          ${selectedRoom.price * calculateNights()}
                        </Typography>
                      </Stack>
                      
                      <Divider sx={{ borderColor: "#383838" }} />
                      
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6" fontWeight={600}>
                          Total
                        </Typography>
                        <Typography variant="h5" fontWeight={700} color="primary">
                          ${calculateTotalPrice()}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Paper>

                  {/* Status Messages */}
                  {bookingError && (
                    <Chip 
                      label={bookingError} 
                      color="error" 
                      sx={{ width: "100%" }}
                    />
                  )}
                  {bookingSuccess && (
                    <Chip 
                      label="Room booked successfully!" 
                      color="success" 
                      sx={{ width: "100%" }}
                    />
                  )}
                  {selectedRoom.booked && (
                    <Chip 
                      label="This room is already booked." 
                      color="error" 
                      sx={{ width: "100%" }}
                    />
                  )}
                </Stack>
              </Grid>
            </Grid>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button 
            onClick={handleCloseModal}
            variant="outlined"
            size="large"
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleBookRoom}
            disabled={booking || (selectedRoom && selectedRoom.booked) || calculateNights() <= 0}
            size="large"
            sx={{ minWidth: 140 }}
          >
            {booking ? "Booking..." : `Book for $${calculateTotalPrice()}`}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}