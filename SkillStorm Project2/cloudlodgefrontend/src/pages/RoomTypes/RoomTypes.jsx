import React, { useEffect, useState } from "react";
import Pagination from '@mui/material/Pagination';
import { Box, Card, CardContent, CardActions, Typography, Button, Grid, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Stack, Tooltip, IconButton, Paper, TextField} from '@mui/material';
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import Header from "../../components/Header";
import CloseIcon from '@mui/icons-material/Close';
import BedIcon from "@mui/icons-material/Bed";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal';
import DetailsModal from "../../components/DetailsModal";
import {
  useCreateRoomTypeMutation,
  useDeleteRoomTypeMutation,
  useGetRoomTypesQuery,
  useUpdateRoomTypeMutation,
} from "../../store/apiSlice";

const INITIAL_FORM = {
  roomCategory: "",
  pricePerNight: "",
  maxGuests: "",
  amenities: [""],
  description: "",
  images: [],
};

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

  const { data, isLoading, error: roomTypesError, refetch } = useGetRoomTypesQuery();
  const [createRoomType] = useCreateRoomTypeMutation();
  const [updateRoomType] = useUpdateRoomTypeMutation();
  const [deleteRoomType] = useDeleteRoomTypeMutation();

  function resetAddForm() {
    setForm(INITIAL_FORM);
  }

  useEffect(() => {
    if (Array.isArray(data)) {
      setRoomTypes(data);
    } else if (data) {
      setRoomTypes([]);
    }
  }, [data]);

  useEffect(() => {
    if (roomTypesError) {
      setError(roomTypesError?.message || "Failed to load room types.");
    } else {
      setError("");
    }
  }, [roomTypesError]);

  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading]);

  async function handleAddRoomType(e) {
    e.preventDefault();
    setError("");
    const amenitiesArr = Array.isArray(form.amenities)
      ? form.amenities.map((a) => a.trim()).filter(a => a)
      : [];
    
    const formData = new FormData();
    formData.append(
      "roomType",
      JSON.stringify({
        roomCategory: form.roomCategory,
        pricePerNight: parseFloat(form.pricePerNight),
        maxGuests: parseInt(form.maxGuests),
        amenities: amenitiesArr,
        description: form.description,
        images: []
      })
    );
    
    selectedImages.forEach((image) => {
      formData.append("images", image);
    });
    
    try {
      await createRoomType(formData).unwrap();
      setAddModalOpen(false);
      resetAddForm();
      setSelectedImages([]);
      refetch();
    } catch (err) {
      setError(err?.message || "Failed to add room type.");
    }
  }

  async function handleDeleteRoomType(id) {
    try {
      await deleteRoomType(id).unwrap();
      setModalOpen(false);
      if (selectedRoomType && (selectedRoomType.id === id || selectedRoomType._id === id)) {
        setEditMode(false);
        setSelectedRoomType(null);
      }
      refetch();
    } catch (err) {
      setError(err?.message || "Failed to delete room type.");
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
      
      const roomTypePayload = {
        id: selectedRoomType.id || selectedRoomType._id,
        roomCategory: editDraft.roomCategory,
        pricePerNight: parseFloat(editDraft.pricePerNight),
        maxGuests: parseInt(editDraft.maxGuests),
        amenities: amenitiesArr,
        description: editDraft.description,
        images: editDraft.images,
      };

      formData.append("roomType", JSON.stringify(roomTypePayload));
      
      if (imagesToDelete.length > 0) {
        formData.append("deleteImages", JSON.stringify(imagesToDelete));
      }
      
      editImages.forEach((image) => {
        formData.append("images", image);
      });

      try {
        const updatedRoomType = await updateRoomType({
          id: selectedRoomType.id || selectedRoomType._id,
          body: formData,
        }).unwrap();
        const updatedId = updatedRoomType?.id || updatedRoomType?._id;
        setRoomTypes(prev =>
          prev.map(rt =>
            (rt.id || rt._id) === updatedId ? { ...rt, ...updatedRoomType } : rt
          )
        );
        setSelectedRoomType(updatedRoomType || null);
        setEditMode(false);
        setEditForm({
          roomCategory: updatedRoomType?.roomCategory ?? editDraft.roomCategory,
          pricePerNight: updatedRoomType?.pricePerNight ?? editDraft.pricePerNight,
          maxGuests: updatedRoomType?.maxGuests ?? editDraft.maxGuests,
          amenities: updatedRoomType?.amenities ?? editDraft.amenities,
          description: updatedRoomType?.description ?? editDraft.description,
          images: updatedRoomType?.images ?? editDraft.images,
        });
        setEditDraft(prev => ({
          ...prev,
          roomCategory: updatedRoomType?.roomCategory ?? prev?.roomCategory,
          pricePerNight: updatedRoomType?.pricePerNight ?? prev?.pricePerNight,
          maxGuests: updatedRoomType?.maxGuests ?? prev?.maxGuests,
          amenities: updatedRoomType?.amenities ?? prev?.amenities,
          description: updatedRoomType?.description ?? prev?.description,
          images: updatedRoomType?.images ?? prev?.images,
        }));
        setEditImages([]);
        setImagesToDelete([]);
      } catch (err) {
        setError(err?.message || "Failed to update room type.");
      }
    }, 0);
  }

  function handleCancelEdit() {
    setEditMode(false);
    setEditDraft(editForm);
    setImagesToDelete([]);
    setEditImages([]);
  }

  function handleCloseModal() {
    setModalOpen(false);
    setEditMode(false);
  }

  function handleDeleteClick() {
    if (selectedRoomType) {
      setRoomTypeToDelete(selectedRoomType.id || selectedRoomType._id);
      setDeleteModalOpen(true);
    }
  }

  return (
    <Box
      sx={{
        background:
          "radial-gradient(circle at 0% 0%, rgba(125,211,252,0.16), transparent 45%), radial-gradient(circle at 90% 10%, rgba(96,165,250,0.16), transparent 45%), #0f1113",
      }}
    >
      <Header 
        setRooms={() => {}} 
        setLoading={setLoading}
        setError={setError}
        showSearch={false}
      />
      <Box sx={{ width: "100%" }}>
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
            <Box
              sx={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 3,
              }}
            >
              <Paper
                sx={{
                  width: "100%",
                  maxWidth: 1640,
                  p: { xs: 2.5, md: 3 },
                  bgcolor: "rgba(21, 26, 31, 0.92)",
                  border: "1px solid rgba(125, 211, 252, 0.18)",
                  boxShadow: "0 22px 50px rgba(6, 15, 24, 0.45)",
                  position: "relative",
                  overflow: "hidden"
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage:
                      "linear-gradient(135deg, rgba(125,211,252,0.16), rgba(15,17,19,0.92)), url(https://picsum.photos/1200/320?blur=2)",
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
                    <Typography variant="h4" fontWeight={700}>
                      Room Types
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      Curate categories, pricing, and amenities for guest booking.
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setAddModalOpen(true)}
                  >
                    Add Room Type
                  </Button>
                </Stack>
              </Paper>
            </Box>
            {loading ? (
              <Typography>Loading…</Typography>
            ) : (
              <Box sx={{ width: "100%", maxWidth: 1640, mx: "auto" }}>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "repeat(2, minmax(0, 1fr))",
                      md: "repeat(3, minmax(0, 1fr))",
                      lg: "repeat(4, minmax(0, 1fr))"
                    },
                    gap: 2
                  }}
                >
                  {(() => {
                    const filtered = roomTypes.filter(rt => rt && (rt.id || rt._id) && rt.roomCategory);
                    return filtered
                      .slice((page - 1) * itemsPerPage, page * itemsPerPage)
                      .map((roomType) => {
                        let category = roomType.roomCategory;
                        if (category && typeof category === 'object' && category.name) category = category.name;
                        if (!category || typeof category !== 'string') category = 'N/A';
                        const price = typeof roomType.pricePerNight === 'number' && !isNaN(roomType.pricePerNight)
                          ? `$${roomType.pricePerNight}`
                          : 'N/A';
                        const maxGuests = typeof roomType.maxGuests === 'number' && !isNaN(roomType.maxGuests)
                          ? roomType.maxGuests
                          : 'N/A';
                        const amenitiesCount = Array.isArray(roomType.amenities)
                          ? roomType.amenities.length
                          : typeof roomType.amenities === "string"
                          ? roomType.amenities.split(",").map(a => a.trim()).filter(Boolean).length
                          : 0;
                        const maxGuestsLabel = maxGuests === "N/A"
                          ? "Max Guests: N/A"
                          : `Max Guests: ${maxGuests}`;
                        return (
                          <Box key={roomType.id || roomType._id}>
                            <Card
                              sx={{
                                borderRadius: 3,
                                overflow: "hidden",
                                cursor: "pointer",
                                transition: "0.2s",
                                bgcolor: "rgba(21, 26, 31, 0.92)",
                                "&:hover": { transform: "translateY(-4px)" },
                              }}
                              onClick={() => handleOpenModal(roomType)}
                            >
                              <Box
                                sx={{
                                  width: "100%",
                                  height: 210,
                                  bgcolor: "rgba(24, 26, 27, 0.9)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  overflow: "hidden",
                                  position: "relative"
                                }}
                              >
                                {roomType.images && roomType.images.length > 0 ? (
                                  <img
                                    src={roomType.images[0]}
                                    alt={category}
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "cover",
                                    }}
                                  />
                                ) : (
                                  <BedIcon sx={{ fontSize: 60, color: "#555" }} />
                                )}
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
                                  {price}
                                </Box>
                              </Box>
                              <CardContent>
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <BedIcon fontSize="small" />
                                  <Typography fontWeight={700}>
                                    {category}
                                  </Typography>
                                </Stack>
                                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                                  <Chip
                                    label={`${amenitiesCount} amenities`}
                                    size="small"
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
                                  <Chip
                                    label={maxGuestsLabel}
                                    size="small"
                                    color="success"
                                    variant="outlined"
                                  />
                                </Stack>
                                <Stack
                                  direction="row"
                                  justifyContent="space-between"
                                  alignItems="center"
                                >
                                  <Typography variant="body2" color="text.secondary">
                                    {roomType.description ? "View details to edit amenities and pricing." : "Add a description to help guests decide."}
                                  </Typography>
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
                          </Box>
                        );
                      });
                  })()}
                </Box>
                {roomTypes.length > itemsPerPage && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Pagination
                      count={Math.ceil(roomTypes.length / itemsPerPage)}
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
                      color="standard"
                    />
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </Box>
      </Box>
      
      {deleteModalOpen && (
        <DeleteConfirmationModal
          open={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={() => handleDeleteRoomType(roomTypeToDelete)}
          text="Are you sure you want to delete this room type? This action cannot be undone."
        />
      )}

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
      <DetailsModal
        open={modalOpen}
        onClose={handleCloseModal}
        data={selectedRoomType}
        editMode={editMode}
        onEditToggle={() => setEditMode(v => !v)}
        onSave={handleSaveEdit}
        onDelete={handleDeleteClick}
        editDraft={editDraft}
        setEditDraft={setEditDraft}
        editImages={editImages}
        setEditImages={setEditImages}
        imagesToDelete={imagesToDelete}
        setImagesToDelete={setImagesToDelete}
        type="roomType"
      />

    </Box>
  );
}
