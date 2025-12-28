
import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  CircularProgress,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import { apiFetch } from "../api/apiFetch";


export default function UsersTable() {

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tableError, setTableError] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({
    email: "",
    fullName: "",
    phone: "",
    role: "GUEST",
  });
  const [editError, setEditError] = useState("");
  const [saving, setSaving] = useState(false);
  async function handleDeleteUser(id) {
    try {
      const data = await apiFetch(`/delete/${id}`, { method: "DELETE" });
      setUsers(users.filter(u => (u.id || u._id) !== id));
    } catch (err) {
      setTableError(err.message);
    }
    setDeleteModalOpen(false);
    setUserToDelete(null);
  }

  function handleOpenEdit(user) {
    setEditUser(user);
    setEditForm({
      email: user.email || "",
      fullName: user.fullName || "",
      phone: user.phone || "",
      role: user.role || "GUEST",
    });
    setEditError("");
    setEditModalOpen(true);
  }

  function handleCloseEdit() {
    setEditModalOpen(false);
    setEditUser(null);
    setEditError("");
  }

  async function handleSaveUser() {
    if (!editUser) return;
    setSaving(true);
    setEditError("");
    try {
      const id = editUser.id || editUser._id;
      const payload = {
        ...editUser,
        email: editForm.email.trim(),
        fullName: editForm.fullName.trim(),
        phone: editForm.phone.trim(),
        role: editForm.role,
      };
      const updated = await apiFetch(`/users/update/${id}`, {
        method: "PUT",
        body: payload,
      });
      setUsers(users.map(u => ((u.id || u._id) === id ? updated : u)));
      handleCloseEdit();
    } catch (err) {
      setEditError(err.message);
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    setTableError("");
    try {
      const data = await apiFetch("/users");
      setUsers(data);
    } catch (err) {
      setTableError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box sx={{ mt: 4, width: "85%" }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Users
      </Typography>
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : tableError ? (
        <Typography color="error">{tableError}</Typography>
      ) : (
        <TableContainer component={Paper} sx={{ bgcolor: "background.paper" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Email</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow
                  key={user.id || user._id}
                  hover
                  sx={{ cursor: "pointer" }}
                  onClick={() => handleOpenEdit(user)}
                >
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.fullName || ""}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>{user.phone || ""}</TableCell>
                  <TableCell>{user.createdAt ? new Date(user.createdAt).toLocaleString() : ""}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Delete User">
                      <IconButton
                        color="error"
                        onClick={(event) => {
                          event.stopPropagation();
                          setUserToDelete(user.id || user._id);
                          setDeleteModalOpen(true);
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <DeleteConfirmationModal
          open={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={() => handleDeleteUser(userToDelete)}
          text="Are you sure you want to delete this user? This action cannot be undone."
        />
      )}

      <Dialog open={editModalOpen} onClose={handleCloseEdit} maxWidth="sm" fullWidth>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Email"
              value={editForm.email}
              onChange={(event) => setEditForm({ ...editForm, email: event.target.value })}
              fullWidth
            />
            <TextField
              label="Name"
              value={editForm.fullName}
              onChange={(event) => setEditForm({ ...editForm, fullName: event.target.value })}
              fullWidth
            />
            <TextField
              label="Phone"
              value={editForm.phone}
              onChange={(event) => setEditForm({ ...editForm, phone: event.target.value })}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel id="user-role-label">Role</InputLabel>
              <Select
                labelId="user-role-label"
                label="Role"
                value={editForm.role}
                onChange={(event) => setEditForm({ ...editForm, role: event.target.value })}
              >
                <MenuItem value="GUEST">GUEST</MenuItem>
                <MenuItem value="ADMIN">ADMIN</MenuItem>
                <MenuItem value="MANAGER">MANAGER</MenuItem>
              </Select>
            </FormControl>
            {editError && (
              <Typography color="error" variant="body2">
                {editError}
              </Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEdit} disabled={saving}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveUser} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
