import React, { useEffect, useState } from "react";
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
import RoomsHeader from "./RoomsHeader";
import CloseIcon from '@mui/icons-material/Close';

const API_URL = "http://localhost:8080/rooms";

export default function Rooms() {
  const [rooms, setRooms] = useState([]);
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

  async function fetchRooms() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Failed to fetch rooms");
      setRooms(await res.json());
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
      fetchRooms();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteRoom(id) {
    if (!window.confirm("Delete this room?")) return;
    try {
      const res = await fetch(`${API_URL}/delete/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete room");
      fetchRooms();
    } catch (err) {
      setError(err.message);
    }
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
    setModalOpen(true);
  }

  async function handleSaveEdit() {
    if (!selectedRoom) return;

    // Copy draft to editForm, then run save logic
    setEditForm(editDraft);

    // Use a callback to ensure latest draft is used
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
        const res = await fetch(
          `${API_URL}/update/${selectedRoom.id || selectedRoom._id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );

        if (!res.ok) throw new Error("Failed to update room");

        // Re-fetch the full rooms list and update state
        const refreshed = await fetch(API_URL);
        if (!refreshed.ok) throw new Error("Failed to fetch updated rooms");
        const updatedRooms = await refreshed.json();
        setRooms(updatedRooms);
        // Find the updated room and update selectedRoom
        const id = selectedRoom.id || selectedRoom._id;
        const updatedRoom = updatedRooms.find(r => r.id === id || r._id === id);
        setSelectedRoom(updatedRoom || null);
        setEditMode(false);
      } catch (err) {
        setError(err.message);
      }
    }, 0);
  }

  return (
    <Box sx={{ width: "100%", minHeight: "100vh", bgcolor: "white" }}>
      <RoomsHeader />

      <Box sx={{ width: "100vw", px: 0, py: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
          <Box sx={{ ml: 'auto', pr: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setAddModalOpen(true)}
            >
              Add Room
            </Button>
          </Box>
        </Box>

        {error && <Chip label={error} color="error" sx={{ mb: 2 }} />}

        {loading ? (
          <Typography>Loading…</Typography>
        ) : (
          <Grid container spacing={3} justifyContent="flex-start" alignItems="flex-start" sx={{ width: 1 }}>
            {rooms.map((room) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={room.id || room._id}>
                <Card
                  sx={{
                    borderRadius: 3,
                    overflow: "hidden",
                    cursor: "pointer",
                    transition: "0.2s",
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

                      <Typography fontWeight={700}>
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
                          handleDeleteRoom(room.id || room._id);
                        }}
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
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* ADD ROOM MODAL */}
      <Dialog open={addModalOpen} onClose={() => { setAddModalOpen(false); resetAddForm(); }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 1 }}>
          Add Room
          <IconButton size="small" color="error" onClick={() => { setAddModalOpen(false); resetAddForm(); }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent>
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

        <DialogActions>
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

  <DialogContent dividers sx={{ pt: 3, pb: 3 }}>
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
                    InputLabelProps={{ sx: { fontWeight: '700 !important' } }}
                    onChange={e =>
                      setEditDraft(d => ({ ...d, price: e.target.value }))
                    }
                  />
                  <TextField
                    label="Max Guests"
                    fullWidth
                    value={editDraft.maxGuests}
                    InputLabelProps={{ sx: { fontWeight: '700 !important' } }}
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
                            InputLabelProps={{ sx: { fontWeight: '700 !important' } }}
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
                    InputLabelProps={{ sx: { fontWeight: '700 !important' } }}
                    onChange={e =>
                      setEditDraft(d => ({ ...d, description: e.target.value }))
                    }
                  />
                </>
              )
            ) : (
              <Stack spacing={2}>
                <Paper variant="outlined" sx={{ p: 2, pt: 3, bgcolor: 'grey.50', position: 'relative', overflow: 'visible' }}>
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
                      fontWeight: '700 !important',
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
                <Paper variant="outlined" sx={{ p: 2, pt: 3, bgcolor: 'grey.50', position: 'relative', overflow: 'visible' }}>
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
                      fontWeight: '700 !important',
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
                <Paper variant="outlined" sx={{ p: 2, pt: 3, bgcolor: 'grey.50', position: 'relative', overflow: 'visible' }}>
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
                      fontWeight: '700 !important',
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
                <Paper variant="outlined" sx={{ p: 2, pt: 3, bgcolor: 'grey.50', position: 'relative', overflow: 'visible' }}>
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
                      fontWeight: '700 !important',
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
          {selectedRoom.images?.length ? (
            <Grid container spacing={2}>
              {selectedRoom.images.map((img, i) => (
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
    }}
  >
    <Button
      color="error"
      variant="contained"
      onClick={() => {
        if (selectedRoom)
          handleDeleteRoom(selectedRoom.id || selectedRoom._id);
        setModalOpen(false);
        setEditMode(false);
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
