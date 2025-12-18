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


const INITIAL_FORM = {
  roomCategory: "",
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
  const [imagesToDelete, setImagesToDelete] = useState([]);

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
      roomCategory: roomType.roomCategory ?? "",
      pricePerNight: roomType.pricePerNight ?? "",
      maxGuests: roomType.maxGuests ?? "",
      amenities: amenitiesArr.length ? amenitiesArr : [""],
      description: roomType.description ?? "",
      images: roomType.images ?? [],
    };
    setEditForm(initial);
    setEditDraft(initial);
    setEditImages([]);
    setImagesToDelete([]);
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
      
      // Create roomType JSON payload
      const roomTypePayload = {
        id: selectedRoomType.id || selectedRoomType._id,
        roomCategory: editDraft.roomCategory,
        pricePerNight: parseFloat(editDraft.pricePerNight),
        maxGuests: parseInt(editDraft.maxGuests),
        amenities: amenitiesArr,
        description: editDraft.description,
        images: editDraft.images, // Include current images
      };

      // Send roomType as JSON string
      formData.append("roomType", JSON.stringify(roomTypePayload));
      
      // Send deleteImages as JSON array string
      if (imagesToDelete.length > 0) {
        formData.append("deleteImages", JSON.stringify(imagesToDelete));
      }
      
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
        
        if (!res.ok) {
          throw new Error("Failed to update room type");
        }
        
        fetchRoomTypes((updatedRoomTypes) => {
          setRoomTypes(updatedRoomTypes);
          const id = selectedRoomType.id || selectedRoomType._id;
          const updatedRoomType = updatedRoomTypes.find(r => r.id === id || r._id === id);
          setSelectedRoomType(updatedRoomType || null);
          setEditMode(false);
          setEditImages([]);
          setImagesToDelete([]);
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
                    const filtered = roomTypes
                      .filter(rt =>
                        rt &&
                        (rt.id || rt._id) &&
                        rt.roomCategory
                      );
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
      <Dialog open={addModalOpen} onClose={() => { setAddModalOpen(false); resetAddForm(); }} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 1, bgcolor: 'background.default', color: 'text.primary' }}>
          Add Room Type
          <IconButton size="small" color="error" onClick={() => { setAddModalOpen(false); resetAddForm(); }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ bgcolor: 'background.default', color: 'text.primary' }}>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              label="Room Category Name"
              fullWidth
              required
              value={form.roomCategory}
              onChange={e => setForm({ ...form, roomCategory: e.target.value })}
              placeholder="e.g., Ocean View Suite, Presidential Suite, etc."
              helperText="Enter a unique name for this room type"
            />
            <TextField
              label="Price Per Night"
              fullWidth
              required
              type="number"
              value={form.pricePerNight}
              onChange={e => setForm({ ...form, pricePerNight: e.target.value })}
            />
            <TextField
              label="Max Guests"
              fullWidth
              required
              type="number"
              value={form.maxGuests}
              onChange={e => setForm({ ...form, maxGuests: e.target.value })}
            />
            
            {/* Amenities Section */}
            <Box>
              <label style={{ fontSize: 12, marginBottom: 8, color: '#888', display: 'block' }}>Amenities</label>
              <Grid container spacing={2}>
                {form.amenities.map((amenity, idx) => (
                  <Grid item xs={12} sm={6} md={4} key={idx}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TextField
                        label={`Amenity ${idx + 1}`}
                        fullWidth
                        size="small"
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
                    </Box>
                  </Grid>
                ))}
              </Grid>
              <Button
                variant="outlined"
                size="small"
                startIcon={<AddIcon />}
                fullWidth
                sx={{ mt: 2 }}
                onClick={() => setForm({ ...form, amenities: [...form.amenities, ""] })}
              >
                Add Amenity
              </Button>
            </Box>
            
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
            />
            
            {/* Image Upload Section at Bottom */}
            <Box>
              <label style={{ fontSize: 12, marginBottom: 4, color: '#888', display: 'block' }}>Room Images</label>
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
                    <Box key={idx} sx={{ position: 'relative', width: 100, height: 100 }}>
                      <img
                        src={URL.createObjectURL(img)}
                        alt={`Preview ${idx}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }}
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
          </Stack>
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
            <Stack spacing={3}>
              {/* FORM FIELDS */}
              {editMode ? (
                editDraft && (
                  <>
                    <TextField
                      label="Room Category Name"
                      fullWidth
                      required
                      value={editDraft.roomCategory}
                      onChange={e => setEditDraft(d => ({ ...d, roomCategory: e.target.value }))}
                      placeholder="e.g., Ocean View Suite, Presidential Suite, etc."
                    />
                    <TextField
                      label="Price Per Night"
                      fullWidth
                      required
                      type="number"
                      value={editDraft.pricePerNight}
                      onChange={e => setEditDraft(d => ({ ...d, pricePerNight: e.target.value }))}
                    />
                    <TextField
                      label="Max Guests"
                      fullWidth
                      required
                      type="number"
                      value={editDraft.maxGuests}
                      onChange={e => setEditDraft(d => ({ ...d, maxGuests: e.target.value }))}
                    />
                    
                    {/* Amenities Section */}
                    <Box>
                      <label style={{ fontSize: 12, marginBottom: 8, color: '#888', display: 'block' }}>Amenities</label>
                      <Grid container spacing={2}>
                        {editDraft.amenities.map((amenity, idx) => (
                          <Grid item xs={12} sm={6} md={4} key={idx}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <TextField
                                label={`Amenity ${idx + 1}`}
                                fullWidth
                                size="small"
                                value={amenity}
                                onChange={e => {
                                  const newAmenities = [...editDraft.amenities];
                                  newAmenities[idx] = e.target.value;
                                  setEditDraft(d => ({ ...d, amenities: newAmenities }));
                                }}
                              />
                              <IconButton
                                aria-label="Remove amenity"
                                color="error"
                                size="small"
                                disabled={editDraft.amenities.length === 1}
                                onClick={() => {
                                  if (editDraft.amenities.length > 1) {
                                    setEditDraft(d => ({ ...d, amenities: editDraft.amenities.filter((_, i) => i !== idx) }));
                                  }
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<AddIcon />}
                        fullWidth
                        sx={{ mt: 2 }}
                        onClick={() => setEditDraft(d => ({ ...d, amenities: [...editDraft.amenities, ""] }))}
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
                      onChange={e => setEditDraft(d => ({ ...d, description: e.target.value }))}
                    />
                  </>
                )
              ) : (
                <>
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
                </>
              )}
              
              {/* IMAGES SECTION AT BOTTOM */}
              <Box sx={{ mt: 3 }}>
                {editDraft && editDraft.images && editDraft.images.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                    {editDraft.images.map((img, idx) => (
                      <Box
                        key={idx}
                        sx={{ position: "relative", width: 200, height: 150 }}
                      >
                        <img
                          src={img}
                          alt={`Room ${idx + 1}`}
                          style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 8 }}
                        />

                        {editMode && (
                          <IconButton
                            size="small"
                            sx={{
                              position: "absolute",
                              top: 6,
                              right: 6,
                              bgcolor: "error.main",
                              '&:hover': { bgcolor: 'error.dark' },
                            }}
                            onClick={() => {
                              setImagesToDelete(prev => [...prev, img]);
                              setEditDraft(d => ({
                                ...d,
                                images: d.images.filter(i => i !== img),
                              }));
                            }}
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                    ))}
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
                      Upload Images
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
                          <Box key={idx} sx={{ position: 'relative', width: 100, height: 100 }}>
                            <img
                              src={URL.createObjectURL(img)}
                              alt={`Preview ${idx}`}
                              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }}
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
            </Stack>
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
                setImagesToDelete([]);
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