import React, { useEffect, useState } from 'react';
import { Button, Divider, TextField, Typography, Stack, Box, FormControlLabel, Switch, Paper, Grid, Chip } from '@mui/material';
import dayjs from 'dayjs';
import Header from '../../components/Header';
import { useNavigate } from 'react-router-dom';
import {
  useDeletePaymentMethodMutation,
  useGetProfileQuery,
  useSyncPaymentMethodsMutation,
  useUpdateProfileMutation,
} from '../../store/apiSlice';
import PaymentModal from '../../components/payments/PaymentModal';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [globalError, setGlobalError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [pmLoadingId, setPmLoadingId] = useState(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const { data, isLoading, error, refetch } = useGetProfileQuery();
  const [updateProfile] = useUpdateProfileMutation();
  const [deletePaymentMethod] = useDeletePaymentMethodMutation();
  const [syncPaymentMethods] = useSyncPaymentMethodsMutation();

  // Load profile on mount
  useEffect(() => {
    if (data) {
      setUser(data);
    }
  }, [data]);

  useEffect(() => {
    syncPaymentMethods().unwrap().catch(() => {});
  }, [syncPaymentMethods]);

  useEffect(() => {
    if (error) {
      setGlobalError('Failed to load profile.');
    }
  }, [error]);

  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading]);

  // Handle field changes
  const handleChange = (field) => (e) => {
    setUser({ ...user, [field]: e.target.value });
    setFieldErrors({ ...fieldErrors, [field]: '' }); // clear error on change
  };

  const handlePhoneChange = (e) => {
    const digits = (e.target.value || '').replace(/\D/g, '').slice(0, 10);
    setUser({ ...user, phone: digits });
    setFieldErrors({ ...fieldErrors, phone: '' });
  };

  const handleAddressChange = (field) => (e) => {
    const next = { ...(user.billingAddress || {}) };
    next[field] = e.target.value;
    setUser({ ...user, billingAddress: next });
  };

  const handlePreferencesChange = (field) => (e) => {
    const next = { ...(user.preferences || {}) };
    next[field] = field === 'smoking' ? e.target.checked : e.target.value;
    setUser({ ...user, preferences: next });
  };

  // Validate fields before saving
  const validateFields = () => {
    const errors = {};
    if (!user.fullName || user.fullName.trim() === '') {
      errors.fullName = 'Full name is required';
    }
    const phoneDigits = (user.phone || '').replace(/\D/g, '');
    if (user.phone && phoneDigits.length > 0 && phoneDigits.length !== 10) {
      errors.phone = 'Phone number must be 10 digits';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleDeletePaymentMethod = async (pmId) => {
    setPmLoadingId(pmId);
    try {
      await deletePaymentMethod(pmId).unwrap();
      await refetch();
    } catch (err) {
      setGlobalError("Failed to remove payment method: " + (err?.message || ""));
    } finally {
      setPmLoadingId(null);
    }
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
      await updateProfile(user).unwrap();
      await refetch();

      alert("Profile updated successfully!");
    } catch (err) {
      // Rollback on failure
      setUser(previousUser);
      setIsEditing(true);
      setGlobalError("Error updating profile: " + (err?.message || ""));
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Not Allowed</div>;

  const preferences = user.preferences || {};
  const billing = user.billingAddress || {};
  const savedCards = Array.isArray(user.savedPaymentMethods) ? user.savedPaymentMethods : [];
  const line1 = [billing.street, billing.apartment].filter(Boolean).join(' ');
  const cityStateZip = [billing.city, billing.state ? `${billing.state}${billing.zip ? ' ' + billing.zip : ''}` : billing.zip]
    .filter(Boolean)
    .join(', ');
  const joinedAddress = [line1, cityStateZip, billing.country].filter(Boolean).join(' ');
  const created = user.createdAt ? dayjs(user.createdAt).format('MMM D, YYYY') : null;
  const formattedPhone = user.phone && user.phone.replace(/\D/g, '').length === 10
    ? user.phone.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')
    : (user.phone && user.phone.trim() !== '' ? user.phone : 'N/A');

  return (
    <>
      <Header showSearch={false} />
      <Box
        sx={{
          display: 'flex',
          minHeight: '100vh',
          background:
            'radial-gradient(circle at 0% 0%, rgba(125,211,252,0.16), transparent 45%), radial-gradient(circle at 90% 10%, rgba(96,165,250,0.16), transparent 45%), #0f1113',
        }}
      >
        <Box sx={{ flex: 1, p: { xs: 2, md: 4 }, color: '#e6edf6' }}>
          <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>Profile</Typography>
          <Typography variant="body2" sx={{ mb: 3, color: '#b0b3b8' }}>
            Manage your account details and saved payment methods.
          </Typography>
          {globalError && <Chip label={globalError} color="error" sx={{ mb: 2 }} />}
          <Grid container spacing={3}>
            <Grid item xs={12} md={7}>
              <Paper sx={{ p: 3, bgcolor: 'rgba(21, 26, 31, 0.92)', border: '1px solid rgba(125, 211, 252, 0.18)' }}>
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
                onChange={handlePhoneChange}
                fullWidth
                margin="normal"
                error={!!fieldErrors.phone}
                helperText={fieldErrors.phone}
              />
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Preferences</Typography>
              <TextField
                label="Bed Type"
                value={preferences.bedType || ''}
                onChange={handlePreferencesChange('bedType')}
                fullWidth
                margin="normal"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={!!preferences.smoking}
                    onChange={handlePreferencesChange('smoking')}
                  />
                }
                label="Smoking room"
              />

              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Billing Address</Typography>
              <TextField
                label="Street"
                value={billing.street || ''}
                onChange={handleAddressChange('street')}
                fullWidth
                margin="dense"
              />
              <TextField
                label="Apartment"
                value={billing.apartment || ''}
                onChange={handleAddressChange('apartment')}
                fullWidth
                margin="dense"
              />
              <TextField
                label="City"
                value={billing.city || ''}
                onChange={handleAddressChange('city')}
                fullWidth
                margin="dense"
              />
              <TextField
                label="State"
                value={billing.state || ''}
                onChange={handleAddressChange('state')}
                fullWidth
                margin="dense"
              />
              <TextField
                label="ZIP"
                value={billing.zip || ''}
                onChange={handleAddressChange('zip')}
                fullWidth
                margin="dense"
              />
              <TextField
                label="Country"
                value={billing.country || ''}
                onChange={handleAddressChange('country')}
                fullWidth
                margin="dense"
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
              <Typography sx={{ mb: 1 }}><strong>Auth Provider:</strong> {user.authProvider}</Typography>
              <Typography sx={{ mb: 1 }}><strong>Full Name:</strong> {user.fullName}</Typography>
              <Typography sx={{ mb: 1 }}><strong>Email:</strong> {user.email}</Typography>
              <Typography sx={{ mb: 1 }}><strong>Role:</strong> {user.role}</Typography>
              <Typography sx={{ mb: 1 }}>
                <strong>Phone Number:</strong> {formattedPhone}
              </Typography>
              {created && (
                <Typography sx={{ mb: 1 }}><strong>Member since:</strong> {created}</Typography>
              )}
              <Typography sx={{ mb: 1 }}><strong>Provider ID:</strong> {user.providerId || 'N/A'}</Typography>
              <Typography sx={{ mb: 2 }}><strong>Stripe Customer ID:</strong> {user.stripeCustomerId || 'N/A'}</Typography>

              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Preferences</Typography>
              <Typography sx={{ mb: 1 }}><strong>Bed Type:</strong> {preferences.bedType || 'Not set'}</Typography>
              <Typography sx={{ mb: 2 }}><strong>Smoking:</strong> {preferences.smoking == null ? 'Not set' : (preferences.smoking ? 'Yes' : 'No')}</Typography>

              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Billing Address</Typography>
              <Typography sx={{ mb: 2 }}>{joinedAddress || 'No billing address on file'}</Typography>

              <Button
                variant="outlined"
                onClick={() => setIsEditing(true)}
                sx={{ mt: 2 }}
              >
                Edit Profile
              </Button>
              <Button
                variant="contained"
                onClick={() => navigate('/user-reservations')}
                style={{ marginTop: '16px', marginLeft: '8px' }}
              >
                View My Reservations
              </Button>
            </>
          )}
          {globalError && <div style={{ color: 'red', marginTop: '10px' }}>{globalError}</div>}
              </Paper>
            </Grid>
            <Grid item xs={12} md={5}>
              <Paper sx={{ p: 3, bgcolor: 'rgba(21, 26, 31, 0.92)', border: '1px solid rgba(125, 211, 252, 0.18)' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Saved Payment Methods</Typography>
                {savedCards.length === 0 && (
                  <Typography sx={{ color: '#b0b3b8' }}>None saved</Typography>
                )}
                {savedCards.length > 0 && (
                  <Stack spacing={0.5}>
                    {savedCards.map((pm, idx) => (
                      <Box key={idx} sx={{ fontSize: '0.95rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{pm.brand || 'Card'} •••• {pm.last4 || '----'}</span>
                        <Button
                          size="small"
                          color="error"
                          variant="text"
                          onClick={() => handleDeletePaymentMethod(pm.stripePaymentMethodId)}
                          disabled={pmLoadingId === pm.stripePaymentMethodId}
                        >
                          {pmLoadingId === pm.stripePaymentMethodId ? "Removing..." : "Remove"}
                        </Button>
                      </Box>
                    ))}
                  </Stack>
                )}
                <Button
                  variant="outlined"
                  sx={{ mt: 2 }}
                  onClick={() => setPaymentModalOpen(true)}
                >
                  Add Payment Method
                </Button>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Box>

      <PaymentModal
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        onSuccess={async () => {
          // Ensure new payment method shows up immediately
          try {
            await syncPaymentMethods().unwrap();
          } catch (_) {
            // ignore sync errors here
          }
          await refetch();
          setPaymentModalOpen(false);
        }}
        title="Add Payment Method"
        savedCards={savedCards}
        allowSavedSelection={false}
      />
    </>
  );
};

export default Profile;
