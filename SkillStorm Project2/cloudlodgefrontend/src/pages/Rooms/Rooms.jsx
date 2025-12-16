import React, { useEffect, useState, useRef } from "react";
import Pagination from '@mui/material/Pagination';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
// Initial form state for Add Room
const INITIAL_FORM = {
  number: "",
  roomTypeId: "",
  price: "",
  maxGuests: "",
  amenities: "",
  description: "",
};
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Grid,
  Chip,
  Box,
  TextField,
  ImageList,
  ImageListItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Stack,
  Tooltip,
  IconButton,
  Paper,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import BedIcon from "@mui/icons-material/Bed";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import Header from "../../assets/components/Header";
import SideNav from "../../assets/components/SideNav";
import CloseIcon from '@mui/icons-material/Close';
import PhotoCamera from "@mui/icons-material/PhotoCamera";


const API_URL = "http://localhost:8080/rooms";

export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [page, setPage] = useState(1);
  const itemsPerPage = 18;
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const [form, setForm] = useState(INITIAL_FORM);

  function resetAddForm() {
    setForm(INITIAL_FORM);
  }

  const [editForm, setEditForm] = useState({
    price: "",
    maxGuests: "",
    amenities: "",
    description: "",
  });

  // Local draft state for edit modal
  const [editDraft, setEditDraft] = useState(null);
  // State for selected images in edit modal
  const [editImages, setEditImages] = useState([]);
  const fileInputRef = useRef();

  useEffect(() => {
    fetchRoomTypes();
    fetchRooms();
  }, []);

  async function fetchRoomTypes() {
    try {
      const res = await fetch("http://localhost:8080/roomtypes");
      if (!res.ok) throw new Error("Failed to fetch room types");
      setRoomTypes(await res.json());
    } catch (err) {
      setError(err.message);
    }
  }

  async function fetchRooms(callback) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Failed to fetch rooms");
      const data = await res.json();
      setRooms(data);
      if (callback) callback(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddRoom(e) {
    e.preventDefault();
    setError("");

    const rt = roomTypes.find((r) => r.id === form.roomTypeId);

    const payload = {
      roomNumber: parseInt(form.number),
      roomTypeId: form.roomTypeId,
      isActive: true,
    };

    if (form.price && parseFloat(form.price) !== rt?.pricePerNight) {
      payload.priceOverride = parseFloat(form.price);
    }

    if (form.maxGuests && parseInt(form.maxGuests) !== rt?.maxGuests) {
      payload.maxGuestsOverride = parseInt(form.maxGuests);
    }

    const amenitiesArr = form.amenities
      ? form.amenities.split(",").map((a) => a.trim())
      : [];

    if (amenitiesArr.join(",") !== (rt?.amenities?.join(",") ?? "")) {
      payload.amenitiesOverride = amenitiesArr;
    }

    if (form.description && form.description !== rt?.description) {
      payload.descriptionOverride = form.description;
    }

    try {
      const res = await fetch(`${API_URL}/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to add room");

      setAddModalOpen(false);
      resetAddForm();
      // Stay on the same page after adding
      fetchRooms();
    } catch (err) {
      setError(err.message);
    }
  }

  // Delete confirmation modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState(null);

  async function handleDeleteRoom(id) {
    try {
      const res = await fetch(`${API_URL}/delete/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete room");
      setModalOpen(false); // Always close the view modal after delete
      if (selectedRoom && (selectedRoom.id === id || selectedRoom._id === id)) {
        setEditMode(false);
        setSelectedRoom(null);
      }
      fetchRooms();
    } catch (err) {
      setError(err.message);
    }
    setDeleteModalOpen(false);
    setRoomToDelete(null);
  }

  function handleOpenModal(room) {
    setSelectedRoom(room);
    setEditMode(false);
    let amenitiesArr = [];
    if (Array.isArray(room.amenities)) {
      amenitiesArr = room.amenities;
    } else if (typeof room.amenities === 'string') {
      amenitiesArr = room.amenities.split(',').map(a => a.trim()).filter(a => a);
    } else {
      amenitiesArr = [""];
    }
    const initial = {
      price: room.price ?? "",
      maxGuests: room.maxGuests ?? "",
      amenities: amenitiesArr.length ? amenitiesArr : [""],
      description: room.description ?? "",
    };
    setEditForm(initial);
    setEditDraft(initial);
    setEditImages([]); // Reset new uploads
    setModalOpen(true);
  }

  async function handleSaveEdit() {
    if (!selectedRoom) return;

    setEditForm(editDraft);

    setTimeout(async () => {
      const amenitiesArr = Array.isArray(editDraft.amenities)
        ? editDraft.amenities.map(a => a.trim()).filter(a => a)
        : [];

      const payload = {
        id: selectedRoom.id || selectedRoom._id,
        roomNumber: selectedRoom.roomNumber,
        roomTypeId: selectedRoom.roomTypeId,
        isActive: selectedRoom.isActive,
        priceOverride: parseFloat(editDraft.price),
        maxGuestsOverride: parseInt(editDraft.maxGuests),
        amenitiesOverride: amenitiesArr,
        descriptionOverride: editDraft.description,
      };

      try {
        // Use FormData for multipart/form-data
        const formData = new FormData();
        formData.append("room", new Blob([JSON.stringify(payload)], { type: "application/json" }));
        // Append selected images
        if (editImages && editImages.length > 0) {
          for (let i = 0; i < editImages.length; i++) {
            formData.append("images", editImages[i]);
          }
        }

        const res = await fetch(
          `${API_URL}/update/${selectedRoom.id || selectedRoom._id}`,
          {
            method: "PUT",
            body: formData,
          }
        );

        if (!res.ok) throw new Error("Failed to update room");

        fetchRooms((updatedRooms) => {
          setRooms(updatedRooms);
          const id = selectedRoom.id || selectedRoom._id;
          const updatedRoom = updatedRooms.find(r => r.id === id || r._id === id);
          setSelectedRoom(updatedRoom || null);
          setEditMode(false);
          setEditImages([]);
        });
      } catch (err) {
        setError(err.message);
      }
    }, 0);
  }

   function resizeTo1500x1000(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 1500;
        canvas.height = 1000;

        const ctx = canvas.getContext("2d");

        // center-crop to avoid stretching
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

        canvas.toBlob(
          blob => blob ? resolve(blob) : reject(),
          "image/jpeg",
          0.9
        );
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
      />

      <Box sx={{ width: "100%"}}>

        {error && <Chip label={error} color="error" sx={{ mb: 2 }} />}

        <Box
          sx={{
            display: "flex",
            width: "100vw",
            maxWidth: "100vw",
            minHeight: "100%",
            alignItems: "stretch",
            overflowX: "hidden",
          }}
        >
          {/* Left side nav bar */}
          <SideNav />

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
              justifyContent: "space-between",
              mb: 3,
            }}
          >
            <Box sx={{ flex: 1 }} />

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

            <Box sx={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setAddModalOpen(true)}
              >
                Add Room
              </Button>
            </Box>
          </Box>


            {loading ? (
              <Typography>Loading…</Typography>
            ) : (
              <Box sx={{ width: '100%' }}>
                <Grid container spacing={3} justifyContent="center" alignItems="flex-start">
                  {rooms
                    .slice((page - 1) * itemsPerPage, page * itemsPerPage)
                    .map((room) => (
                      <Grid item xs={12} sm={6} md={4} lg={2.4} key={room.id || room._id}>
                        <Card
                          sx={{
                            borderRadius: 3,
                            overflow: "hidden",
                            cursor: "pointer",
                            transition: "0.2s",
                            bgcolor: "#383838",
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
                              width: "100%",
                              height: 160,
                              objectFit: "cover",
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
                              sx={{ my: 1 }}
                            />

                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              alignItems="center"
                            >
                              <Chip
                                icon={
                                  room.booked ? (
                                    <CancelIcon />
                                  ) : (
                                    <CheckCircleIcon />
                                  )
                                }
                                label={room.booked ? "Booked" : "Available"}
                                color={room.booked ? "error" : "success"}
                                size="small"
                              />

                              <Typography>
                                ${room.price}
                              </Typography>
                            </Stack>
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
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                            {/* DELETE CONFIRMATION MODAL */}
                            <Dialog
                              open={deleteModalOpen}
                              onClose={() => setDeleteModalOpen(false)}
                              hideBackdrop
                              onClick={e => e.stopPropagation()}
                            >
                              <DialogTitle>Delete this room?</DialogTitle>
                              <DialogContent>
                                <Typography>Are you sure you want to delete this room? This action cannot be undone.</Typography>
                              </DialogContent>
                              <DialogActions>
                                <Button onClick={() => setDeleteModalOpen(false)} color="inherit">Cancel</Button>
                                <Button onClick={() => handleDeleteRoom(roomToDelete)} color="error" variant="contained">Delete</Button>
                              </DialogActions>
                            </Dialog>

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
                          </CardActions>
                        </Card>
                      </Grid>
                    ))}
                </Grid>
                {/* Pagination below grid */}
                {rooms.length > itemsPerPage && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
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

      {/* DETAILS / EDIT MODAL */}
<Dialog
  open={modalOpen}
  onClose={() => {
    setModalOpen(false);
    setEditMode(false);
  }}
  maxWidth="md"
  fullWidth
>
  <DialogTitle
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      pb: 1.5,
      borderBottom: "1px solid",
      borderColor: "divider",
      bgcolor: 'background.default',
      color: 'text.primary',
    }}
  >
    <Typography variant="h6" fontWeight={700} component="span">
      Room Details
    </Typography>

    <IconButton
      size="small"
      color="error"
      onClick={() => {
        setModalOpen(false);
        setEditMode(false);
      }}
    >
      <CloseIcon fontSize="small" />
    </IconButton>
  </DialogTitle>

  <DialogContent dividers sx={{ pt: 3, pb: 3, bgcolor: 'background.default', color: 'text.primary' }}>
    {selectedRoom && (
      <Grid container spacing={4}>
        {/*DETAILS */}
        <Grid item xs={12} md={5}>
          <Stack spacing={2}>
            {editMode ? (
              editDraft && (
                <>
                  <TextField
                    label="Price"
                    fullWidth
                    value={editDraft.price}
                    onChange={e =>
                      setEditDraft(d => ({ ...d, price: e.target.value }))
                    }
                  />
                  <TextField
                    label="Max Guests"
                    fullWidth
                    value={editDraft.maxGuests}
                    onChange={e =>
                      setEditDraft(d => ({ ...d, maxGuests: e.target.value }))
                    }
                  />
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 1, mb: 1, display: 'block' }}>
                      Amenities
                    </Typography>
                    <Grid container spacing={2} columns={{ xs: 1, sm: 2 }}>
                      {editDraft.amenities.map((amenity, idx) => (
                        <Grid item xs={1} sm={1} key={idx} sx={{ display: 'flex', alignItems: 'center' }}>
                          <TextField
                            label={`Amenity ${idx + 1}`}
                            fullWidth
                            margin="dense"
                            value={amenity}
                            onChange={e => {
                              setEditDraft(d => {
                                const newAmenities = [...d.amenities];
                                newAmenities[idx] = e.target.value;
                                return { ...d, amenities: newAmenities };
                              });
                            }}
                          />
                          <IconButton
                            aria-label="Remove amenity"
                            color="error"
                            size="small"
                            sx={{ ml: 1, mt: 1 }}
                            disabled={editDraft.amenities.length === 1}
                            onClick={() => {
                              if (editDraft.amenities.length > 1) {
                                setEditDraft(d => ({
                                  ...d,
                                  amenities: d.amenities.filter((_, i) => i !== idx)
                                }));
                              }
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Grid>
                      ))}
                    </Grid>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<AddIcon />}
                      fullWidth
                      sx={{ mt: 2 }}
                      onClick={() => setEditDraft(d => ({ ...d, amenities: [...d.amenities, ""] }))}
                    >
                      Add Amenity
                    </Button>
                  </Box>
                  <TextField
                    label="Description"
                    fullWidth
                    multiline
                    rows={3}
                    value={editDraft.description}
                    onChange={e =>
                      setEditDraft(d => ({ ...d, description: e.target.value }))
                    }
                  />
                </>
              )
            ) : (
              <Stack spacing={2}>
                <Paper variant="outlined" sx={{ p: 2, pt: 3, bgcolor: 'background.paper', color: 'text.primary', position: 'relative', overflow: 'visible' }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 12,
                      transform: 'translateY(-50%)',
                      bgcolor: 'background.paper',
                      px: 0.5,
                      fontWeight: 700,
                      letterSpacing: 1,
                      zIndex: 1,
                    }}
                  >
                    Price
                  </Typography>
                  <Typography variant="h6">
                    ${selectedRoom.price}
                  </Typography>
                </Paper>
                <Paper variant="outlined" sx={{ p: 2, pt: 3, bgcolor: 'background.paper', color: 'text.primary', position: 'relative', overflow: 'visible' }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 12,
                      transform: 'translateY(-50%)',
                      bgcolor: 'background.paper',
                      px: 0.5,
                      fontWeight: 700,
                      letterSpacing: 1,
                      zIndex: 1,
                    }}
                  >
                    Max Guests
                  </Typography>
                  <Typography variant="h6">
                    {selectedRoom.maxGuests}
                  </Typography>
                </Paper>
                <Paper variant="outlined" sx={{ p: 2, pt: 3, bgcolor: 'background.paper', color: 'text.primary', position: 'relative', overflow: 'visible' }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 12,
                      transform: 'translateY(-50%)',
                      bgcolor: 'background.paper',
                      px: 0.5,
                      fontWeight: 700,
                      letterSpacing: 1,
                      zIndex: 1,
                    }}
                  >
                    Amenities
                  </Typography>
                  <Typography variant="body1">
                    {selectedRoom.amenities?.join(", ") || "None"}
                  </Typography>
                </Paper>
                <Paper variant="outlined" sx={{ p: 2, pt: 3, bgcolor: 'background.paper', color: 'text.primary', position: 'relative', overflow: 'visible' }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 12,
                      transform: 'translateY(-50%)',
                      bgcolor: 'background.paper',
                      px: 0.5,
                      fontWeight: 700,
                      letterSpacing: 1,
                      zIndex: 1,
                    }}
                  >
                    Description
                  </Typography>
                  <Typography variant="body1">
                    {selectedRoom.description || "None"}
                  </Typography>
                </Paper>
              </Stack>
            )}
          </Stack>
        </Grid>

        {/* IMAGES */}
        <Grid item xs={12} md={7}>
          {/* Show preview of new uploads, and always show images from backend */}
          {editMode && editDraft ? (
            <>
              {(selectedRoom.imagesOverride?.length > 0 || selectedRoom.images?.length > 0 || editImages.length > 0) ? (
                <Grid container spacing={2}>
                  {/* Existing images from backend */}
                  {(selectedRoom.imagesOverride || selectedRoom.images || []).map((img, i) => (
                    <Grid item xs={6} key={i}>
                      <Box
                        component="img"
                        src={img}
                        alt={`Room image ${i}`}
                        sx={{
                          width: "100%",
                          height: 160,
                          objectFit: "cover",
                          borderRadius: 2,
                        }}
                      />
                    </Grid>
                  ))}
                  {/* New uploads preview */}
                  {editImages && editImages.map((file, idx) => (
                    <Grid item xs={6} key={`new-${idx}`}>
                      <Box
                        component="img"
                        src={URL.createObjectURL(file)}
                        alt={`preview-${idx}`}
                        sx={{
                          width: "100%",
                          height: 160,
                          objectFit: "cover",
                          borderRadius: 2,
                          border: '2px dashed #1976d2',
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography color="text.secondary">
                  No images available
                </Typography>
              )}
              {/* Upload button at the bottom */}
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<PhotoCamera />}
                  fullWidth
                  sx={{ mb: 1 }}
                >
                  Upload Images
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    hidden
                    onChange={async e => {
                      if (e.target.files) {
                        const images = Array.from(e.target.files);
                        const resizedImage = await Promise.all(
                          images.map(file => resizeTo1500x1000(file))
                        );
                        setEditImages(resizedImage);
                      }
                    }}
                  />
                </Button>
              </Box>
            </>
          ) : (
            (selectedRoom.imagesOverride?.length > 0 || selectedRoom.images?.length > 0) ? (
              <Grid container spacing={2}>
                {(selectedRoom.imagesOverride || selectedRoom.images || []).map((img, i) => (
                  <Grid item xs={6} key={i}>
                    <Box
                      component="img"
                      src={img}
                      alt={`Room image ${i}`}
                      sx={{
                        width: "100%",
                        height: 160,
                        objectFit: "cover",
                        borderRadius: 2,
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography color="text.secondary">
                No images available
              </Typography>
            )
          )}
        </Grid>
      </Grid>
    )}
  </DialogContent>

  <DialogActions
    sx={{
      px: 3,
      py: 2,
      borderTop: "1px solid",
      borderColor: "divider",
      display: "flex",
      justifyContent: "space-between",
      bgcolor: 'background.default',
      color: 'text.primary',
    }}
  >
    <Button
      color="error"
      variant="contained"
      onClick={() => {
        if (selectedRoom) {
          setRoomToDelete(selectedRoom.id || selectedRoom._id);
          setDeleteModalOpen(true);
        }
      }}
    >
      Delete
    </Button>

    {editMode ? (
              <Stack direction="row" spacing={1}>
                <Button variant="outlined" onClick={() => {
                  setEditMode(false);
                  setEditDraft(editForm); // Reset draft to original values
                }}>Cancel</Button>
                <Button variant="contained" onClick={handleSaveEdit}>
                  Save
                </Button>
              </Stack>
            ) : (
              <Button variant="contained" onClick={() => setEditMode(true)}>
                Edit
              </Button>
            )}
  </DialogActions>
</Dialog>

    </Box>
  );
}
