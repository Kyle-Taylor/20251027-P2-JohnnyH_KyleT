import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  IconButton,
  Button,
  Stack
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';

export default function EditModal({
  open,
  title,
  editMode,
  onClose,
  onEdit,
  onCancel,
  onSave,
  onDelete,
  children
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
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
          {title}
        </Typography>
        <IconButton size="small" color="error" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ pt: 3, pb: 3, bgcolor: 'background.default', color: 'text.primary' }}>
        {children}
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
        <Button color="error" variant="contained" onClick={onDelete}>
          Delete
        </Button>
        {editMode ? (
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={onCancel}>Cancel</Button>
            <Button variant="contained" onClick={onSave}>Save</Button>
          </Stack>
        ) : (
          <Button variant="contained" onClick={onEdit}>Edit</Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
