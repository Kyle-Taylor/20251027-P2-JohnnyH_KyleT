import React, { useEffect, useMemo, useState } from "react";
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
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import NightsStayIcon from "@mui/icons-material/NightsStay";
import PeopleIcon from "@mui/icons-material/People";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Header from "../../components/Header";
import dayjs from "dayjs";
import BannerPhoto from "../../assets/images/BannerPhoto.png";
import CalendarPopup from "../../components/CalandarPopup";
import { useNavigate } from "react-router-dom";
import {
  useCreateReservationMutation,
  useGetRoomTypesQuery,
  useLazyGetAvailabilityForRoomQuery,
  useLazySearchRoomsQuery,
} from "../../store/apiSlice";

function getUserIdFromToken() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.sub || payload.userId || payload.id || null;
  } catch {
    return null;
  }
}

export default function BookRoom() {
  const navigate = useNavigate();
  const [bookedDates, setBookedDates] = useState([]);
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
  const [checkOutDate, setCheckOutDate] = useState(
    dayjs().add(1, "day").format("YYYY-MM-DD")
  );
  const [numGuests, setNumGuests] = useState(1);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const [roomTypes, setRoomTypes] = useState([]);
  const [selectedRoomType, setSelectedRoomType] = useState(null);

  const [modalRange, setModalRange] = useState({ start: null, end: null });

  const [lastSearch, setLastSearch] = useState(null);
  const {
    data: roomTypesData,
    isLoading: roomTypesLoading,
    error: roomTypesError,
  } = useGetRoomTypesQuery();
  const [triggerSearchRooms] = useLazySearchRoomsQuery();
  const [triggerAvailabilityByRoom] = useLazyGetAvailabilityForRoomQuery();
  const [createReservation] = useCreateReservationMutation();

  const selectedRoomTypeId = useMemo(() => {
    if (!selectedRoomType) return null;
    return selectedRoomType.id || selectedRoomType._id || null;
  }, [selectedRoomType]);

  const selectedRoomTypeCategory = useMemo(() => {
    if (!selectedRoomType) return null;
    return selectedRoomType.roomCategory || null;
  }, [selectedRoomType]);

  useEffect(() => {
    if (Array.isArray(roomTypesData)) {
      setRoomTypes(roomTypesData);
    } else if (roomTypesData) {
      setRoomTypes([]);
    }
  }, [roomTypesData]);

  useEffect(() => {
    if (roomTypesError) {
      setError(roomTypesError?.message || "Failed to fetch room types");
    }
  }, [roomTypesError]);

  useEffect(() => {
    if (roomTypesLoading) {
      setLoading(true);
    } else {
      setLoading(false);
    }
  }, [roomTypesLoading]);

  useEffect(() => {
    if (!selectedRoomType) return;
    fetchRoomsForSelectedType();
    // reset paging when changing type
    setPage(1);
  }, [selectedRoomType]);

  async function fetchRoomsForSelectedType(paramsOverride) {
    if (!selectedRoomTypeCategory) return;

    const startDate = paramsOverride?.startDate ?? checkInDate;
    const endDate = paramsOverride?.endDate ?? checkOutDate;
    const guests = paramsOverride?.guests ?? numGuests;

    setLoading(true);
    setError("");
    try {
      const qs = new URLSearchParams();
      qs.set("roomCategory", selectedRoomTypeCategory);
      qs.set("startDate", startDate);
      qs.set("endDate", endDate);
      qs.set("guests", String(guests));

      const data = await triggerSearchRooms(Object.fromEntries(qs.entries())).unwrap();
      const list = Array.isArray(data) ? data : (data?.content ?? []);
      setRooms(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err.message || "Failed to fetch rooms");
      setRooms([]);
    } finally {
      setLoading(false);
    }
  }

  function handleSelectRoomType(rt) {
    setSelectedRoomType(rt);
    setSelectedRoom(null);
    setModalOpen(false);
    setBooking(false);
    setBookingError("");
    setBookingSuccess(false);

    // Set default search: today/tomorrow, 1 guest
    const today = dayjs().format("YYYY-MM-DD");
    const tomorrow = dayjs().add(1, "day").format("YYYY-MM-DD");
    setCheckInDate(today);
    setCheckOutDate(tomorrow);
    setNumGuests(1);
    setCurrentImageIndex(0);
    setLastSearch({ startDate: today, endDate: tomorrow, guests: 1 });

    // Simulate a HeroSearch autofill and search by calling the Header's setRooms/setLoading/setError props
    if (typeof window !== 'undefined' && window.dispatchEvent) {
      // Custom event for HeroSearch autofill (if you want to listen in HeroSearch for this event)
      window.dispatchEvent(new CustomEvent('heroSearchAutofill', {
        detail: { guests: 1, startDate: today, endDate: tomorrow }
      }));
    }
    // Also trigger the search directly via Header's runSearch logic
    setLoading(true);
    setError("");
    const params = new URLSearchParams({ startDate: today, endDate: tomorrow, guests: 1 });
    triggerSearchRooms(Object.fromEntries(params.entries()))
      .unwrap()
      .then((data) => setRooms(data?.content || data))
      .catch((err) => setError(err?.message || "Search failed"))
      .finally(() => setLoading(false));
  }

  function handleBackToRoomTypes() {
    setSelectedRoomType(null);
    setRooms([]);
    setSelectedRoom(null);
    setModalOpen(false);
    setBooking(false);
    setBookingError("");
    setBookingSuccess(false);
    setPage(1);
  }

  async function handleOpenModal(room, e) {
    if (e) e.stopPropagation();
    setSelectedRoom(room);
    setModalOpen(true);
    setBookingError("");
    setBookingSuccess(false);
    setCurrentImageIndex(0);
    // Sync modal dates to last search
    if (lastSearch) {
      setCheckInDate(lastSearch.startDate);
      setCheckOutDate(lastSearch.endDate);
      setNumGuests(lastSearch.guests);
      setModalRange({ start: dayjs(lastSearch.startDate), end: dayjs(lastSearch.endDate) });
    } else {
      setModalRange({ start: dayjs(checkInDate), end: dayjs(checkOutDate) });
    }
    // Fetch booked dates for this room
    try {
      const data = await triggerAvailabilityByRoom(room.id || room._id).unwrap();
      setBookedDates(Array.isArray(data) ? data.map(a => a.date) : []);
    } catch {
      setBookedDates([]);
    }
  }

  function handleCloseModal() {
    setModalOpen(false);
    setSelectedRoom(null);
    setBooking(false);
    setBookingError("");
    setBookingSuccess(false);
  }

  // Replace calculateNights and calculateTotalPrice with modal-aware versions:
  function calculateNights() {
    if (modalOpen && modalRange.start && modalRange.end) {
      const start = modalRange.start.startOf("day");
      const end = modalRange.end.startOf("day");
      const nights = Math.abs(end.diff(start, "day"));
      return nights;
    }
    const checkIn = dayjs(checkInDate).startOf("day");
    const checkOut = dayjs(checkOutDate).startOf("day");
    const nights = Math.abs(checkOut.diff(checkIn, "day"));
    return nights;
  }

  function calculateTotalPrice() {
    if (!selectedRoom) return 0;
    const nights = calculateNights();
    return nights * (selectedRoom.price ?? 0);
  }

  async function handleCheckInChange(newCheckIn) {
    setCheckInDate(newCheckIn);

    const checkIn = dayjs(newCheckIn);
    const checkOut = dayjs(checkOutDate);
    if (checkOut.isBefore(checkIn) || checkOut.isSame(checkIn, "day")) {
      const fixed = checkIn.add(1, "day").format("YYYY-MM-DD");
      setCheckOutDate(fixed);
      if (!modalOpen && selectedRoomType) {
        await fetchRoomsForSelectedType({ startDate: newCheckIn, endDate: fixed, guests: numGuests });
      }
      return;
    }

    if (!modalOpen && selectedRoomType) {
      await fetchRoomsForSelectedType({ startDate: newCheckIn, endDate: checkOutDate, guests: numGuests });
    }
  }

  async function handleCheckOutChange(newCheckOut) {
    const checkIn = dayjs(checkInDate);
    const checkOut = dayjs(newCheckOut);
    if (checkOut.isAfter(checkIn)) {
      setCheckOutDate(newCheckOut);
      if (!modalOpen && selectedRoomType) {
        await fetchRoomsForSelectedType({ startDate: checkInDate, endDate: newCheckOut, guests: numGuests });
      }
    }
  }

  async function handleGuestsChange(nextGuests) {
    const safe = Math.max(1, Math.min(selectedRoom?.maxGuests || 10, Number(nextGuests) || 1));
    setNumGuests(safe);

    if (!modalOpen && selectedRoomType) {
      await fetchRoomsForSelectedType({ startDate: checkInDate, endDate: checkOutDate, guests: safe });
    }
  }

  function handlePreviousImage() {
    if (!selectedRoom || !selectedRoom.images || selectedRoom.images.length <= 1) return;
    setCurrentImageIndex((prev) =>
      prev === 0 ? selectedRoom.images.length - 1 : prev - 1
    );
  }

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

    // Use modal dates for booking
    const bookingCheckIn = modalRange.start ? modalRange.start.format("YYYY-MM-DD") : checkInDate;
    const bookingCheckOut = modalRange.end ? modalRange.end.format("YYYY-MM-DD") : checkOutDate;

    setBooking(true);
    setBookingError("");
    setBookingSuccess(false);

    try {
      const userId = getUserIdFromToken();
      const payload = {
        ...(userId ? { userId } : {}),
        roomUnitId: selectedRoom.id || selectedRoom._id,
        checkInDate: bookingCheckIn,
        checkOutDate: bookingCheckOut,
        numGuests,
        totalPrice: calculateTotalPrice()
      };

      const saved = await createReservation(payload).unwrap();

      setBookingSuccess(true);

      // After booking, refresh list using current search bar dates (not the booking dates)
      if (selectedRoomType) {
        await fetchRoomsForSelectedType({
          startDate: checkInDate,
          endDate: checkOutDate,
          guests: numGuests
        });
        // Update lastSearch to keep search state in sync
        setLastSearch({
          startDate: checkInDate,
          endDate: checkOutDate,
          guests: numGuests
        });
      }

      // Redirect to Stripe checkout for this reservation
      const reservationId = saved?.id || saved?._id;
      if (!reservationId) {
        console.error("Reservation created but no ID returned", saved);
        setBookingError("Reservation created but missing an ID. Please try again.");
        return;
      }
      navigate(`/pay/${reservationId}`);
      setModalOpen(false);
      setBookingSuccess(false);
    } catch (err) {
      setBookingError(err?.message || "Failed to book room");
    } finally {
      setBooking(false);
    }
  }

  // Only show active rooms for reservation (user-facing)
  const visibleRooms = useMemo(() => {
    if (!selectedRoomTypeId) return rooms.filter(r => r.isActive !== false);
    // Filter by type and isActive
    return rooms.filter(r => ((r.roomTypeId === selectedRoomTypeId) || !r.roomTypeId) && r.isActive !== false);
  }, [rooms, selectedRoomTypeId]);

  return (
    <Box
      sx={{
        background:
          "radial-gradient(circle at 0% 10%, rgba(125,211,252,0.16), transparent 45%), radial-gradient(circle at 90% 0%, rgba(96,165,250,0.16), transparent 45%), #0f1113",
      }}
    >
      {/* Hide HeroSearch until room type selected */}
      <Header setRooms={setRooms} setLoading={setLoading} setError={setError} showSearch={Boolean(selectedRoomType)} />

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

        <Box
          sx={{
            flexGrow: 1,
            minWidth: 0,
            bgcolor: "transparent",
            px: { xs: 1, sm: 2, md: 4 },
            py: 2,
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            maxWidth: "100%"
          }}
        >
            {/* ====== ROOM TYPE GRID (2 per row) ====== */}
            {!selectedRoomType && (
              <>
                <Box
                  sx={{
                    position: "relative",
                    width: "100%",
                    height: { xs: 220, sm: 280, md: 340 },
                    borderRadius: 3,
                    overflow: "hidden",
                    mb: 5,
                  }}
                >
                  {/* Background image */}
                  <Box
                    component="img"
                    src={BannerPhoto}
                    alt="CloudLodge"
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      position: "absolute",
                      inset: 0,
                    }}
                  />

                  {/* Dark overlay */}
                  <Box
                    sx={{
                      position: "absolute",
                      inset: 0,
                      bgcolor: "rgba(9, 12, 15, 0.55)",
                    }}
                  />

                  {/* Text content */}
                  <Box
                    sx={{
                      position: "relative",
                      zIndex: 1,
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      textAlign: "center",
                      px: 2,
                    }}
                  >
                    <Typography
                      variant="h2"
                      sx={{
                        fontFamily: "'Playfair Display', serif",
                        fontWeight: 800,
                        fontSize: { xs: 28, sm: 40, md: 48 },
                        color: "#fff",
                        letterSpacing: 1,
                        mb: 1,
                      }}
                    >
                      Select your perfect room
                    </Typography>

                    <Divider
                      sx={{
                        width: 80,
                        borderColor: "primary.main",
                        borderBottomWidth: 3,
                        my: 2,
                      }}
                    />

                    <Typography
                      variant="h6"
                      sx={{
                        color: "rgba(255,255,255,0.85)",
                        maxWidth: 700,
                        fontWeight: 400,
                        fontFamily: "'Manrope', sans-serif",
                      }}
                    >
                      Choose from our collection of thoughtfully designed spaces.
                    </Typography>
                  </Box>
                </Box>
                {loading ? (
                  <Typography>Loading…</Typography>
                ) : roomTypes.length === 0 ? (
                  <Box sx={{ textAlign: "center", py: 8 }}>
                    <Typography variant="h6" color="text.secondary">
                      No room types found
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Add room types to display booking options.
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ 
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
                    gap: 3,
                    width: "100%"
                  }}>
                    {roomTypes.map(rt => {
                      const key = rt.id || rt._id;
                      return (
                        <Card
                          key={key}
                          sx={{
                            borderRadius: 3,
                            bgcolor: "rgba(21, 26, 31, 0.92)",
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                            "&:hover": { 
                              transform: "translateY(-6px)",
                              boxShadow: "0 8px 16px rgba(0,0,0,0.3)"
                            },
                            display: "flex",
                            flexDirection: "column",
                            width: "100%"
                          }}
                          onClick={() => handleSelectRoomType(rt)}
                        >
                          <Box
                            sx={{
                              width: "100%",
                              height: 210,
                              overflow: "hidden",
                              position: "relative"
                            }}
                          >
                            <Box
                              component="img"
                              src={rt.images?.[0] || "https://picsum.photos/800/500"}
                              alt={rt.roomCategory}
                              sx={{ 
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                position: "absolute",
                                top: 0,
                                left: 0
                              }}
                            />
                            <Box
                              sx={{
                                position: "absolute",
                                inset: 0,
                                background:
                                  "linear-gradient(180deg, rgba(15,17,19,0.08) 20%, rgba(15,17,19,0.75) 100%)"
                              }}
                            />
                            <Box
                              sx={{
                                position: "absolute",
                                top: 12,
                                right: 12,
                                px: 1.4,
                                py: 0.45,
                                borderRadius: 999,
                                bgcolor: "rgba(15, 17, 19, 0.85)",
                                border: "1px solid rgba(125, 211, 252, 0.55)",
                                color: "#e6edf6",
                                fontSize: 13,
                                fontWeight: 700,
                                letterSpacing: 0.2,
                                boxShadow: "0 10px 20px rgba(6, 15, 24, 0.45)"
                              }}
                            >
                              ${rt.pricePerNight}
                            </Box>
                          </Box>
                          <CardContent sx={{ p: 2.5, flexGrow: 1, display: "flex", flexDirection: "column" }}>
                            <Typography variant="h5" fontWeight={700} gutterBottom>
                              {rt.roomCategory}
                            </Typography>
                            
                            <Stack direction="row" spacing={1.5} sx={{ my: 1.5, flexWrap: "wrap" }}>
                              <Chip
                                icon={<PeopleIcon />}
                                label={`Up to ${rt.maxGuests} guests`}
                                size="small"
                                color="success"
                                variant="outlined"
                              />
                              <Chip 
                                icon={<BedIcon />}
                                label={rt.bedType || "Queen Bed"}
                                size="small"
                                variant="outlined"
                                sx={{
                                  bgcolor: "rgba(125, 211, 252, 0.28)",
                                  color: "#e6edf6",
                                  fontWeight: 700,
                                  letterSpacing: 0.6,
                                  border: "1px solid rgba(125, 211, 252, 0.6)",
                                  textTransform: "uppercase",
                                  boxShadow: "0 10px 18px rgba(6, 15, 24, 0.4)"
                                }}
                              />
                            </Stack>

                            {rt.description && (
                              <Typography 
                                variant="body2" 
                                color="text.secondary" 
                                sx={{ 
                                  mb: 1.5, 
                                  lineHeight: 1.5,
                                  display: "-webkit-box",
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: "vertical",
                                  overflow: "hidden"
                                }}
                              >
                                {rt.description}
                              </Typography>
                            )}

                            {rt.amenities && rt.amenities.length > 0 && (
                              <Box sx={{ my: 1.5, flexGrow: 1 }}>
                                <Typography 
                                  variant="body2" 
                                  color="text.secondary" 
                                  gutterBottom
                                  sx={{ fontWeight: 600, mb: 1 }}
                                >
                                  Amenities
                                </Typography>
                                <Box sx={{ 
                                  display: "grid",
                                  gridTemplateColumns: "repeat(2, 1fr)",
                                  gap: 0.75
                                }}>
                                  {rt.amenities.slice(0, 6).map((amenity, idx) => (
                                    <Chip 
                                      key={idx}
                                      label={amenity} 
                                      size="small" 
                                      variant="outlined"
                                      sx={{ 
                                        width: "100%",
                                        height: 24,
                                        justifyContent: "flex-start",
                                        fontSize: "0.7rem",
                                        "& .MuiChip-label": {
                                          width: "100%",
                                          px: 1
                                        }
                                      }}
                                    />
                                  ))}
                                  {rt.amenities.length > 6 && (
                                    <Chip 
                                      label={`+${rt.amenities.length - 6} more`}
                                      size="small" 
                                      variant="filled"
                                      color="default"
                                      sx={{ 
                                        width: "100%",
                                        height: 24,
                                        fontSize: "0.7rem"
                                      }}
                                    />
                                  )}
                                </Box>
                              </Box>
                            )}

                            <Divider sx={{ my: 1.5, borderColor: "#4a4a4a" }} />

                            <Stack 
                              direction="row" 
                              justifyContent="space-between" 
                              alignItems="center"
                              sx={{ mt: "auto" }}
                            >
                              <Box>
                                <Typography variant="caption" color="text.secondary">
                                  Starting from
                                </Typography>
                                <Typography variant="h6" fontWeight={700} color="primary">
                                  ${rt.pricePerNight}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  per night
                                </Typography>
                              </Box>
                              <Button 
                                variant="contained" 
                                size="medium"
                                sx={{ 
                                  px: 3,
                                  py: 1,
                                  fontWeight: 600
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectRoomType(rt);
                                }}
                              >
                                Select
                              </Button>
                            </Stack>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </Box>
                )}
              </>
            )}

            {/* ====== ROOMS GRID (AFTER TYPE SELECTED) ====== */}
            {selectedRoomType && (
              <>
                <Box
                  sx={{
                    position: "relative",
                    width: "100%",
                    height: { xs: 200, sm: 260, md: 300 },
                    borderRadius: 3,
                    overflow: "hidden",
                    mb: 3,
                  }}
                >
                  <Box
                    component="img"
                    src={BannerPhoto}
                    alt="CloudLodge"
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      position: "absolute",
                      inset: 0,
                    }}
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      inset: 0,
                      bgcolor: "rgba(9, 12, 15, 0.6)",
                    }}
                  />
                  <Box
                    sx={{
                      position: "relative",
                      zIndex: 1,
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      textAlign: "center",
                      px: 2,
                    }}
                  >
                    <Typography
                      variant="h2"
                      sx={{
                        fontFamily: "'Playfair Display', serif",
                        fontWeight: 800,
                        fontSize: { xs: 24, sm: 34, md: 42 },
                        color: "#fff",
                        letterSpacing: 0.6,
                        mb: 1,
                      }}
                    >
                      Select your perfect room
                    </Typography>
                    <Divider
                      sx={{
                        width: 80,
                        borderColor: "primary.main",
                        borderBottomWidth: 3,
                        my: 2,
                      }}
                    />
                    <Typography
                      variant="h6"
                      sx={{
                        color: "rgba(255,255,255,0.85)",
                        maxWidth: 700,
                        fontWeight: 400,
                        fontFamily: "'Manrope', sans-serif",
                      }}
                    >
                      Choose dates and pick the best available room in this category.
                    </Typography>
                  </Box>
                </Box>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={handleBackToRoomTypes}
                    color="inherit"
                  >
                    Room Types
                  </Button>

                  <Chip
                    label={selectedRoomTypeCategory || "Selected Type"}
                    sx={{ ml: 1 }}
                  />
                </Stack>

                {loading ? (
                  <Typography>Loading…</Typography>
                ) : visibleRooms.length === 0 ? (
                  <Box sx={{ textAlign: "center", py: 8 }}>
                    <Typography variant="h6" color="text.secondary">
                      No rooms available for that range
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Try different dates or guest count.
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ 
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "repeat(2, 1fr)",
                      md: "repeat(3, 1fr)",
                      lg: "repeat(4, 1fr)",
                      xl: "repeat(5, 1fr)"
                    },
                    gap: 3,
                    width: "100%"
                  }}>
                    {visibleRooms
                      .slice((page - 1) * itemsPerPage, page * itemsPerPage)
                      .map(room => (
                        <Card
                          key={room.id || room._id}
                          sx={{
                            borderRadius: 3,
                            bgcolor: "rgba(21, 26, 31, 0.92)",
                            cursor: "pointer",
                            transition: "0.2s",
                            display: "flex",
                            flexDirection: "column",
                            minHeight: 360,
                            height: "100%",
                            "&:hover": { transform: "translateY(-4px)" }
                          }}
                          onClick={e => handleOpenModal(room, e)}
                        >
                          <Box sx={{ position: "relative" }}>
                            <Box
                              component="img"
                              src={room.images?.[0] || "https://picsum.photos/400/250"}
                              alt={`Room ${room.roomNumber}`}
                              sx={{ width: "100%", height: 180, objectFit: "cover" }}
                            />
                            <Box
                              sx={{
                                position: "absolute",
                                inset: 0,
                                background:
                                  "linear-gradient(180deg, rgba(15,17,19,0.08) 20%, rgba(15,17,19,0.75) 100%)"
                              }}
                            />
                            <Chip
                              icon={<CheckCircleIcon />}
                              label="Available"
                              color="success"
                              size="small"
                              sx={{ position: "absolute", top: 12, left: 12 }}
                            />
                            <Box
                              sx={{
                                position: "absolute",
                                top: 12,
                                right: 12,
                                px: 1.4,
                                py: 0.45,
                                borderRadius: 999,
                                bgcolor: "rgba(15, 17, 19, 0.85)",
                                border: "1px solid rgba(125, 211, 252, 0.55)",
                                color: "#e6edf6",
                                fontSize: 13,
                                fontWeight: 700,
                                letterSpacing: 0.2,
                                boxShadow: "0 10px 20px rgba(6, 15, 24, 0.45)"
                              }}
                            >
                              ${room.price}
                            </Box>
                          </Box>

                          <CardContent sx={{ display: "flex", flexDirection: "column", flexGrow: 1, py: 2.5 }}>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <BedIcon fontSize="small" />
                              <Typography fontWeight={700}>
                                Room #{room.roomNumber}
                              </Typography>
                            </Stack>

                            <Chip
                              label={room.roomCategory}
                              size="small"
                              sx={{
                                my: 1,
                                bgcolor: "rgba(125, 211, 252, 0.28)",
                                color: "#e6edf6",
                                fontWeight: 800,
                                letterSpacing: 0.8,
                                border: "1px solid rgba(125, 211, 252, 0.6)",
                                textTransform: "uppercase",
                                boxShadow: "0 10px 18px rgba(6, 15, 24, 0.4)",
                                width: "fit-content"
                              }}
                            />
                            <Box sx={{ flexGrow: 1 }} />
                          </CardContent>
                        </Card>
                      ))}
                  </Box>
                )}
              </>
            )}
          </Box>
        </Box>
      </Box>

      {/* ====== BOOKING MODAL (kept like your original) ====== */}
      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            bgcolor: "rgba(24, 26, 27, 0.88)"
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" fontWeight={600} component="div">
            Book Your Stay
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }} component="div">
            Complete your reservation details
          </Typography>
        </DialogTitle>

        <DialogContent dividers sx={{ bgcolor: "rgba(24, 26, 27, 0.88)" }}>
          {selectedRoom && (
            <Grid container spacing={3}>
              {/* Room Image and Info */}
              <Grid item xs={12} md={5}>
                <Box sx={{ position: "relative", mb: 2 }}>
                  <Box
                    component="img"
                    src={
                      selectedRoom.images?.[currentImageIndex] ||
                      "https://picsum.photos/400/250"
                    }
                    alt={`Room ${selectedRoom.roomNumber}`}
                    sx={{
                      width: "100%",
                      height: 220,
                      objectFit: "cover",
                      borderRadius: 2
                    }}
                  />

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
                              bgcolor:
                                idx === currentImageIndex
                                  ? "white"
                                  : "rgba(255, 255, 255, 0.5)",
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
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                      >
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
                  <Paper
                    elevation={0}
                    sx={{ p: 2.5, bgcolor: "rgba(24, 26, 27, 0.88)", borderRadius: 2 }}
                  >
                    <Stack spacing={2.5}>
                      <Box>
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          sx={{ mb: 1.5 }}
                        >
                          <CalendarTodayIcon fontSize="small" color="primary" />
                          <Typography variant="subtitle1" fontWeight={600}>
                            Select Dates
                          </Typography>
                        </Stack>

                        {/* Only show the calendar popup for date selection */}
                        <Box sx={{ mt: 2 }}>
                          <CalendarPopup
                            range={modalRange}
                            onSelect={date => {
                              setModalRange(prev => {
                                if (!prev.start || (prev.start && prev.end)) {
                                  return { start: date, end: null };
                                }
                                // Normalize: always set start to earlier and end to later date
                                if (date.isSame(prev.start, "day")) {
                                  // Same day: treat as 0 nights
                                  return { start: date, end: date };
                                }
                                const earlier = date.isBefore(prev.start, "day") ? date : prev.start;
                                const later = date.isAfter(prev.start, "day") ? date : prev.start;
                                return { start: earlier, end: later };
                              });
                            }}
                            bookedDates={bookedDates}
                          />
                        </Box>
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          p: 1.5,
                          bgcolor: "rgba(21, 26, 31, 0.92)",
                          borderRadius: 1
                        }}
                      >
                        <NightsStayIcon fontSize="small" color="primary" />
                        <Typography variant="body2" color="text.secondary">
                          Duration:
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {calculateNights()}{" "}
                          {calculateNights() === 1 ? "night" : "nights"}
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>

                  {/* Guest Selection */}
                  <Paper
                    elevation={0}
                    sx={{ p: 2.5, bgcolor: "rgba(24, 26, 27, 0.88)", borderRadius: 2 }}
                  >
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      sx={{ mb: 1.5 }}
                    >
                      <PeopleIcon fontSize="small" color="primary" />
                      <Typography variant="subtitle1" fontWeight={600}>
                        Guests
                      </Typography>
                    </Stack>

                    <TextField
                      label="Number of Guests"
                      type="number"
                      value={numGuests}
                      onChange={e => handleGuestsChange(e.target.value)}
                      inputProps={{
                        min: 1,
                        max: selectedRoom?.maxGuests || 10
                      }}
                      fullWidth
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          bgcolor: "rgba(24, 26, 27, 0.9)"
                        }
                      }}
                    />
                  </Paper>

                  {/* Price Breakdown */}
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.5,
                      bgcolor: "rgba(24, 26, 27, 0.9)",
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
                          ${selectedRoom.price} × {calculateNights()}{" "}
                          {calculateNights() === 1 ? "night" : "nights"}
                        </Typography>
                        <Typography variant="body2">
                          ${selectedRoom.price * calculateNights()}
                        </Typography>
                      </Stack>

                      <Divider sx={{ borderColor: "rgba(125, 211, 252, 0.12)" }} />

                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                      >
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
                    <Chip label={bookingError} color="error" sx={{ width: "100%" }} />
                  )}
                  {bookingSuccess && (
                    <Chip
                      label="Room booked successfully!"
                      color="success"
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
            color="error"
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleBookRoom}
            disabled={booking || calculateNights() <= 0}
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