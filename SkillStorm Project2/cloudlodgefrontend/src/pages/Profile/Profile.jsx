// Profile.jsx
import React, { useState } from 'react';
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

const Profile = () => {
  // Fake user data (pretend this came from DB)
  const [user, setUser] = useState({
    fullName: 'John Smith',
    username: 'johnsmith',
    email: 'johnsmith@email.com',
    phone: '(123) 456-7890',
    password: 'pass123',
    role: 'USER'
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (field) => (e) => {
    setUser({
      ...user,
      [field]: e.target.value
    });
  };

  const handleSave = () => {
    setIsEditing(false);
    alert('Profile updated successfully!');
  };

  return (
    <ProfileContainer>
      <ProfileLeft>
        <ProfileTitle>Profile</ProfileTitle>
        <ProfileSubtitle>
          User profile loaded from the database (demo)
        </ProfileSubtitle>
      </ProfileLeft>

      <ProfileRight>
        <ProfileCard elevation={3}>
          {isEditing ? (
            <>
              <TextField
                label="Full Name"
                value={user.fullName}
                onChange={handleChange('fullName')}
                fullWidth
              />
              <TextField
                label="Username"
                value={user.username}
                onChange={handleChange('username')}
                fullWidth
              />
              <TextField
                label="Email"
                value={user.email}
                onChange={handleChange('email')}
                fullWidth
              />
              <TextField
                label="Phone Number"
                value={user.phone}
                onChange={handleChange('phone')}
                fullWidth
              />
              <TextField
                label="Password"
                type="password"
                value={user.password}
                onChange={handleChange('password')}
                fullWidth
              />

              <Button
                variant="contained"
                color="primary"
                onClick={handleSave}
              >
                Save Changes
              </Button>
            </>
          ) : (
            <>
              <ProfileItem><strong>Full Name:</strong> {user.fullName}</ProfileItem>
              <ProfileItem><strong>Username:</strong> {user.username}</ProfileItem>
              <ProfileItem><strong>Email:</strong> {user.email}</ProfileItem>
              <ProfileItem><strong>Phone:</strong> {user.phone}</ProfileItem>
              <ProfileItem><strong>Password:</strong> ••••••••</ProfileItem>
              <ProfileItem><strong>Role:</strong> {user.role}</ProfileItem>

              <Button
                variant="outlined"
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </Button>
            </>
          )}
        </ProfileCard>
      </ProfileRight>
    </ProfileContainer>
  );
};

export default Profile;