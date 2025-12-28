import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  IconButton,
  Chip,
  Stack,
  TextField,
  Grid,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import AddIcon from '@mui/icons-material/Add';

const DetailsModal = ({
  open,
  onClose,
  data,
  editMode,
  onEditToggle,
  onSave,
  onDelete,
  editDraft,
  setEditDraft,
  editImages,
  setEditImages,
  imagesToDelete,
  setImagesToDelete,
  type = 'roomType', // 'roomType' or 'room'
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!data) return null;

  const displayData = editMode ? editDraft : data;
  
  // Get images based on type
  const getImages = () => {
    if (type === 'room') {
      const existingImages = data.imagesOverride?.length > 0 ? data.imagesOverride : (data.images || []);
      // Filter out images marked for deletion
      const filteredImages = editMode && imagesToDelete 
        ? existingImages.filter(img => !imagesToDelete.includes(img))
        : existingImages;
      const newImagePreviews = editMode && editImages ? editImages.map(file => URL.createObjectURL(file)) : [];
      return [...filteredImages, ...newImagePreviews];
    } else {
      // For room types, filter deleted images from editDraft.images
      if (editMode && imagesToDelete) {
        const baseImages = editDraft?.images || [];
        const filteredImages = baseImages.filter(img => !imagesToDelete.includes(img));
        const newImagePreviews = editImages ? editImages.map(file => URL.createObjectURL(file)) : [];
        return [...filteredImages, ...newImagePreviews];
      }
      return displayData?.images || [];
    }
  };

  const displayImages = getImages();

  const handlePreviousImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1));
  };

  const handleImageDelete = (imgUrl, imgIndex) => {
    if (setImagesToDelete) {
      // Mark image for deletion
      setImagesToDelete((prev) => [...prev, imgUrl]);
      
      // For room types, also update the images in editDraft
      if (type === 'roomType') {
        setEditDraft((d) => ({
          ...d,
          images: d.images.filter((i) => i !== imgUrl),
        }));
      }
      // For rooms, we don't need to update editDraft.images since we filter in getImages
    }
    
    // Adjust carousel index BEFORE the image is removed from display
    const newLength = displayImages.length - 1;
    if (newLength === 0) {
      setCurrentImageIndex(0);
    } else if (currentImageIndex >= newLength) {
      setCurrentImageIndex(newLength - 1);
    }
  };

  const amenitiesArray = Array.isArray(displayData.amenities)
    ? displayData.amenities
    : typeof displayData.amenities === 'string'
    ? displayData.amenities.split(',').map((a) => a.trim()).filter((a) => a)
    : [];

  // Get title based on type
  const getTitle = () => {
    if (type === 'room') {
      return editMode ? `Edit Room #${data.roomNumber}` : `Room #${data.roomNumber} Details`;
    }
    return editMode ? 'Edit Room Type' : 'Book Your Stay';
  };

  // Get main display name
  const getMainTitle = () => {
    if (type === 'room') {
      return `Room #${data.roomNumber}`;
    }
    return displayData.roomCategory;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: '#3a3a3a',
          color: '#fff',
          borderRadius: 2,
          overflow: 'hidden',
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: '#2c2c2c',
          borderBottom: '1px solid #4a4a4a',
          py: 2,
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight={600}>
            {getTitle()}
          </Typography>
        </Box>
        <IconButton
          size="small"
          onClick={onClose}
          sx={{
            color: 'rgba(255,255,255,0.7)',
            '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.1)' },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Content */}
      <DialogContent sx={{ p: 0, bgcolor: '#2c2c2c' }}>
        {/* Image Carousel */}
        {displayImages.length > 0 && (
          <Box sx={{ position: 'relative', width: '100%', height: 320, bgcolor: '#1a1a1a' }}>
            <img
              src={displayImages[currentImageIndex]}
              alt={`Image ${currentImageIndex + 1}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />

            {/* Navigation Arrows */}
            {displayImages.length > 1 && (
              <>
                <IconButton
                  onClick={handlePreviousImage}
                  sx={{
                    position: 'absolute',
                    left: 16,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    bgcolor: 'rgba(0,0,0,0.6)',
                    color: '#fff',
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
                  }}
                >
                  <ChevronLeftIcon />
                </IconButton>
                <IconButton
                  onClick={handleNextImage}
                  sx={{
                    position: 'absolute',
                    right: 16,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    bgcolor: 'rgba(0,0,0,0.6)',
                    color: '#fff',
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
                  }}
                >
                  <ChevronRightIcon />
                </IconButton>

                {/* Dots Indicator */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 16,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    gap: 1,
                  }}
                >
                  {displayImages.map((_, idx) => (
                    <Box
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      sx={{
                        width: idx === currentImageIndex ? 24 : 8,
                        height: 8,
                        borderRadius: 4,
                        bgcolor: idx === currentImageIndex ? '#fff' : 'rgba(255,255,255,0.5)',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                      }}
                    />
                  ))}
                </Box>
              </>
            )}

            {/* Delete Image Button (Edit Mode) */}
            {editMode && setImagesToDelete && displayImages.length > 0 && (
              <IconButton
                onClick={() => handleImageDelete(displayImages[currentImageIndex], currentImageIndex)}
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  bgcolor: 'error.main',
                  color: '#fff',
                  '&:hover': { bgcolor: 'error.dark' },
                }}
                size="small"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        )}

        {/* Details */}
        <Box sx={{ p: 3 }}>
          {editMode ? (
            // Edit Mode Form
            <Stack spacing={3}>
              {type === 'roomType' && (
                <TextField
                  label="Room Category Name"
                  fullWidth
                  required
                  value={editDraft.roomCategory}
                  onChange={(e) =>
                    setEditDraft((d) => ({ ...d, roomCategory: e.target.value }))
                  }
                  sx={{
                    '& .MuiInputBase-root': { bgcolor: 'rgba(24, 26, 27, 0.9)', color: '#fff' },
                    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#4a4a4a' },
                  }}
                />
              )}

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    label="Price Per Night"
                    fullWidth
                    required
                    type="number"
                    value={type === 'roomType' ? editDraft.pricePerNight : editDraft.price}
                    onChange={(e) =>
                      setEditDraft((d) => ({
                        ...d,
                        [type === 'roomType' ? 'pricePerNight' : 'price']: e.target.value
                      }))
                    }
                    sx={{
                      '& .MuiInputBase-root': { bgcolor: 'rgba(24, 26, 27, 0.9)', color: '#fff' },
                      '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: '#4a4a4a' },
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Max Guests"
                    fullWidth
                    required
                    type="number"
                    value={editDraft.maxGuests}
                    onChange={(e) =>
                      setEditDraft((d) => ({ ...d, maxGuests: e.target.value }))
                    }
                    sx={{
                      '& .MuiInputBase-root': { bgcolor: 'rgba(24, 26, 27, 0.9)', color: '#fff' },
                      '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: '#4a4a4a' },
                    }}
                  />
                </Grid>
              </Grid>

              <Box>
                <Typography variant="caption" color="rgba(255,255,255,0.6)" sx={{ mb: 1, display: 'block' }}>
                  Amenities
                </Typography>
                <Grid container spacing={2}>
                  {editDraft.amenities.map((amenity, idx) => (
                    <Grid item xs={12} sm={6} key={idx}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TextField
                          fullWidth
                          size="small"
                          value={amenity}
                          onChange={(e) => {
                            const newAmenities = [...editDraft.amenities];
                            newAmenities[idx] = e.target.value;
                            setEditDraft((d) => ({ ...d, amenities: newAmenities }));
                          }}
                          sx={{
                            '& .MuiInputBase-root': { bgcolor: 'rgba(24, 26, 27, 0.9)', color: '#fff' },
                            '& .MuiOutlinedInput-notchedOutline': { borderColor: '#4a4a4a' },
                          }}
                        />
                        <IconButton
                          color="error"
                          size="small"
                          disabled={editDraft.amenities.length === 1}
                          onClick={() => {
                            if (editDraft.amenities.length > 1) {
                              setEditDraft((d) => ({
                                ...d,
                                amenities: editDraft.amenities.filter((_, i) => i !== idx),
                              }));
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
                  sx={{ mt: 2, borderColor: '#4a4a4a', color: '#fff' }}
                  onClick={() =>
                    setEditDraft((d) => ({ ...d, amenities: [...editDraft.amenities, ''] }))
                  }
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
                onChange={(e) =>
                  setEditDraft((d) => ({ ...d, description: e.target.value }))
                }
                sx={{
                  '& .MuiInputBase-root': { bgcolor: 'rgba(24, 26, 27, 0.9)', color: '#fff' },
                  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#4a4a4a' },
                }}
              />

              {/* Upload New Images */}
              <Box>
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  startIcon={<PhotoCamera />}
                  sx={{ borderColor: '#4a4a4a', color: '#fff' }}
                >
                  Upload New Images
                  <input
                    type="file"
                    hidden
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                      const files = Array.from(e.target.files);
                      if (type === 'roomType') {
                        setEditImages((prev) => [...prev, ...files]);
                      } else {
                        // For rooms, replace instead of append
                        setEditImages(files);
                      }
                    }}
                  />
                </Button>
                {editImages && editImages.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" color="rgba(255,255,255,0.6)" sx={{ mb: 1, display: 'block' }}>
                      New images to upload:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {editImages.map((img, idx) => (
                        <Box key={idx} sx={{ position: 'relative', width: 100, height: 100 }}>
                          <img
                            src={URL.createObjectURL(img)}
                            alt={`Preview ${idx}`}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              borderRadius: 8,
                            }}
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
                            onClick={() =>
                              setEditImages((prev) => prev.filter((_, i) => i !== idx))
                            }
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            </Stack>
          ) : (
            // View Mode
            <Stack spacing={2.5}>
              {/* Main Title */}
              <Box>
                <Typography variant="h5" fontWeight={700} gutterBottom>
                  {getMainTitle()}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {type === 'roomType' ? (
                    <Chip
                      label={displayData.roomCategory}
                      size="small"
                      sx={{
                        bgcolor: '#4a4a4a',
                        color: '#fff',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                      }}
                    />
                  ) : (
                    <>
                      <Chip
                        label={data.roomCategory}
                        size="small"
                        sx={{
                          bgcolor: '#1976d2',
                          color: '#fff',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                        }}
                      />
                      <Chip
                        label={data.isActive === false ? "Maintenance" : (data.booked ? "Booked" : "Available")}
                        size="small"
                        color={data.isActive === false ? "warning" : (data.booked ? "error" : "success")}
                        sx={{ fontWeight: 600 }}
                      />
                    </>
                  )}
                </Box>
              </Box>

              {/* Price */}
              <Box>
                <Typography variant="caption" color="rgba(255,255,255,0.6)" gutterBottom>
                  Price per night
                </Typography>
                <Typography variant="h4" color="#4fc3f7" fontWeight={700}>
                  ${type === 'roomType' ? displayData.pricePerNight : displayData.price}
                </Typography>
              </Box>

              {/* Max Guests */}
              <Box>
                <Typography variant="caption" color="rgba(255,255,255,0.6)" gutterBottom>
                  Max Guests
                </Typography>
                <Typography variant="h6" fontWeight={600}>
                  {displayData.maxGuests} guests
                </Typography>
              </Box>

              {/* Amenities */}
              {amenitiesArray.length > 0 && (
                <Box>
                  <Typography variant="caption" color="rgba(255,255,255,0.6)" gutterBottom>
                    Amenities
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                    {amenitiesArray.map((amenity, idx) => (
                      <Chip
                        key={idx}
                        label={amenity}
                        size="small"
                        sx={{
                          bgcolor: 'rgba(24, 26, 27, 0.9)',
                          color: '#fff',
                          border: '1px solid #4a4a4a',
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {/* Description */}
              {displayData.description && (
                <Box>
                  <Typography variant="caption" color="rgba(255,255,255,0.6)" gutterBottom>
                    Description
                  </Typography>
                  <Typography variant="body2" color="rgba(255,255,255,0.85)" sx={{ mt: 0.5 }}>
                    {displayData.description}
                  </Typography>
                </Box>
              )}
            </Stack>
          )}
        </Box>
      </DialogContent>

      {/* Actions */}
      <DialogActions
        sx={{
          bgcolor: '#2c2c2c',
          borderTop: '1px solid #4a4a4a',
          px: 3,
          py: 2,
          gap: 1,
        }}
      >
        {editMode ? (
          <>
            <Button
              onClick={onEditToggle}
              startIcon={<CancelIcon />}
              sx={{ color: 'rgba(255,255,255,0.7)' }}
            >
              Cancel
            </Button>
            <Button
              onClick={onDelete}
              startIcon={<DeleteIcon />}
              color="error"
              variant="outlined"
            >
              Delete
            </Button>
            <Button
              onClick={onSave}
              startIcon={<SaveIcon />}
              variant="contained"
              sx={{
                bgcolor: '#1976d2',
                '&:hover': { bgcolor: '#1565c0' },
              }}
            >
              Save Changes
            </Button>
          </>
        ) : (
          <>
            <Button
              onClick={onDelete}
              startIcon={<DeleteIcon />}
              color="error"
              variant="outlined"
            >
              Delete
            </Button>
            <Button
              onClick={onEditToggle}
              startIcon={<EditIcon />}
              variant="contained"
              sx={{
                bgcolor: '#1976d2',
                '&:hover': { bgcolor: '#1565c0' },
              }}
            >
              Edit
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default DetailsModal;
