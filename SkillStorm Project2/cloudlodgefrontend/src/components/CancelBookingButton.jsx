import React, { useState } from "react";
import { Button, CircularProgress, Dialog, DialogTitle, DialogActions } from "@mui/material";
import { apiFetch } from "../api/apiFetch";

export default function CancelBookingButton({ reservationId, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");

  const handleCancel = async () => {
    setLoading(true);
    setError("");
    try {
      await apiFetch(`/reservations/delete/${reservationId}`, {
        method: "DELETE"
      });
      setOpen(false);
      if (onCancel) onCancel();
    } catch (err) {
      setError(err.message || "Failed to cancel booking");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button color="error" variant="outlined" size="small" onClick={() => setOpen(true)}>
        Cancel
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Are you sure you want to cancel this booking?</DialogTitle>
        {error && <div style={{ color: 'red', padding: 8 }}>{error}</div>}
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={loading}>No</Button>
          <Button onClick={handleCancel} color="error" disabled={loading}>
            {loading ? <CircularProgress size={20} /> : "Yes, Cancel"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
