import React, { useEffect, useState } from 'react';
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
  IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import BedIcon from '@mui/icons-material/Bed';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const API_URL = 'http://localhost:8080/rooms';

export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    number: '',
    roomTypeId: '',
    price: '',
    maxGuests: '',
    amenities: '',
    description: ''
  });
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    price: '',
    maxGuests: '',
    amenities: '',
    description: ''
  });

  // Fetch room types from backend
  useEffect(() => {
    fetchRoomTypes();
  }, []);

  async function fetchRoomTypes() {
    try {
      const res = await fetch('http://localhost:8080/roomtypes');
      if (!res.ok) throw new Error('Failed to fetch room types');
      const data = await res.json();
      setRoomTypes(data);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    fetchRooms();
  }, []);

  async function fetchRooms() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('Failed to fetch rooms');
      const data = await res.json();
      setRooms(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddRoom(e) {
    e.preventDefault();
    setError('');
    try {
      // Build payload matching backend Room model
      const rt = roomTypes.find(rt => rt.id === form.roomTypeId);
      const payload = {
        roomNumber: form.number ? parseInt(form.number) : undefined,
        roomTypeId: form.roomTypeId,
        isActive: true,
      };
      // Only add override fields if changed from RoomType default
      if (form.price && parseFloat(form.price) !== (rt?.pricePerNight ?? 0)) {
        payload.priceOverride = parseFloat(form.price);
      }
      if (form.maxGuests && parseInt(form.maxGuests) !== (rt?.maxGuests ?? 0)) {
        payload.maxGuestsOverride = parseInt(form.maxGuests);
      }
      const amenitiesArr = typeof form.amenities === 'string' ? form.amenities.split(',').map(a => a.trim()) : [];
      if (rt && amenitiesArr.join(',') !== (rt.amenities?.join(',') ?? '')) {
        payload.amenitiesOverride = amenitiesArr;
      }
      if (form.description && form.description !== (rt?.description ?? '')) {
        payload.descriptionOverride = form.description;
      }
      const res = await fetch(API_URL+"/create", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to add room');
      setForm({ number: '', roomTypeId: '', price: '', maxGuests: '', amenities: '', description: '' });
      setAddModalOpen(false);
      fetchRooms();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteRoom(id) {
    setError('');
    try {
      const res = await fetch(`${API_URL}/delete/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete room');
      fetchRooms();
    } catch (err) {
      setError(err.message);
    }
  }


  function handleOpenModal(room) {
    setSelectedRoom(room);
    setEditMode(false);
    setEditForm({
      price: room.price ?? '',
      maxGuests: room.maxGuests ?? '',
      amenities: room.amenities && room.amenities.length > 0 ? room.amenities.join(', ') : '',
      description: room.description ?? ''
    });
    setModalOpen(true);
  }

  function handleEditChange(field, value) {
    setEditForm(f => ({ ...f, [field]: value }));
  }

  async function handleSaveEdit() {
    if (!selectedRoom) return;
    // Build a full Room object for PUT
    const amenitiesArr = typeof editForm.amenities === 'string' ? editForm.amenities.split(',').map(a => a.trim()) : [];
    const payload = {
      // Always send these required fields
      id: selectedRoom.id || selectedRoom._id,
      roomNumber: selectedRoom.roomNumber,
      roomTypeId: selectedRoom.roomTypeId,
      isActive: selectedRoom.isActive !== undefined ? selectedRoom.isActive : true,
      // Send overrides if changed, else use current values
      priceOverride: editForm.price && parseFloat(editForm.price) !== (selectedRoom.price ?? 0) ? parseFloat(editForm.price) : selectedRoom.priceOverride,
      maxGuestsOverride: editForm.maxGuests && parseInt(editForm.maxGuests) !== (selectedRoom.maxGuests ?? 0) ? parseInt(editForm.maxGuests) : selectedRoom.maxGuestsOverride,
      amenitiesOverride: (selectedRoom.amenities && amenitiesArr.join(',') !== (selectedRoom.amenities.join(',') ?? '')) ? amenitiesArr : selectedRoom.amenitiesOverride,
      descriptionOverride: editForm.description && editForm.description !== (selectedRoom.description ?? '') ? editForm.description : selectedRoom.descriptionOverride,
    };
    // Remove undefined override fields
    Object.keys(payload).forEach(key => {
      if (payload[key] === undefined) delete payload[key];
    });
    try {
      const res = await fetch(`${API_URL}/update/${selectedRoom.id || selectedRoom._id}` , {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to update room');

      // Re-fetch the full room list to get the resolved/merged data
      const updatedRoomsRes = await fetch(API_URL);
      if (!updatedRoomsRes.ok) throw new Error('Failed to fetch updated rooms');
      const updatedRooms = await updatedRoomsRes.json();
      setRooms(updatedRooms);
      // Find the updated room in the new list and set it for the modal
      const id = selectedRoom.id || selectedRoom._id;
      const resolvedRoom = updatedRooms.find(r => r.id === id || r._id === id);
      setSelectedRoom(resolvedRoom || null);
      setEditMode(false);
    } catch (err) {
      setError(err.message);
    }
  }

  function handleCloseModal() {
    setModalOpen(false);
    setSelectedRoom(null);
  }

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto', mt: 5, p: 3 }}>
      <Typography variant="h3" fontWeight={700} mb={4} color="primary.main" sx={{ letterSpacing: 1 }}>Rooms</Typography>
      {error && (
        <Box mb={2}>
          <Chip label={error} color="error" />
        </Box>
      )}
      <Button
        variant="contained"
        color="primary"
        startIcon={<AddIcon />}
        sx={{ mb: 3, fontWeight: 600, borderRadius: 2, px: 3, py: 1 }}
        onClick={() => setAddModalOpen(true)}
      >
        Add Room
      </Button>

      {/* Add Room Modal */}
      <Dialog open={addModalOpen} onClose={() => setAddModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Room</DialogTitle>
        <DialogContent dividers>
          <Box component="form" onSubmit={handleAddRoom} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Room Number"
              value={form.number}
              onChange={e => setForm(f => ({ ...f, number: e.target.value }))}
              required
              size="small"
            />
            <FormControl size="small" required>
              <InputLabel id="room-type-label">Room Type</InputLabel>
              <Select
                labelId="room-type-label"
                value={form.roomTypeId}
                label="Room Type"
                onChange={e => {
                  const roomTypeId = e.target.value;
                  const rt = roomTypes.find(rt => rt.id === roomTypeId);
                  setForm(f => ({
                    ...f,
                    roomTypeId,
                    price: rt?.pricePerNight ?? '',
                    maxGuests: rt?.maxGuests ?? '',
                    amenities: rt?.amenities ? rt.amenities.join(', ') : '',
                    description: rt?.description ?? ''
                  }));
                }}
              >
                {roomTypes.map(rt => (
                  <MenuItem key={rt.id} value={rt.id}>{rt.roomCategory}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Price"
              type="number"
              value={form.price}
              onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
              required
              size="small"
            />
            <TextField
              label="Max Guests"
              type="number"
              value={form.maxGuests}
              onChange={e => setForm(f => ({ ...f, maxGuests: e.target.value }))}
              required
              size="small"
            />
            <TextField
              label="Amenities (comma separated)"
              value={form.amenities}
              onChange={e => setForm(f => ({ ...f, amenities: e.target.value }))}
              size="small"
            />
            <TextField
              label="Description"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              size="small"
              multiline
              minRows={2}
            />
            <DialogActions sx={{ px: 0 }}>
              <Button onClick={() => setAddModalOpen(false)} color="secondary">Cancel</Button>
              <Button type="submit" variant="contained" color="primary">Add Room</Button>
            </DialogActions>
          </Box>
        </DialogContent>
      </Dialog>
      {loading ? (
        <Typography>Loading...</Typography>
      ) : (
        rooms.length === 0 ? (
          <Typography>No rooms found.</Typography>
        ) : (
          <Grid container spacing={3}>
            {rooms.map(room => (
              <Grid item xs={12} sm={6} md={4} key={room.id || room._id}>
                <Card
                  elevation={6}
                  sx={{
                    cursor: 'pointer',
                    borderRadius: 3,
                    transition: 'box-shadow 0.2s, transform 0.2s',
                    '&:hover': { boxShadow: 12, transform: 'translateY(-4px) scale(1.02)' },
                    background: 'linear-gradient(135deg, #f7fafc 80%, #e3e8ee 100%)',
                  }}
                  onClick={() => handleOpenModal(room)}
                >
                  <CardContent sx={{ pb: 1 }}>
                    <Stack direction="row" alignItems="center" mb={1}>
                      <Stack direction="row" alignItems="center" spacing={3}>
                        <Typography variant="h6" fontWeight={700} color="primary.main">
                          <BedIcon sx={{ mr: 1, fontSize: 22, verticalAlign: 'middle' }} />
                          Room #{room.roomNumber}
                        </Typography>
                        <Chip label={room.roomCategory || 'N/A'} color="info" size="small" sx={{ fontWeight: 600 }} />
                      </Stack>
                    </Stack>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                      <Chip
                        icon={room.booked ? <CancelIcon /> : <CheckCircleIcon />}
                        label={room.booked ? 'Booked' : 'Available'}
                        color={room.booked ? 'error' : 'success'}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                      <Typography variant="subtitle1" fontWeight={600} color="secondary.dark">
                        ${room.price}
                      </Typography>
                    </Stack>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'flex-end', pb: 2 }}>
                    <Tooltip title="Delete Room">
                      <IconButton size="small" color="error" onClick={e => { e.stopPropagation(); handleDeleteRoom(room.id || room._id); }}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="View Details">
                      <IconButton size="small" color="primary" onClick={e => { e.stopPropagation(); handleOpenModal(room); }}>
                        <InfoOutlinedIcon />
                      </IconButton>
                    </Tooltip>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )
      )}

      {/* Room Details Modal */}
      <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, letterSpacing: 1 }}>Room Details</DialogTitle>
        <DialogContent dividers>
          {selectedRoom && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Stack spacing={1}>
                  <Typography variant="h6" fontWeight={700} color="primary.main" mb={1}>
                    <BedIcon sx={{ mr: 1, fontSize: 22, verticalAlign: 'middle' }} />
                    Room #{selectedRoom.roomNumber}
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip label={selectedRoom.roomCategory || 'N/A'} color="info" size="small" />
                    <Chip
                      icon={selectedRoom.booked ? <CancelIcon /> : <CheckCircleIcon />}
                      label={selectedRoom.booked ? 'Booked' : 'Available'}
                      color={selectedRoom.booked ? 'error' : 'success'}
                      size="small"
                    />
                  </Stack>
                  {editMode ? (
                    <>
                      <TextField
                        label="Price"
                        type="number"
                        value={editForm.price}
                        onChange={e => handleEditChange('price', e.target.value)}
                        size="small"
                        fullWidth
                        sx={{ mb: 1 }}
                      />
                      <TextField
                        label="Max Guests"
                        type="number"
                        value={editForm.maxGuests}
                        onChange={e => handleEditChange('maxGuests', e.target.value)}
                        size="small"
                        fullWidth
                        sx={{ mb: 1 }}
                      />
                      <TextField
                        label="Amenities (comma separated)"
                        value={editForm.amenities}
                        onChange={e => handleEditChange('amenities', e.target.value)}
                        size="small"
                        fullWidth
                        sx={{ mb: 1 }}
                      />
                      <TextField
                        label="Description"
                        value={editForm.description}
                        onChange={e => handleEditChange('description', e.target.value)}
                        size="small"
                        fullWidth
                        multiline
                        minRows={2}
                        sx={{ mb: 1 }}
                      />
                    </>
                  ) : (
                    <>
                      <Typography variant="subtitle1" fontWeight={600} color="secondary.dark" mb={1}>
                        ${selectedRoom.price}
                      </Typography>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="body2" mb={1}><strong>Max Guests:</strong> {selectedRoom.maxGuests}</Typography>
                      <Typography variant="body2" mb={1}><strong>Amenities:</strong> {selectedRoom.amenities && selectedRoom.amenities.length > 0 ? selectedRoom.amenities.join(', ') : 'None'}</Typography>
                      <Typography variant="body2" mb={1}><strong>Description:</strong> {selectedRoom.description || 'No description'}</Typography>
                    </>
                  )}
                </Stack>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box mb={1}>
                  <Typography variant="body2" fontWeight={600} mb={1}>Images:</Typography>
                  {selectedRoom.images && selectedRoom.images.length > 0 ? (
                    <ImageList cols={2} gap={8} sx={{ width: '100%', maxHeight: 220 }}>
                      {selectedRoom.images.map((img, idx) => (
                        <ImageListItem key={idx} sx={{ width: 160, height: 120 }}>
                          <img
                            src={img}
                            alt={`Room ${selectedRoom.roomNumber} img ${idx+1}`}
                            style={{
                              borderRadius: '8px',
                              width: '160px',
                              height: '120px',
                              objectFit: 'cover',
                              display: 'block'
                            }}
                          />
                        </ImageListItem>
                      ))}
                    </ImageList>
                  ) : (
                    <Typography variant="caption">No images</Typography>
                  )}
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          {editMode ? (
            <>
              <Button onClick={() => setEditMode(false)} color="secondary" variant="outlined">Cancel</Button>
              <Button color="primary" variant="contained" onClick={handleSaveEdit}>Save</Button>
            </>
          ) : (
            <>
              <Button onClick={handleCloseModal} color="primary" variant="outlined">Close</Button>
              <Button onClick={() => setEditMode(true)} color="primary" variant="contained">Edit</Button>
              {selectedRoom && (
                <Button color="error" variant="contained" startIcon={<DeleteIcon />} onClick={() => { handleDeleteRoom(selectedRoom.id || selectedRoom._id); handleCloseModal(); }}>Delete</Button>
              )}
            </>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
