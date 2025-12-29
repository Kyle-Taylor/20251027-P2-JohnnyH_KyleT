import React, { useCallback, useEffect, useMemo, useState } from "react";
import Pagination from '@mui/material/Pagination';
import {
  Card, CardContent, CardActions, Typography, Button, Chip,
  Box, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  Divider, Select, MenuItem, InputLabel, FormControl, Stack,
  Tooltip, IconButton, Paper
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import BedIcon from "@mui/icons-material/Bed";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import CloseIcon from '@mui/icons-material/Close';
import DetailsModal from '../../components/DetailsModal';
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal';
import RoomsFilters from "../../components/RoomsFilters";

import Header from "../../components/Header";
import {
  useCreateRoomMutation,
  useDeleteRoomMutation,
  useGetRoomTypesQuery,
  useGetRoomsQuery,
  useSetRoomActiveMutation,
  useUpdateRoomMutation,
} from "../../store/apiSlice";

const INITIAL_FORM = {
  number: "", roomTypeId: "", price: "", maxGuests: "", amenities: "", description: ""
};

export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [page, setPage] = useState(1);
  const itemsPerPage = 15;
  const [roomTypes, setRoomTypes] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState("");

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [imagesToDelete, setImagesToDelete] = useState([]);

  const [form, setForm] = useState(INITIAL_FORM);
  const [editForm, setEditForm] = useState({ price: "", maxGuests: "", amenities: "", description: "" });
  const [editDraft, setEditDraft] = useState(null);
  const [editImages, setEditImages] = useState([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState(null);
  const handleRoomsUpdate = useCallback((data) => {
    setRooms(data);
    setPage(1);
  }, []);
  const [filterRoomTypeId, setFilterRoomTypeId] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterRoomNumber, setFilterRoomNumber] = useState("");
  const [filterPriceMin, setFilterPriceMin] = useState("");
  const [filterPriceMax, setFilterPriceMax] = useState("");
  const [sortOrder, setSortOrder] = useState("roomNumberAsc");
  const {
    data: roomTypesData,
    isLoading: roomTypesLoading,
    isFetching: roomTypesFetching,
    error: roomTypesError,
  } = useGetRoomTypesQuery();
  const {
    data: roomsData,
    isLoading: roomsLoading,
    isFetching: roomsFetching,
    error: roomsError,
    refetch: refetchRooms,
  } = useGetRoomsQuery();
  const [createRoom] = useCreateRoomMutation();
  const [updateRoom] = useUpdateRoomMutation();
  const [deleteRoom] = useDeleteRoomMutation();
  const [setRoomActive] = useSetRoomActiveMutation();
  const loading = roomsLoading || roomTypesLoading || roomsFetching || roomTypesFetching || searchLoading;

  useEffect(() => {
    if (Array.isArray(roomTypesData)) {
      setRoomTypes(roomTypesData);
    } else if (roomTypesData) {
      setRoomTypes([]);
    }
  }, [roomTypesData]);

  useEffect(() => {
    if (Array.isArray(roomsData)) {
      setRooms(roomsData);
    } else if (roomsData) {
      setRooms([]);
    }
  }, [roomsData]);

  useEffect(() => {
    if (roomTypesError) {
      setError(roomTypesError?.message || "Failed to load room types.");
      return;
    }
    if (roomsError) {
      setError(roomsError?.message || "Failed to load rooms.");
      return;
    }
    setError("");
  }, [roomTypesError, roomsError]);

  useEffect(() => {
    setPage(1);
  }, [filterRoomTypeId, filterStatus, filterRoomNumber, filterPriceMin, filterPriceMax, sortOrder]);

  function resetAddForm() {
    setForm(INITIAL_FORM);
  }

  // Add a room
  async function handleAddRoom(e) {
    e.preventDefault();
    setError("");

    const rt = roomTypes.find(r => r.id === form.roomTypeId);

    const payload = {
      roomNumber: parseInt(form.number),
      roomTypeId: form.roomTypeId,
      isActive: true
    };

    if (form.price && parseFloat(form.price) !== rt?.pricePerNight) payload.priceOverride = parseFloat(form.price);
    if (form.maxGuests && parseInt(form.maxGuests) !== rt?.maxGuests) payload.maxGuestsOverride = parseInt(form.maxGuests);

    const amenitiesArr = form.amenities ? form.amenities.split(",").map(a => a.trim()) : [];
    if (amenitiesArr.join(",") !== (rt?.amenities?.join(",") ?? "")) payload.amenitiesOverride = amenitiesArr;
    if (form.description && form.description !== rt?.description) payload.descriptionOverride = form.description;

    try {
      await createRoom(payload).unwrap();
      setAddModalOpen(false);
      resetAddForm();
      refetchRooms();
    } catch (err) {
      setError(err?.message || "Failed to add room.");
    }
  }

  // Delete a room
  async function handleDeleteRoom(id) {
    setError("");
    try {
      await deleteRoom(id).unwrap();
      setModalOpen(false);
      if (selectedRoom && (selectedRoom.id === id || selectedRoom._id === id)) {
        setEditMode(false);
        setSelectedRoom(null);
      }
      refetchRooms();
    } catch (err) {
      setError(err?.message || "Failed to delete room.");
    } finally {
      setDeleteModalOpen(false);
      setRoomToDelete(null);
    }
  }

  // Open edit modal
  function handleOpenModal(room) {
    setImagesToDelete([]);
    setSelectedRoom(room);
    setEditMode(false);

    const amenitiesArr = Array.isArray(room.amenities)
      ? room.amenities
      : typeof room.amenities === "string"
        ? room.amenities.split(",").map(a => a.trim()).filter(Boolean)
        : [""];

    const initial = {
      price: room.price ?? "",
      maxGuests: room.maxGuests ?? "",
      amenities: amenitiesArr,
      description: room.description ?? ""
    };

    setEditForm(initial);
    setEditDraft(initial);
    setEditImages([]);
    setModalOpen(true);
  }

  // Save edited room
  async function handleSaveEdit() {
    if (!selectedRoom) return;
    setEditForm(editDraft);

    setTimeout(async () => {
      const amenitiesArr = Array.isArray(editDraft.amenities)
        ? editDraft.amenities.map(a => a.trim()).filter(Boolean)
        : [];

      const payload = {
        id: selectedRoom.id || selectedRoom._id,
        roomNumber: selectedRoom.roomNumber,
        roomTypeId: selectedRoom.roomTypeId,
        isActive: selectedRoom.isActive,
        priceOverride: parseFloat(editDraft.price),
        maxGuestsOverride: parseInt(editDraft.maxGuests),
        amenitiesOverride: amenitiesArr,
        descriptionOverride: editDraft.description
      };

      try {
        const formData = new FormData();
        formData.append("room", new Blob([JSON.stringify(payload)], { type: "application/json" }));
        // Append selected images
        if (editImages && editImages.length > 0) {
          for (let i = 0; i < editImages.length; i++) {
            formData.append("images", editImages[i]);
          }
        }
        // Append deleted images
        if (imagesToDelete.length > 0) {
          formData.append(
            "deleteImages",
            new Blob([JSON.stringify(imagesToDelete)], {
              type: "application/json"
            })
          );
        }


        const updatedRoom = await updateRoom({
          id: selectedRoom.id || selectedRoom._id,
          body: formData,
        }).unwrap();
        const updatedId = updatedRoom?.id || updatedRoom?._id || selectedRoom?.id || selectedRoom?._id;
        const priceValue = Number.isFinite(payload.priceOverride) ? payload.priceOverride : selectedRoom.price;
        const maxGuestsValue = Number.isFinite(payload.maxGuestsOverride) ? payload.maxGuestsOverride : selectedRoom.maxGuests;
        const resolvedUpdate = {
          ...selectedRoom,
          ...updatedRoom,
          price: priceValue,
          maxGuests: maxGuestsValue,
          amenities: amenitiesArr,
          description: editDraft.description ?? selectedRoom.description,
          images: Array.isArray(updatedRoom?.imagesOverride) && updatedRoom.imagesOverride.length > 0
            ? updatedRoom.imagesOverride
            : selectedRoom.images
        };
        setRooms(prev => prev.map(r => ((r.id || r._id) === updatedId ? resolvedUpdate : r)));
        setSelectedRoom(resolvedUpdate);
        setEditMode(false);
        setEditForm({
          price: priceValue,
          maxGuests: maxGuestsValue,
          amenities: amenitiesArr,
          description: editDraft.description ?? ""
        });
        setEditDraft(prev => ({
          ...prev,
          price: priceValue,
          maxGuests: maxGuestsValue,
          amenities: amenitiesArr,
          description: editDraft.description ?? prev?.description ?? ""
        }));
        setEditImages([]);
      } catch (err) {
        setError(err?.message || "Failed to update room.");
      }
    }, 0);
  }

  // Resize uploaded images
  function resizeTo1500x1000(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 1500;
        canvas.height = 1000;
        const ctx = canvas.getContext("2d");
        const srcRatio = img.width / img.height;
        const targetRatio = 1500 / 1000;
        let sx, sy, sw, sh;
        if (srcRatio > targetRatio) {
          sh = img.height;
          sw = sh * targetRatio;
          sx = (img.width - sw) / 2;
          sy = 0;
        } else {
          sw = img.width;
          sh = sw / targetRatio;
          sx = 0;
          sy = (img.height - sh) / 2;
        }
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, 1500, 1000);
        canvas.toBlob(blob => blob ? resolve(blob) : reject(), "image/jpeg", 0.9);
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  const filteredRooms = useMemo(() => {
    const numberFilter = filterRoomNumber.trim();
    const minPrice = filterPriceMin !== "" ? Number(filterPriceMin) : null;
    const maxPrice = filterPriceMax !== "" ? Number(filterPriceMax) : null;
    const statusFilter = filterStatus.toLowerCase();

    const filtered = rooms.filter(room => {
      if (filterRoomTypeId) {
        if ((room.roomTypeId || "") !== filterRoomTypeId) return false;
      }

      if (numberFilter) {
        const roomNumber = room.roomNumber != null ? String(room.roomNumber) : "";
        if (!roomNumber.includes(numberFilter)) return false;
      }

      if (statusFilter !== "all") {
        const isMaintenance = room.isActive === false;
        const isBooked = Boolean(room.booked);
        const isAvailable = room.isActive !== false && !isBooked;

        if (statusFilter === "maintenance" && !isMaintenance) return false;
        if (statusFilter === "booked" && !isBooked) return false;
        if (statusFilter === "available" && !isAvailable) return false;
      }

      const price = Number(room.price);
      if (Number.isFinite(minPrice) && Number.isFinite(price) && price < minPrice) return false;
      if (Number.isFinite(maxPrice) && Number.isFinite(price) && price > maxPrice) return false;

      return true;
    });

    const toNumber = (value) => {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : null;
    };

    return [...filtered].sort((a, b) => {
      if (sortOrder === "roomNumberDesc") {
        return (toNumber(b.roomNumber) ?? 0) - (toNumber(a.roomNumber) ?? 0);
      }
      if (sortOrder === "priceAsc") {
        return (toNumber(a.price) ?? 0) - (toNumber(b.price) ?? 0);
      }
      if (sortOrder === "priceDesc") {
        return (toNumber(b.price) ?? 0) - (toNumber(a.price) ?? 0);
      }
      return (toNumber(a.roomNumber) ?? 0) - (toNumber(b.roomNumber) ?? 0);
    });
  }, [rooms, filterRoomTypeId, filterStatus, filterRoomNumber, filterPriceMin, filterPriceMax, sortOrder]);


  return (
  <Box
    sx={{
      background:
        "radial-gradient(circle at 0% 0%, rgba(125,211,252,0.16), transparent 45%), radial-gradient(circle at 90% 10%, rgba(96,165,250,0.16), transparent 45%), #0f1113",
    }}
  >
      <Header 
      setRooms={handleRoomsUpdate}
      setLoading={setSearchLoading}
      setError={setError}
      showSearch
      hideGuests
      searchMaxWidth={200}
      searchHeight={55}
      searchParams={{ includeBooked: true }}
      />

      <Box sx={{ width: "100%"}}>

        {error && <Chip label={error} color="error" sx={{ mb: 2 }} />}

        <Box
          sx={{
            display: "flex",
            width: "100vw",
            maxWidth: "99.2vw",
            minHeight: "100%",
            alignItems: "stretch",
            overflowX: "hidden",
          }}
        >
          {/* Left side nav bar */}

          {/* Center stage for grid */}
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
            }}
          >
            <Box sx={{ width: "100%", display: "flex", justifyContent: "center", mb: 3 }}>
              <Paper
                sx={{
                  width: "100%",
                  maxWidth: 1640,
                  p: { xs: 2.5, md: 3.5 },
                  bgcolor: "rgba(21, 26, 31, 0.92)",
                  border: "1px solid rgba(125, 211, 252, 0.22)",
                  boxShadow: "0 28px 60px rgba(6, 15, 24, 0.5)",
                  position: "relative",
                  overflow: "hidden"
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage:
                      "linear-gradient(135deg, rgba(125,211,252,0.18), rgba(15,17,19,0.92)), url(https://picsum.photos/1200/320?blur=2)",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    opacity: 0.35
                  }}
                />
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  spacing={2}
                  alignItems={{ xs: "flex-start", md: "center" }}
                  justifyContent="space-between"
                  sx={{ position: "relative" }}
                >
                  <Box>
                    <Typography variant="h3" fontWeight={700}>
                      Rooms Overview
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      Manage availability, maintenance, and pricing overrides across the property.
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    <Chip
                      label={`${rooms.length} total`}
                      sx={{ bgcolor: "rgba(125, 211, 252, 0.2)", color: "#e6edf6" }}
                    />
                    <Chip
                      label={`${filteredRooms.length} shown`}
                      variant="outlined"
                      sx={{ borderColor: "rgba(125, 211, 252, 0.4)" }}
                    />
                  </Stack>
                </Stack>
              </Paper>
            </Box>
            <Box sx={{ width: "100%", display: "flex", justifyContent: "center", mb: 3 }}>
              <Box sx={{ maxWidth: 1640, width: "100%" }}>
                <RoomsFilters
                  roomTypes={roomTypes}
                  roomsCount={rooms.length}
                  filteredCount={filteredRooms.length}
                  filterRoomTypeId={filterRoomTypeId}
                  filterStatus={filterStatus}
                  filterRoomNumber={filterRoomNumber}
                  filterPriceMin={filterPriceMin}
                  filterPriceMax={filterPriceMax}
                  sortOrder={sortOrder}
                  onRoomTypeChange={setFilterRoomTypeId}
                  onStatusChange={setFilterStatus}
                  onRoomNumberChange={setFilterRoomNumber}
                  onPriceMinChange={setFilterPriceMin}
                  onPriceMaxChange={setFilterPriceMax}
                  onSortChange={setSortOrder}
                  onAddRoom={() => setAddModalOpen(true)}
                  onClearFilters={() => {
                    setFilterRoomTypeId("");
                    setFilterStatus("all");
                    setFilterRoomNumber("");
                    setFilterPriceMin("");
                    setFilterPriceMax("");
                    setSortOrder("roomNumberAsc");
                  }}
                />
              </Box>
            </Box>


            {loading ? (
              <Typography>Loading…</Typography>
            ) : (
              <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Box sx={{ maxWidth: 1640, width: '100%' }}>
                  {filteredRooms.length === 0 ? (
                    <Box sx={{ textAlign: "center", py: 6 }}>
                      <Typography variant="h6" color="text.secondary">
                        No rooms match those filters
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Try adjusting type, status, number, or price.
                      </Typography>
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: {
                          xs: "1fr",
                          sm: "repeat(2, minmax(0, 1fr))",
                          md: "repeat(3, minmax(0, 1fr))",
                          lg: "repeat(5, minmax(0, 1fr))"
                        },
                        gap: 2
                      }}
                    >
                      {filteredRooms
                        .slice((page - 1) * itemsPerPage, page * itemsPerPage)
                        .map((room) => (
                          <Box key={room.id || room._id}>
                            <Card
                              sx={{
                                borderRadius: 3,
                                overflow: "hidden",
                                cursor: "pointer",
                                transition: "0.2s",
                                bgcolor: "rgba(21, 26, 31, 0.92)",
                                width: "100%",
                                "&:hover": { transform: "translateY(-4px)" },
                              }}
                              onClick={() => handleOpenModal(room)}
                            >
                              <Box sx={{ position: "relative" }}>
                                <Box
                                  component="img"
                                  src={
                                    room.images?.length
                                      ? room.images[0]
                                      : "https://picsum.photos/400/250"
                                  }
                                  alt={`Room ${room.roomNumber}`}
                                  sx={{
                                    width: "100%",
                                    height: 170,
                                    objectFit: "cover",
                                    display: "block",
                                  }}
                                />
                                <Box
                                  sx={{
                                    position: "absolute",
                                    inset: 0,
                                    background:
                                      "linear-gradient(180deg, rgba(15,17,19,0.05) 20%, rgba(15,17,19,0.75) 100%)"
                                  }}
                                />
                                <Chip
                                  icon={
                                    room.isActive === false ? <CancelIcon /> : (room.booked ? <CancelIcon /> : <CheckCircleIcon />)
                                  }
                                  label={room.isActive === false ? "Maintenance" : (room.booked ? "Booked" : "Available")}
                                  color={room.isActive === false ? "warning" : (room.booked ? "error" : "success")}
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

                              <CardContent>
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
                                    boxShadow: "0 10px 18px rgba(6, 15, 24, 0.4)"
                                  }}
                                />

                                <Box sx={{ height: 40, mt: 1, display: "flex", alignItems: "center" }}>
                                  {/* Maintenance/Active Toggle Button */}
                                  {room.isActive === false ? (
                                    <Button
                                      variant="outlined"
                                      color="success"
                                      size="small"
                                      fullWidth
                                      onClick={async (e) => {
                                        e.stopPropagation();
                                        try {
                                          const updatedRoom = await setRoomActive({
                                            id: room.id || room._id,
                                            isActive: true,
                                          }).unwrap();
                                          const updatedId = updatedRoom.id || updatedRoom._id;
                                          setRooms(prevRooms => prevRooms.map(r =>
                                            (r.id || r._id) === updatedId ? { ...r, ...updatedRoom } : r
                                          ));
                                        } catch (err) {
                                          setError(err?.message || "Failed to update room status.");
                                        }
                                      }}
                                    >
                                      Set Active
                                    </Button>
                                  ) : (!room.booked ? (
                                    <Button
                                      variant="outlined"
                                      color="warning"
                                      size="small"
                                      fullWidth
                                      onClick={async (e) => {
                                        e.stopPropagation();
                                        try {
                                          const updatedRoom = await setRoomActive({
                                            id: room.id || room._id,
                                            isActive: false,
                                          }).unwrap();
                                          const updatedId = updatedRoom.id || updatedRoom._id;
                                          setRooms(prevRooms => prevRooms.map(r =>
                                            (r.id || r._id) === updatedId ? { ...r, ...updatedRoom } : r
                                          ));
                                        } catch (err) {
                                          setError(err?.message || "Failed to update room status.");
                                        }
                                      }}
                                    >
                                      Set Inactive
                                    </Button>
                                  ) : null)}
                                </Box>
                              </CardContent>

                              <CardActions sx={{ justifyContent: "flex-end" }}>
                                <Tooltip title="Delete Room">
                                  <IconButton
                                    color="error"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setRoomToDelete(room.id || room._id);
                                      setDeleteModalOpen(true);
                                    }}
                                    onMouseDown={e => e.stopPropagation()}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="View Details">
                                  <IconButton
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenModal(room);
                                    }}
                                  >
                                    <InfoOutlinedIcon />
                                  </IconButton>
                                </Tooltip>
                                {/* Global Delete Confirmation Modal - only rendered when open */}
                                {deleteModalOpen && (
                                  <DeleteConfirmationModal
                                    open={deleteModalOpen}
                                    onClose={e => {
                                      if (e && e.stopPropagation) e.stopPropagation();
                                      setDeleteModalOpen(false);
                                    }}
                                    onConfirm={() => handleDeleteRoom(roomToDelete)}
                                    text="Are you sure you want to delete this room? This action cannot be undone."
                                  />
                                )}
                              </CardActions>
                            </Card>
                          </Box>
                    ))}
                  </Box>
                  )}
                </Box>
                {/* Pagination below grid */}
                {filteredRooms.length > itemsPerPage && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, width: '100%' }}>
                    <Pagination
                      count={Math.ceil(filteredRooms.length / itemsPerPage)}
                      page={page}
                      onChange={(_, value) => setPage(value)}
                      sx={{
                        '& .MuiPaginationItem-root': {
                          color: '#e6edf6',
                          backgroundColor: 'rgba(21, 26, 31, 0.9)',
                          border: '1px solid rgba(125, 211, 252, 0.2)',
                          transition: 'background 0.2s',
                        },
                        '& .Mui-selected': {
                          backgroundColor: 'rgba(125, 211, 252, 0.3)',
                          color: '#e6edf6',
                          border: '2px solid rgba(125, 211, 252, 0.4)',
                        },
                        '& .MuiPaginationItem-root:hover': {
                          backgroundColor: 'rgba(21, 26, 31, 0.95)',
                        },
                      }}
                    />
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {/* ADD ROOM MODAL */}
      <Dialog open={addModalOpen} onClose={() => { setAddModalOpen(false); resetAddForm(); }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 1, bgcolor: 'background.default', color: 'text.primary' }}>
          Add Room
          <IconButton size="small" color="error" onClick={() => { setAddModalOpen(false); resetAddForm(); }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ bgcolor: 'background.default', color: 'text.primary' }}>
          <Box component="form" onSubmit={handleAddRoom}>
            <TextField
              label="Room Number"
              fullWidth
              margin="dense"
              required
              value={form.number}
              onChange={(e) =>
                setForm({ ...form, number: e.target.value })
              }
            />

            <FormControl fullWidth margin="dense">
              <InputLabel>Room Type</InputLabel>
              <Select
                value={form.roomTypeId}
                label="Room Type"
                onChange={(e) => {
                  const rt = roomTypes.find(
                    (r) => r.id === e.target.value
                  );
                  setForm({
                    ...form,
                    roomTypeId: e.target.value,
                    price: rt?.pricePerNight ?? "",
                    maxGuests: rt?.maxGuests ?? "",
                    amenities: rt?.amenities?.join(", ") ?? "",
                    description: rt?.description ?? "",
                  });
                }}
              >
                {roomTypes.map((rt) => (
                  <MenuItem key={rt.id} value={rt.id}>
                    {rt.roomCategory}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Price"
              fullWidth
              margin="dense"
              value={form.price}
              onChange={(e) =>
                setForm({ ...form, price: e.target.value })
              }
            />

            <TextField
              label="Max Guests"
              fullWidth
              margin="dense"
              value={form.maxGuests}
              onChange={(e) =>
                setForm({ ...form, maxGuests: e.target.value })
              }
            />

            <TextField
              label="Amenities"
              fullWidth
              margin="dense"
              value={form.amenities}
              onChange={(e) =>
                setForm({ ...form, amenities: e.target.value })
              }
            />

            <TextField
              label="Description"
              fullWidth
              margin="dense"
              multiline
              rows={2}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ bgcolor: 'background.default', color: 'text.primary' }}>
          <Button onClick={() => { setAddModalOpen(false); resetAddForm(); }}>Cancel</Button>
          <Button variant="contained" onClick={handleAddRoom}>
            Add
          </Button>
        </DialogActions>
      </Dialog>


      {/* DETAILS / EDIT MODAL (reusable) */}
      <DetailsModal
  open={modalOpen}
  onClose={() => {
    setModalOpen(false);
    setEditMode(false);
  }}
  data={selectedRoom}
  editMode={editMode}
  onEditToggle={() => setEditMode(true)}
  onSave={handleSaveEdit}
  onDelete={() => {
    if (selectedRoom) {
      setRoomToDelete(selectedRoom.id || selectedRoom._id);
      setDeleteModalOpen(true);
    }
  }}
  editDraft={editDraft}
  setEditDraft={setEditDraft}
  editImages={editImages}
  setEditImages={setEditImages}
  imagesToDelete={imagesToDelete}
  setImagesToDelete={setImagesToDelete}
  type="room"
/>
    </Box>
  );
}
