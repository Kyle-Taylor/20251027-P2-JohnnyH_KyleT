import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Paper } from "@mui/material";

/**
 * DeleteConfirmationModal
 * @param {boolean} open - Whether the modal is open
 * @param {function} onClose - Function to close the modal
 * @param {function} onConfirm - Function to confirm deletion
 * @param {string} text - The text to display above the confirmation
 */
export default function DeleteConfirmationModal({ open, onClose, onConfirm, text }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      BackdropProps={{
        sx: {
          backgroundColor: 'rgba(6, 12, 18, 0.6)',
        },
      }}
      PaperProps={{
        component: Paper,
        elevation: 8,
        sx: {
          borderRadius: 3,
          minWidth: 340,
          maxWidth: 400,
          mx: 2,
          p: 2,
          bgcolor: 'rgba(24, 26, 27, 0.95)',
          color: 'text.primary',
          boxShadow: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 700, textAlign: 'center', color: 'text.primary', bgcolor: 'transparent' }}>
        Delete Confirmation
      </DialogTitle>
      <DialogContent sx={{ textAlign: 'center', bgcolor: 'transparent' }}>
        <Typography>{text}</Typography>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', bgcolor: 'transparent' }}>
        <Button onClick={onClose} color="inherit" variant="outlined">Cancel</Button>
        <Button onClick={onConfirm} color="error" variant="contained">Delete</Button>
      </DialogActions>
    </Dialog>
  );
}
