import React, { useEffect, useState } from "react";
import Pagination from '@mui/material/Pagination';
import { Box, Card, CardContent, CardActions, Typography, Button, Grid, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Stack, Tooltip, IconButton, Paper, FormControl, TextField } from '@mui/material';
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import Header from "../../assets/components/Header";
import SideNav from "../../assets/components/SideNav";
import CloseIcon from '@mui/icons-material/Close';
import BedIcon from "@mui/icons-material/Bed";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import PhotoCamera from "@mui/icons-material/PhotoCamera";


const ROOM_CATEGORIES = ["STANDARD", "DELUXE", "SUITE", "PENTHOUSE"];
const INITIAL_FORM = {
  roomCategory: "STANDARD",
  pricePerNight: "",
  maxGuests: "",
  amenities: [""],
  description: "",
  images: [],
};


const API_URL = "http://localhost:8080/roomtypes";

export default function RoomTypes() {
  const [roomTypes, setRoomTypes] = useState([]);
  const [page, setPage] = useState(1);
  const itemsPerPage = 6;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRoomType, setSelectedRoomType] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [editForm, setEditForm] = useState(INITIAL_FORM);
  const [editDraft, setEditDraft] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [roomTypeToDelete, setRoomTypeToDelete] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [editImages, setEditImages] = useState([]);

  function resetAddForm() {
    setForm(INITIAL_FORM);
  }

  useEffect(() => {
    fetchRoomTypes();
  }, []);

  async function fetchRoomTypes(callback) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Failed to fetch room types");
      const data = await res.json();
      console.log('Fetched roomTypes:', data);
      setRoomTypes(data);
      if (callback) callback(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddRoomType(e) {
    e.preventDefault();
    setError("");
    const amenitiesArr = Array.isArray(form.amenities)
      ? form.amenities.map((a) => a.trim()).filter(a => a)
      : [];
    
    const formData = new FormData();
    formData.append("roomCategory", form.roomCategory);
    formData.append("pricePerNight", parseFloat(form.pricePerNight));
    formData.append("maxGuests", parseInt(form.maxGuests));
    formData.append("amenities", JSON.stringify(amenitiesArr));
    formData.append("description", form.description);
    
    // Append images
    selectedImages.forEach((image) => {
      formData.append("images", image);
    });
    
    try {
      const res = await fetch(`${API_URL}/create`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to add room type");
      setAddModalOpen(false);
      resetAddForm();
      setSelectedImages([]);
      fetchRoomTypes();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteRoomType(id) {
    try {
      const res = await fetch(`${API_URL}/delete/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete room type");
      setModalOpen(false);
      if (selectedRoomType && (selectedRoomType.id === id || selectedRoomType._id === id)) {
        setEditMode(false);
        setSelectedRoomType(null);
      }
      fetchRoomTypes();
    } catch (err) {
      setError(err.message);
    }
    setDeleteModalOpen(false);
    setRoomTypeToDelete(null);
  }

  function handleOpenModal(roomType) {
    setSelectedRoomType(roomType);
    setEditMode(false);
    let amenitiesArr = [];
    if (Array.isArray(roomType.amenities)) {
      amenitiesArr = roomType.amenities;
    } else if (typeof roomType.amenities === 'string') {
      amenitiesArr = roomType.amenities.split(',').map(a => a.trim()).filter(a => a);
    } else {
      amenitiesArr = [""];
    }
    const initial = {
      roomCategory: roomType.roomCategory ?? "STANDARD",
      pricePerNight: roomType.pricePerNight ?? "",
      maxGuests: roomType.maxGuests ?? "",
      amenities: amenitiesArr.length ? amenitiesArr : [""],
      description: roomType.description ?? "",
      images: roomType.images ?? [],
    };
    setEditForm(initial);
    setEditDraft(initial);
    setEditImages([]);
    setModalOpen(true);
  }

  async function handleSaveEdit() {
    if (!selectedRoomType) return;
    setEditForm(editDraft);
    setTimeout(async () => {
      const amenitiesArr = Array.isArray(editDraft.amenities)
        ? editDraft.amenities.map(a => a.trim()).filter(a => a)
        : [];
      
      const formData = new FormData();
      formData.append("id", selectedRoomType.id || selectedRoomType._id);
      formData.append("roomCategory", editDraft.roomCategory);
      formData.append("pricePerNight", parseFloat(editDraft.pricePerNight));
      formData.append("maxGuests", parseInt(editDraft.maxGuests));
      formData.append("amenities", JSON.stringify(amenitiesArr));
      formData.append("description", editDraft.description);
      
      // Append new images
      editImages.forEach((image) => {
        formData.append("images", image);
      });
      
      try {
        const res = await fetch(
          `${API_URL}/update/${selectedRoomType.id || selectedRoomType._id}`,
          {
            method: "PUT",
            body: formData,
          }
        );
        if (!res.ok) throw new Error("Failed to update room type");
        fetchRoomTypes((updatedRoomTypes) => {
          setRoomTypes(updatedRoomTypes);
          const id = selectedRoomType.id || selectedRoomType._id;
          const updatedRoomType = updatedRoomTypes.find(r => r.id === id || r._id === id);
          setSelectedRoomType(updatedRoomType || null);
          setEditMode(false);
          setEditImages([]);
        });
      } catch (err) {
        setError(err.message);
      }
    }, 0);
  }


  return (
    <Box>
      {/* <Header setLoading={setLoading} setError={setError} /> */}
      <Box sx={{ width: "100%" }}>
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
                count={Math.ceil(roomTypes.length / itemsPerPage)}
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
                  Add Room Type
                </Button>
              </Box>
            </Box>
            {loading ? (
              <Typography>Loading…</Typography>
            ) : (
              <Box sx={{ width: '100%' }}>
                <Grid container columns={12} columnSpacing={3} justifyContent="center" alignItems="flex-start">
                  {(() => {
                    console.log('Raw roomTypes state before filter:', roomTypes);
                    const filtered = roomTypes
                      .filter(rt =>
                        rt &&
                        (rt.id || rt._id) &&
                        (typeof rt.roomCategory === 'string' || (typeof rt.roomCategory === 'object' && rt.roomCategory && rt.roomCategory.name)) &&
                        ["STANDARD", "DELUXE", "SUITE", "PENTHOUSE"].includes(typeof rt.roomCategory === 'object' && rt.roomCategory ? rt.roomCategory.name : rt.roomCategory)
                      );
                    console.log('Filtered roomTypes for render:', filtered);
                    return filtered
                      .slice((page - 1) * itemsPerPage, page * itemsPerPage)
                      .map((roomType) => {
                        // Handle both enum object and string for roomCategory
                        let category = roomType.roomCategory;
                        if (category && typeof category === 'object' && category.name) category = category.name;
                        if (!category || typeof category !== 'string') category = 'N/A';
                        const price = typeof roomType.pricePerNight === 'number' && !isNaN(roomType.pricePerNight)
                          ? `$${roomType.pricePerNight}`
                          : 'N/A';
                        const maxGuests = typeof roomType.maxGuests === 'number' && !isNaN(roomType.maxGuests)
                          ? roomType.maxGuests
                          : 'N/A';
                        return (
                          <Grid key={roomType.id || roomType._id} sx={{ gridColumn: { xs: 'span 12', sm: 'span 6', md: 'span 4', lg: 'span 4' } }}>
                            <Card
                              sx={{
                                borderRadius: 3,
                                overflow: "hidden",
                                cursor: "pointer",
                                transition: "0.2s",
                                bgcolor: "#383838",
                                "&:hover": { transform: "translateY(-4px)" },
                              }}
                              onClick={() => handleOpenModal(roomType)}
                            >
                              {/* Image Display */}
                              <Box
                                sx={{
                                  width: '100%',
                                  height: 200,
                                  bgcolor: '#2a2a2a',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  overflow: 'hidden',
                                }}
                              >
                                {roomType.images && roomType.images.length > 0 ? (
                                  <img
                                    src={roomType.images[0]}
                                    alt={category}
                                    style={{
                                      width: '100%',
                                      height: '100%',
                                      objectFit: 'cover',
                                    }}
                                  />
                                ) : (
                                  <BedIcon sx={{ fontSize: 60, color: '#555' }} />
                                )}
                              </Box>
                              <CardContent>
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <Typography fontWeight={700}>
                                    {category}
                                  </Typography>
                                </Stack>
                                <Chip
                                  label={price}
                                  size="small"
                                  sx={{ my: 1 }}
                                />
                                <Stack
                                  direction="row"
                                  justifyContent="space-between"
                                  alignItems="center"
                                >
                                  <Chip
                                    icon={<CheckCircleIcon />}
                                    label={`Max Guests: ${maxGuests}`}
                                    color="success"
                                    size="small"
                                  />
                                </Stack>
                              </CardContent>
                              <CardActions sx={{ justifyContent: "flex-end" }}>
                                <Tooltip title="Delete Room Type">
                                  <IconButton
                                    color="error"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setRoomTypeToDelete(roomType.id || roomType._id);
                                      setDeleteModalOpen(true);
                                    }}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="View Details">
                                  <IconButton
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenModal(roomType);
                                    }}
                                  >
                                    <InfoOutlinedIcon />
                                  </IconButton>
                                </Tooltip>
                              </CardActions>
                            </Card>
                          </Grid>
                        );
                      });
                  })()}
                </Grid>
                {/* Pagination below grid */}
                {roomTypes.length > itemsPerPage && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Pagination
                      count={Math.ceil(roomTypes.length / itemsPerPage)}
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
                      color="standard"
                    />
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </Box>
      </Box>
      
      {/* DELETE CONFIRMATION MODAL */}
      <Dialog
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onClick={e => e.stopPropagation()}
      >
        <DialogTitle>Delete this room type?</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this room type? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteModalOpen(false)} color="inherit">Cancel</Button>
          <Button onClick={() => handleDeleteRoomType(roomTypeToDelete)} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* ADD ROOM TYPE MODAL */}
      <Dialog open={addModalOpen} onClose={() => { setAddModalOpen(false); resetAddForm(); }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 1, bgcolor: 'background.default', color: 'text.primary' }}>
          Add Room Type
          <IconButton size="small" color="error" onClick={() => { setAddModalOpen(false); resetAddForm(); }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ bgcolor: 'background.default', color: 'text.primary' }}>
          <Box component="form" onSubmit={handleAddRoomType}>
            <FormControl fullWidth margin="dense">
              <label style={{ fontSize: 12, marginBottom: 4, color: '#888' }}>Room Category</label>
              <select
                value={form.roomCategory}
                onChange={e => setForm({ ...form, roomCategory: e.target.value })}
                style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc', fontSize: 16 }}
              >
                {ROOM_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </FormControl>
            <TextField
              label="Price Per Night"
              fullWidth
              margin="dense"
              required
              value={form.pricePerNight}
              onChange={e => setForm({ ...form, pricePerNight: e.target.value })}
            />
            <TextField
              label="Max Guests"
              fullWidth
              margin="dense"
              required
              value={form.maxGuests}
              onChange={e => setForm({ ...form, maxGuests: e.target.value })}
            />
            <label style={{ fontSize: 12, marginTop: 8, color: '#888' }}>Amenities</label>
            {form.amenities.map((amenity, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                <TextField
                  label={`Amenity ${idx + 1}`}
                  fullWidth
                  margin="dense"
                  value={amenity}
                  onChange={e => {
                    const newAmenities = [...form.amenities];
                    newAmenities[idx] = e.target.value;
                    setForm({ ...form, amenities: newAmenities });
                  }}
                />
                <IconButton
                  aria-label="Remove amenity"
                  color="error"
                  size="small"
                  disabled={form.amenities.length === 1}
                  onClick={() => {
                    if (form.amenities.length > 1) {
                      setForm({ ...form, amenities: form.amenities.filter((_, i) => i !== idx) });
                    }
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </div>
            ))}
            <Button
              variant="outlined"
              size="small"
              startIcon={<AddIcon />}
              fullWidth
              sx={{ mt: 1, mb: 2 }}
              onClick={() => setForm({ ...form, amenities: [...form.amenities, ""] })}
            >
              Add Amenity
            </Button>
            <TextField
              label="Description"
              fullWidth
              margin="dense"
              multiline
              rows={2}
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
            />
            
            {/* Image Upload Section */}
            <Box sx={{ mt: 2 }}>
              <label style={{ fontSize: 12, marginBottom: 4, color: '#888' }}>Room Images</label>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                startIcon={<PhotoCamera />}
                sx={{ mt: 1 }}
              >
                Upload Images
                <input
                  type="file"
                  hidden
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    const files = Array.from(e.target.files);
                    setSelectedImages(prev => [...prev, ...files]);
                  }}
                />
              </Button>
              {selectedImages.length > 0 && (
                <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {selectedImages.map((img, idx) => (
                    <Box key={idx} sx={{ position: 'relative', width: 80, height: 80 }}>
                      <img
                        src={URL.createObjectURL(img)}
                        alt={`Preview ${idx}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }}
                      />
                      <IconButton
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: -8,
                          right: -8,
                          bgcolor: 'error.main',
                          '&:hover': { bgcolor: 'error.dark' },
                        }}
                        onClick={() => setSelectedImages(prev => prev.filter((_, i) => i !== idx))}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ bgcolor: 'background.default', color: 'text.primary' }}>
          <Button onClick={() => { setAddModalOpen(false); resetAddForm(); }}>Cancel</Button>
          <Button variant="contained" onClick={handleAddRoomType}>
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
            Room Type Details
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
          {selectedRoomType && (
            <Grid container spacing={4}>
              {/* Image Gallery */}
              <Grid item xs={12} md={6}>
                <Box sx={{ width: '100%' }}>
                  {selectedRoomType.images && selectedRoomType.images.length > 0 ? (
                    <Box>
                      <Box
                        sx={{
                          width: '100%',
                          height: 300,
                          borderRadius: 2,
                          overflow: 'hidden',
                          mb: 2,
                        }}
                      >
                        <img
                          src={selectedRoomType.images[0]}
                          alt="Room"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                      </Box>
                      {selectedRoomType.images.length > 1 && (
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          {selectedRoomType.images.slice(1).map((img, idx) => (
                            <Box
                              key={idx}
                              sx={{
                                width: 80,
                                height: 80,
                                borderRadius: 1,
                                overflow: 'hidden',
                              }}
                            >
                              <img
                                src={img}
                                alt={`Room ${idx + 2}`}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                }}
                              />
                            </Box>
                          ))}
                        </Box>
                      )}
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        width: '100%',
                        height: 300,
                        bgcolor: '#2a2a2a',
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <BedIcon sx={{ fontSize: 80, color: '#555' }} />
                    </Box>
                  )}
                  
                  {/* Image Upload in Edit Mode */}
                  {editMode && (
                    <Box sx={{ mt: 2 }}>
                      <Button
                        variant="outlined"
                        component="label"
                        fullWidth
                        startIcon={<PhotoCamera />}
                      >
                        Add More Images
                        <input
                          type="file"
                          hidden
                          multiple
                          accept="image/*"
                          onChange={(e) => {
                            const files = Array.from(e.target.files);
                            setEditImages(prev => [...prev, ...files]);
                          }}
                        />
                      </Button>
                      {editImages.length > 0 && (
                        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {editImages.map((img, idx) => (
                            <Box key={idx} sx={{ position: 'relative', width: 80, height: 80 }}>
                              <img
                                src={URL.createObjectURL(img)}
                                alt={`New ${idx}`}
                                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }}
                              />
                              <IconButton
                                size="small"
                                sx={{
                                  position: 'absolute',
                                  top: -8,
                                  right: -8,
                                  bgcolor: 'error.main',
                                  '&:hover': { bgcolor: 'error.dark' },
                                }}
                                onClick={() => setEditImages(prev => prev.filter((_, i) => i !== idx))}
                              >
                                <CloseIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          ))}
                        </Box>
                      )}
                    </Box>
                  )}
                </Box>
              </Grid>
              {/* DETAILS */}
              <Grid item xs={12} md={6}>
                <Stack spacing={2}>
                  {editMode ? (
                    editDraft && (
                      <>
                        <TextField
                          label="Room Category"
                          fullWidth
                          value={editDraft.roomCategory}
                          onChange={e => setEditDraft(d => ({ ...d, roomCategory: e.target.value }))}
                        />
                        <TextField
                          label="Price Per Night"
                          fullWidth
                          value={editDraft.pricePerNight}
                          onChange={e => setEditDraft(d => ({ ...d, pricePerNight: e.target.value }))}
                        />
                        <TextField
                          label="Max Guests"
                          fullWidth
                          value={editDraft.maxGuests}
                          onChange={e => setEditDraft(d => ({ ...d, maxGuests: e.target.value }))}
                        />
                        <TextField
                          label="Amenities"
                          fullWidth
                          margin="dense"
                          value={editDraft.amenities}
                          onChange={e => setEditDraft(d => ({ ...d, amenities: e.target.value }))}
                        />
                        <TextField
                          label="Description"
                          fullWidth
                          multiline
                          rows={3}
                          value={editDraft.description}
                          onChange={e => setEditDraft(d => ({ ...d, description: e.target.value }))}
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
                          Room Category
                        </Typography>
                        <Typography variant="h6">
                          {selectedRoomType.roomCategory}
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
                          Price
                        </Typography>
                        <Typography variant="h6">
                          ${selectedRoomType.pricePerNight}
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
                          {selectedRoomType.maxGuests}
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
                          {Array.isArray(selectedRoomType.amenities) ? selectedRoomType.amenities.join(", ") : selectedRoomType.amenities || "None"}
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
                          {selectedRoomType.description || "None"}
                        </Typography>
                      </Paper>
                    </Stack>
                  )}
                </Stack>
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
              if (selectedRoomType) {
                setRoomTypeToDelete(selectedRoomType.id || selectedRoomType._id);
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
                setEditDraft(editForm);
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