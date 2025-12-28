import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import dayjs from "dayjs";
import Header from "../../components/Header";
import CancelBookingButton from "../../components/CancelBookingButton";
import CalendarPopup from "../../components/CalandarPopup";
import { useSelector } from "react-redux";
import {
  useCreateAvailabilityMutation,
  useDeleteAvailabilityMutation,
  useGetAuthMeQuery,
  useGetReservationsByUserQuery,
  useLazyGetAvailabilityForReservationQuery,
  useLazyGetAvailabilityForRoomQuery,
  useLazyGetRoomQuery,
  useLazyGetRoomTypeQuery,
  useUpdateReservationMutation,
} from "../../store/apiSlice";

const TWO_WEEKS_DAYS = 14;

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

function formatDate(dateStr) {
  if (!dateStr) return "";
  return dayjs(dateStr).format("MMM D, YYYY");
}

function buildDateRange(startDate, endDate) {
  const dates = [];
  let current = dayjs(startDate).startOf("day");
  const end = dayjs(endDate).startOf("day");
  while (current.isBefore(end, "day")) {
    dates.push(current.format("YYYY-MM-DD"));
    current = current.add(1, "day");
  }
  return dates;
}

function daysUntil(dateStr) {
  if (!dateStr) return null;
  return dayjs(dateStr).startOf("day").diff(dayjs().startOf("day"), "day");
}

function getNights(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  const start = dayjs(checkIn).startOf("day");
  const end = dayjs(checkOut).startOf("day");
  const nights = end.diff(start, "day");
  return nights > 0 ? nights : 0;
}

function isEditableReservation(reservation) {
  if (!reservation?.checkInDate) return false;
  if (["CANCELLED", "COMPLETED"].includes(reservation.status)) return false;
  const remaining = daysUntil(reservation.checkInDate);
  return typeof remaining === "number" && remaining >= TWO_WEEKS_DAYS;
}

