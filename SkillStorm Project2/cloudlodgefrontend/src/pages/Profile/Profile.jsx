import React, { useEffect, useState } from 'react';
import {
  ProfileContainer,
  ProfileLeft,
  ProfileRight,
  ProfileTitle,
  ProfileSubtitle,
  ProfileCard,
  ProfileItem
} from './profile.styles';
import { Button, TextField } from '@mui/material';
import { apiFetch } from '../../api/apiFetch';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [globalError, setGlobalError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Load profile on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await apiFetch("/profile");
        setUser(data);
      } catch (err) {
        console.error(err);
        setGlobalError('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  // Handle field changes
  const handleChange = (field) => (e) => {
    setUser({ ...user, [field]: e.target.value });
    setFieldErrors({ ...fieldErrors, [field]: '' }); // clear error on change
  };

  // Validate fields before saving
  const validateFields = () => {
    const errors = {};
    if (!user.fullName || user.fullName.trim() === '') {
      errors.fullName = 'Full name is required';
    }
    if (!user.phone || user.phone.trim() === '') {
      errors.phone = 'Phone number is required';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save profile updates (optimistic UI)
  const handleSave = async () => {
    if (!validateFields()) return;

    const previousUser = { ...user }; // backup for rollback
    setGlobalError('');

    try {
      // Optimistically update UI
      setIsEditing(false);

      // Send update to backend
      await apiFetch("/profile", {
        method: "PUT",
        body: user,
      });

      alert("Profile updated successfully!");
    } catch (err) {
      // Rollback on failure
      setUser(previousUser);
      setIsEditing(true);
      setGlobalError("Error updating profile: " + err.message);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Not Allowed</div>;

  return (
    <ProfileContainer>
      <ProfileLeft>
        <ProfileTitle>Profile</ProfileTitle>
        <ProfileSubtitle>
          User profile loaded from the database
        </ProfileSubtitle>
      </ProfileLeft>

      <ProfileRight>
        <ProfileCard elevation={3}>
          {isEditing ? (
            <>
              <TextField
                label="Auth Provider"
                value={user.authProvider}
                fullWidth
                margin="normal"
                disabled
              />  
              <TextField
                label="Full Name"
                value={user.fullName}
                onChange={handleChange('fullName')}
                fullWidth
                margin="normal"
                error={!!fieldErrors.fullName}
                helperText={fieldErrors.fullName}
              />
              <TextField
                label="Email"
                value={user.email}
                fullWidth
                margin="normal"
                disabled
              />
              <TextField
                label="Role"
                value={user.role}
                fullWidth
                margin="normal"
                disabled
              />
              <TextField
                label="Phone Number"
                value={user.phone || ''}
                onChange={handleChange('phone')}
                fullWidth
                margin="normal"
                error={!!fieldErrors.phone}
                helperText={fieldErrors.phone}
              />

              <Button
                variant="contained"
                color="primary"
                onClick={handleSave}
                style={{ marginTop: '16px' }}
              >
                Save Changes
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  setIsEditing(false);
                  setFieldErrors({});
                  setGlobalError('');
                }}
                style={{ marginTop: '16px', marginLeft: '8px' }}
              >
                Cancel
              </Button>
            </>
          ) : (
            <>
              <ProfileItem><strong>Auth Provider:</strong> {user.authProvider}</ProfileItem>
              <ProfileItem><strong>Full Name:</strong> {user.fullName}</ProfileItem>
              <ProfileItem><strong>Email:</strong> {user.email}</ProfileItem>
              <ProfileItem><strong>Role:</strong> {user.role}</ProfileItem>
              <ProfileItem>
                <strong>Phone Number:</strong> {user.phone && user.phone.trim() !== '' ? user.phone : 'N/A'}
              </ProfileItem>

              <Button
                variant="outlined"
                onClick={() => setIsEditing(true)}
                style={{ marginTop: '16px' }}
              >
                Edit Profile
              </Button>
            </>
          )}
          {globalError && <div style={{ color: 'red', marginTop: '10px' }}>{globalError}</div>}
        </ProfileCard>
      </ProfileRight>
    </ProfileContainer>
  );
};

export default Profile;
