import React, { useEffect, useState, useRef } from "react";
import Pagination from '@mui/material/Pagination';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import {
  Card, CardContent, CardActions, Typography, Button, Grid, Chip,
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
import EditModal from '../../components/EditModal';
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import DetailsModal from '../../components/DetailsModal';
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal';

import Header from "../../components/Header";
import { apiFetch } from "../../api/apiFetch";

const INITIAL_FORM = {
  number: "", roomTypeId: "", price: "", maxGuests: "", amenities: "", description: ""
};

export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [page, setPage] = useState(1);
  const itemsPerPage = 16;
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);
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
  const fileInputRef = useRef();

  useEffect(() => {
    fetchRoomTypes();
    fetchRooms();
  }, []);

  // Fetch all room types
  async function fetchRoomTypes() {
    try {
      const data = await apiFetch("/roomtypes");
      setRoomTypes(data);
    } catch (err) {
      setError(err.message);
    }
  }

  // Fetch all rooms
  async function fetchRooms(callback) {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch("/rooms");
      setRooms(data);
      if (callback) callback(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

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
      await apiFetch("/rooms/create", { method: "POST", body: payload });
      setAddModalOpen(false);
      resetAddForm();
      fetchRooms();
    } catch (err) {
      setError(err.message);
    }
  }

  // Delete a room
  async function handleDeleteRoom(id) {
    setError("");
    try {
      await apiFetch(`/rooms/delete/${id}`, { method: "DELETE" });
      setModalOpen(false);
      if (selectedRoom && (selectedRoom.id === id || selectedRoom._id === id)) {
        setEditMode(false);
        setSelectedRoom(null);
      }
      fetchRooms();
    } catch (err) {
      setError(err.message);
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


        const updatedRoom = await apiFetch(
          `/rooms/update/${selectedRoom.id || selectedRoom._id}`,
          { method: "PUT", body: formData }
        );
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
        setError(err.message);
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

  return (
  <Box>
      <Header 
      setRooms={setRooms}
      setLoading={setLoading}
      setError={setError}
      showSearch={false}
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
            bgcolor: "#2c2b2bff",
            borderLeft: "2px solid #232323",
            borderRight: "2px solid #232323",
            px: { xs: 1, sm: 2, md: 4 },
            py: 2,
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            }}
          >
            <Box
            sx={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 3,
            }}
          >
            <Box sx={{ maxWidth: 1380, width: "100%", display: "flex", justifyContent: "flex-start", gap: 3 }}>
              <Box sx={{ width: "50%" }} /> {/* Spacer for first card */}
              <Box sx={{ width: "50%" }} /> {/* Spacer for second card */}
              <Box sx={{ width: "50%" }} /> {/* Spacer for third card */}
              <Box sx={{ width: "20%", display: "flex", alignItems: "center" }}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setAddModalOpen(true)}
                >
                  Add Room
                </Button>
              </Box>
            </Box>
          </Box>


            {loading ? (
              <Typography>Loading…</Typography>
            ) : (
              <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Box sx={{ maxWidth: 1380, width: '100%' }}>
                  <Grid container spacing={3} justifyContent="flex-start">
                    {rooms
                      .slice((page - 1) * itemsPerPage, page * itemsPerPage)
                      .map((room) => (
                        <Grid item key={room.id || room._id}>
                          <Card
                          sx={{
                            borderRadius: 3,
                            overflow: "hidden",
                            cursor: "pointer",
                            transition: "0.2s",
                            bgcolor: "#383838",
                            width: 320,
                            minWidth: 320,
                            maxWidth: 320,
                            mx: "auto",
                            "&:hover": { transform: "translateY(-4px)" },
                          }}
                          onClick={() => handleOpenModal(room)}
                        >
                          <Box
                            component="img"
                            src={
                              room.images?.length
                                ? room.images[0]
                                : "https://picsum.photos/400/250"
                            }
                            alt={`Room ${room.roomNumber}`}
                            sx={{
                              width: 320,
                              minWidth: 320,
                              maxWidth: 320,
                              height: 160,
                              objectFit: "cover",
                              display: "block",
                              mx: "auto"
                            }}
                          />

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
                              sx={{ my: 1, bgcolor: '#1976d2', color: '#fff', fontWeight: 700, letterSpacing: 1 }}
                            />

                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              alignItems="center"
                            >
                              <Chip
                                icon={
                                  room.isActive === false ? <CancelIcon /> : (room.booked ? <CancelIcon /> : <CheckCircleIcon />)
                                }
                                label={room.isActive === false ? "Maintenance" : (room.booked ? "Booked" : "Available")}
                                color={room.isActive === false ? "warning" : (room.booked ? "error" : "success")}
                                size="small"
                              />
                              <Typography>
                                ${room.price}
                              </Typography>
                            </Stack>
                            
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
                                      const updatedRoom = await apiFetch(
                                        `/rooms/set-active/${room.id || room._id}?isActive=true`,
                                        { method: "PUT" }
                                      );
                                      const updatedId = updatedRoom.id || updatedRoom._id;
                                      setRooms(prevRooms => prevRooms.map(r =>
                                        (r.id || r._id) === updatedId ? { ...r, ...updatedRoom } : r
                                      ));
                                    } catch (err) {
                                      setError(err.message);
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
                                      const updatedRoom = await apiFetch(
                                        `/rooms/set-active/${room.id || room._id}?isActive=false`,
                                        { method: "PUT" }
                                      );
                                      const updatedId = updatedRoom.id || updatedRoom._id;
                                      setRooms(prevRooms => prevRooms.map(r =>
                                        (r.id || r._id) === updatedId ? { ...r, ...updatedRoom } : r
                                      ));
                                    } catch (err) {
                                      setError(err.message);
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
                      </Grid>
                    ))}
                  </Grid>
                </Box>
                {/* Pagination below grid */}
                {rooms.length > itemsPerPage && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, width: '100%' }}>
                    <Pagination
                      count={Math.ceil(rooms.length / itemsPerPage)}
                      page={page}
                      onChange={(_, value) => setPage(value)}
                      sx={{
                        '& .MuiPaginationItem-root': {
                          color: '#fff',
                          backgroundColor: '#232323',
                          border: '1px solid #444',
                          transition: 'background 0.2s',
                        },
                        '& .Mui-selected': {
                          backgroundColor: '#1976d2',
                          color: '#fff',
                          border: '2px solid #1976d2',
                        },
                        '& .MuiPaginationItem-root:hover': {
                          backgroundColor: '#333',
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