export default function ViewUserReservations() {
  const [reservations, setReservations] = useState([]);
  const [error, setError] = useState("");
  const [roomMap, setRoomMap] = useState({});
  const [roomTypeMap, setRoomTypeMap] = useState({});
  const [bookedDates, setBookedDates] = useState([]);
  const token = useSelector((state) => state.auth.token);
  const [userId, setUserId] = useState(() => getUserIdFromToken());
  const {
    data: meData,
    isLoading: meLoading,
    error: meError,
  } = useGetAuthMeQuery(undefined, { skip: !token || Boolean(userId) });
  const {
    data: reservationsData,
    isLoading: reservationsLoading,
    error: reservationsError,
    refetch: refetchReservations,
  } = useGetReservationsByUserQuery(userId, { skip: !userId });
  const [triggerRoom] = useLazyGetRoomQuery();
  const [triggerRoomType] = useLazyGetRoomTypeQuery();
  const [triggerAvailabilityByRoom] = useLazyGetAvailabilityForRoomQuery();
  const [triggerAvailabilityByReservation] = useLazyGetAvailabilityForReservationQuery();
  const [updateReservation] = useUpdateReservationMutation();
  const [createAvailability] = useCreateAvailabilityMutation();
  const [deleteAvailability] = useDeleteAvailabilityMutation();

  const [editOpen, setEditOpen] = useState(false);
  const [editReservation, setEditReservation] = useState(null);
  const [editCheckIn, setEditCheckIn] = useState("");
  const [editCheckOut, setEditCheckOut] = useState("");
  const [editGuests, setEditGuests] = useState(1);
  const [editRange, setEditRange] = useState({ start: null, end: null });
  const [editError, setEditError] = useState("");
  const [saving, setSaving] = useState(false);
  const closeButtonRef = useRef(null);

  useEffect(() => {
    if (!userId && meData) {
      setUserId(meData?.id || meData?._id || null);
    }
  }, [meData, userId]);

  useEffect(() => {
    if (Array.isArray(reservationsData)) {
      setReservations(reservationsData);
    } else if (reservationsData) {
      setReservations([]);
    }
  }, [reservationsData]);

  useEffect(() => {
    if (!token) {
      setError("Please log in to view your reservations.");
      setReservations([]);
      return;
    }
    if (reservationsError) {
      setError(reservationsError?.message || "Failed to load reservations");
      return;
    }
    if (meError) {
      setError(meError?.message || "Failed to load reservations");
      return;
    }
    setError("");
  }, [token, reservationsError, meError]);

  const loading = reservationsLoading || (token && !userId && meLoading);

  useEffect(() => {
    let active = true;
    const fetchRooms = async () => {
      const uniqueRoomIds = Array.from(
        new Set(reservations.map((r) => r.roomUnitId).filter(Boolean))
      );
      if (uniqueRoomIds.length === 0) {
        if (active) setRoomMap({});
        return;
      }

      try {
        const entries = await Promise.all(
          uniqueRoomIds.map(async (roomId) => {
            try {
              const data = await triggerRoom(roomId).unwrap();
              return [roomId, data];
            } catch {
              return [roomId, null];
            }
          })
        );
        if (active) {
          setRoomMap(Object.fromEntries(entries));
        }
      } catch {
        if (active) setRoomMap({});
      }
    };

    fetchRooms();
    return () => {
      active = false;
    };
  }, [reservations]);

  useEffect(() => {
    let active = true;
    const fetchRoomTypes = async () => {
      const uniqueTypeIds = Array.from(
        new Set(
          Object.values(roomMap)
            .map((room) => room?.roomTypeId)
            .filter(Boolean)
        )
      );
      if (uniqueTypeIds.length === 0) {
        if (active) setRoomTypeMap({});
        return;
      }

      try {
        const entries = await Promise.all(
          uniqueTypeIds.map(async (typeId) => {
            try {
              const data = await triggerRoomType(typeId).unwrap();
              return [typeId, data];
            } catch {
              return [typeId, null];
            }
          })
        );
        if (active) setRoomTypeMap(Object.fromEntries(entries));
      } catch {
        if (active) setRoomTypeMap({});
      }
    };

    fetchRoomTypes();
    return () => {
      active = false;
    };
  }, [roomMap]);

  const editRoomNumber = editReservation
    ? roomMap[editReservation.roomUnitId]?.roomNumber
    : null;
  const editRoom = editReservation ? roomMap[editReservation.roomUnitId] : null;
  const editRoomType = editRoom ? roomTypeMap[editRoom.roomTypeId] : null;
  const editMaxGuests =
    editRoom?.maxGuestsOverride ??
    editRoomType?.maxGuests ??
    10;
  const clampGuests = (value, maxGuests) => {
    const parsed = Number(value);
    const safe = Number.isFinite(parsed) ? parsed : 1;
    return Math.max(1, Math.min(maxGuests, safe));
  };

  useEffect(() => {
    if (!editOpen) return;
    if (editRange.start) {
      setEditCheckIn(editRange.start.format("YYYY-MM-DD"));
    }
    if (editRange.end) {
      setEditCheckOut(editRange.end.format("YYYY-MM-DD"));
    } else {
      setEditCheckOut("");
    }
  }, [editRange, editOpen]);

  useEffect(() => {
    if (!editOpen) return;
    const id = window.setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 0);
    return () => window.clearTimeout(id);
  }, [editOpen]);

  useEffect(() => {
    if (!editOpen) return;
    setEditGuests((prev) => clampGuests(prev, editMaxGuests));
  }, [editMaxGuests, editOpen]);

  const upcomingReservations = useMemo(() => {
    const today = dayjs().startOf("day");
    return [...reservations]
      .filter((r) => {
        if (!r.checkOutDate) return false;
        return dayjs(r.checkOutDate).startOf("day").isSame(today, "day") ||
          dayjs(r.checkOutDate).startOf("day").isAfter(today, "day");
      })
      .sort((a, b) => dayjs(a.checkInDate).valueOf() - dayjs(b.checkInDate).valueOf());
  }, [reservations]);

  const pastReservations = useMemo(() => {
    const today = dayjs().startOf("day");
    return [...reservations]
      .filter((r) => {
        if (!r.checkOutDate) return false;
        return dayjs(r.checkOutDate).startOf("day").isBefore(today, "day");
      })
      .sort((a, b) => dayjs(b.checkInDate).valueOf() - dayjs(a.checkInDate).valueOf());
  }, [reservations]);

  const upcomingCount = upcomingReservations.length;
  const pastCount = pastReservations.length;

  const originalNights = useMemo(() => {
    if (!editReservation) return 0;
    return getNights(editReservation.checkInDate, editReservation.checkOutDate);
  }, [editReservation]);

  const updatedNights = useMemo(() => {
    return getNights(editCheckIn, editCheckOut);
  }, [editCheckIn, editCheckOut]);

  const nightsIncrease = updatedNights > originalNights;

  const blockedDates = useMemo(() => {
    const minAllowed = dayjs().add(TWO_WEEKS_DAYS, "day").startOf("day");
    const earlyBlocked = buildDateRange(
      dayjs().format("YYYY-MM-DD"),
      minAllowed.format("YYYY-MM-DD")
    );
    return Array.from(new Set([...bookedDates, ...earlyBlocked]));
  }, [bookedDates]);

  const handleOpenEdit = async (reservation) => {
    if (document?.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setEditReservation(reservation);
    setEditCheckIn(reservation.checkInDate || "");
    setEditCheckOut(reservation.checkOutDate || "");
    const room = roomMap[reservation.roomUnitId];
    const roomType = room ? roomTypeMap[room.roomTypeId] : null;
    const maxGuests = room?.maxGuestsOverride ?? roomType?.maxGuests ?? 10;
    const guests = Math.max(1, Math.min(maxGuests, reservation.numGuests || 1));
    setEditGuests(guests);
    setEditRange({
      start: reservation.checkInDate ? dayjs(reservation.checkInDate) : null,
      end: reservation.checkOutDate ? dayjs(reservation.checkOutDate) : null
    });
    setEditError("");
    setEditOpen(true);

    if (reservation.roomUnitId) {
      try {
        const availability = await triggerAvailabilityByRoom(reservation.roomUnitId).unwrap();
        const dates = (Array.isArray(availability) ? availability : [])
          .filter((entry) => entry.reservationId !== reservation.id)
          .map((entry) => dayjs(entry.date).format("YYYY-MM-DD"));
        setBookedDates(dates);
      } catch {
        setBookedDates([]);
      }
    } else {
      setBookedDates([]);
    }
  };

  const handleCloseEdit = () => {
    setEditOpen(false);
    setEditReservation(null);
    setEditError("");
    setBookedDates([]);
  };

  const handleCalendarSelect = (date) => {
    setEditRange((prev) => {
      if (!prev.start || (prev.start && prev.end)) {
        return { start: date, end: null };
      }
      if (date.isSame(prev.start, "day")) {
        return { start: date, end: date };
      }
      const earlier = date.isBefore(prev.start, "day") ? date : prev.start;
      const later = date.isAfter(prev.start, "day") ? date : prev.start;
      return { start: earlier, end: later };
    });
  };

  const handleGuestsChange = (value) => {
    setEditGuests(clampGuests(value, editMaxGuests));
  };

  const handleUpdateReservation = async () => {
    if (!editReservation) return;

    setEditError("");

    const newCheckIn = editCheckIn;
    const newCheckOut = editCheckOut;
    const guests = Math.max(1, Math.min(editMaxGuests, Number(editGuests) || 1));

    if (!newCheckIn || !newCheckOut) {
      setEditError("Please select valid check-in and check-out dates.");
      return;
    }

    if (!dayjs(newCheckOut).isAfter(dayjs(newCheckIn), "day")) {
      setEditError("Check-out date must be after check-in date.");
      return;
    }

    const minAllowed = dayjs().add(TWO_WEEKS_DAYS, "day").startOf("day");
    if (dayjs(newCheckIn).startOf("day").isBefore(minAllowed, "day")) {
      setEditError("Modifications require the reservation to be at least 14 days away.");
      return;
    }

    setSaving(true);

    let existingEntries = [];

    try {
      const availability = await triggerAvailabilityByRoom(editReservation.roomUnitId).unwrap();
      const blockedDates = new Set(
        (Array.isArray(availability) ? availability : [])
          .filter((entry) => entry.reservationId !== editReservation.id)
          .map((entry) => dayjs(entry.date).format("YYYY-MM-DD"))
      );

      const requestedDates = buildDateRange(newCheckIn, newCheckOut);
      const conflict = requestedDates.find((date) => blockedDates.has(date));
      if (conflict) {
        setEditError("That room is not available for the selected dates.");
        setSaving(false);
        return;
      }

      const existingAvailability = await triggerAvailabilityByReservation(editReservation.id).unwrap();
      existingEntries = Array.isArray(existingAvailability) ? existingAvailability : [];

      await Promise.all(
        existingEntries.map((entry) =>
          deleteAvailability(entry.id).unwrap()
        )
      );

      const updated = await updateReservation({
        id: editReservation.id,
        body: {
          ...editReservation,
          checkInDate: newCheckIn,
          checkOutDate: newCheckOut,
          numGuests: guests,
          status: "MODIFIED",
        },
      }).unwrap();

      await Promise.all(
        requestedDates.map((date) =>
          createAvailability({
            roomUnitId: editReservation.roomUnitId,
            reservationId: editReservation.id,
            date,
          }).unwrap()
        )
      );

      const updatedReservation = {
        ...editReservation,
        checkInDate: newCheckIn,
        checkOutDate: newCheckOut,
        numGuests: guests,
        status: "MODIFIED",
        ...(updated || {})
      };

      setReservations((prev) =>
        prev.map((r) => (r.id === editReservation.id ? updatedReservation : r))
      );

      handleCloseEdit();
    } catch (err) {
      if (existingEntries.length > 0) {
        await Promise.all(
          existingEntries.map((entry) =>
            createAvailability({
              roomUnitId: entry.roomUnitId,
              reservationId: entry.reservationId,
              date: dayjs(entry.date).format("YYYY-MM-DD"),
            }).unwrap()
          )
        );
      }
      setEditError(err?.message || "Failed to update reservation.");
    } finally {
      setSaving(false);
    }
  };

  const renderReservationCard = (reservation) => {
    const editable = isEditableReservation(reservation);
    const remaining = daysUntil(reservation.checkInDate);
    const isPast = typeof remaining === "number" && remaining < 0;
    const daysLabel = typeof remaining === "number"
      ? isPast
        ? `${Math.abs(remaining)} days ago`
        : `${remaining} days away`
      : null;
    const roomNumber = roomMap[reservation.roomUnitId]?.roomNumber;

    return (
      <Card
        key={reservation.id}
        sx={{
          bgcolor: "#383838",
          borderRadius: 3,
          border: "1px solid #2a2a2a",
          boxShadow: "0 8px 18px rgba(0,0,0,0.2)",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 12px 24px rgba(0,0,0,0.28)"
          }
        }}
      >
        <CardContent>
          <Stack direction={{ xs: "column", md: "row" }} spacing={3} alignItems={{ md: "center" }}>
            <Box sx={{ flexGrow: 1 }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="h6" fontWeight={700}>
                  Reservation
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {"#" + reservation.id}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 1 }}>
                {reservation.status && (
                  <Chip label={reservation.status} size="small" color="primary" variant="outlined" />
                )}
                {typeof remaining === "number" && (
                  <Chip
                    label={daysLabel}
                    size="small"
                    color={isPast ? "warning" : (remaining >= TWO_WEEKS_DAYS ? "success" : "warning")}
                    variant="outlined"
                  />
                )}
              </Stack>
              <Typography variant="body2" color="text.secondary">
                Room: {roomNumber ? `#${roomNumber}` : "Room details unavailable"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Check-in: {formatDate(reservation.checkInDate)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Check-out: {formatDate(reservation.checkOutDate)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Guests: {reservation.numGuests || 1}
              </Typography>
            </Box>
            <Stack spacing={1} sx={{ minWidth: { xs: "100%", md: 180 } }}>
              <Button
                variant="contained"
                onClick={() => handleOpenEdit(reservation)}
                disabled={!editable}
              >
                Modify
              </Button>
              {editable ? (
                <CancelBookingButton
                  reservationId={reservation.id}
                  onCancel={refetchReservations}
                />
              ) : (
                <Button variant="outlined" color="error" disabled>
                  Cancel
                </Button>
              )}
              {!editable && (
                <Typography variant="caption" color="text.secondary">
                  Changes allowed only 14+ days before check-in.
                </Typography>
              )}
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box sx={{ width: "100vw", maxWidth: "100%" }}>
      <Header showSearch={false} />
      <Box sx={{ display: "flex", width: "100vw", maxWidth: "100%", overflowX: "hidden" }}>
        <Box
          sx={{
            flexGrow: 1,
            bgcolor: "#2c2b2bff",
            minHeight: "100vh",
            minWidth: 0,
            px: { xs: 2, sm: 3, md: 4 },
            py: 3
          }}
        >
          <Box
            sx={{
              mb: 3,
              p: { xs: 2, md: 3 },
              borderRadius: 3,
              bgcolor: "#333333",
              border: "1px solid #2a2a2a",
              boxShadow: "0 10px 24px rgba(0,0,0,0.25)"
            }}
          >
            <Typography variant="h4" fontWeight={700}>
              My Reservations
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Review, modify, or cancel upcoming stays (changes allowed 14+ days before check-in).
            </Typography>
            <Stack direction="row" spacing={1.5} sx={{ mt: 2, flexWrap: "wrap" }}>
              <Chip label={`Upcoming: ${upcomingCount}`} color="success" variant="outlined" />
              <Chip label={`Past: ${pastCount}`} color="default" variant="outlined" />
            </Stack>
          </Box>

          {error && <Chip label={error} color="error" sx={{ mb: 2 }} />}

          {loading ? (
            <Stack alignItems="center" sx={{ py: 6 }}>
              <CircularProgress />
              <Typography variant="body2" sx={{ mt: 1 }}>
                Loading reservations...
              </Typography>
            </Stack>
          ) : (
            <Stack spacing={4}>
              <Box>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
                  Upcoming Reservations
                </Typography>
                <Stack spacing={2}>
                  {upcomingReservations.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No upcoming reservations found.
                    </Typography>
                  ) : (
                    upcomingReservations.map(renderReservationCard)
                  )}
                </Stack>
              </Box>

              <Divider sx={{ borderColor: "#424242" }} />

              <Box>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
                  Past Reservations
                </Typography>
                <Stack spacing={2}>
                  {pastReservations.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No past reservations found.
                    </Typography>
                  ) : (
                    pastReservations.map(renderReservationCard)
                  )}
                </Stack>
              </Box>
            </Stack>
          )}
        </Box>
      </Box>

      <Dialog
        open={editOpen}
        onClose={handleCloseEdit}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Modify Reservation</DialogTitle>
        <DialogContent dividers>
          {editReservation && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Room: {editRoomNumber ? `#${editRoomNumber}` : "Room details unavailable"}
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                <Chip
                  label={`Check-in: ${editCheckIn ? formatDate(editCheckIn) : "Select"}`}
                  variant="outlined"
                />
                <Chip
                  label={`Check-out: ${editCheckOut ? formatDate(editCheckOut) : "Select"}`}
                  variant="outlined"
                />
              </Stack>
              <CalendarPopup
                range={editRange}
                onSelect={handleCalendarSelect}
                bookedDates={blockedDates}
              />
              <Typography variant="caption" color="text.secondary">
                Dates in gray are unavailable or inside the 14-day window.
              </Typography>
              {nightsIncrease && (
                <Chip
                  label="Longer stay selected - additional payment will be required."
                  color="warning"
                  variant="outlined"
                />
              )}
              <TextField
                label="Guests"
                type="number"
                value={editGuests}
                onChange={(e) => handleGuestsChange(e.target.value)}
                inputProps={{ min: 1, max: editMaxGuests }}
                fullWidth
              />
              {editError && <Chip label={editError} color="error" />}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseEdit}
            disabled={saving}
            autoFocus
            ref={closeButtonRef}
          >
            Close
          </Button>
          <Button
            variant="contained"
            onClick={handleUpdateReservation}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
