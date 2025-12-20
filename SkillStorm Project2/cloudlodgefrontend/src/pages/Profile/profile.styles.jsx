// profile.styles.jsx
import { styled } from '@mui/material/styles';
import { Box, Paper, Typography } from '@mui/material';

export const ProfileContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  width: '100vw',
  height: '100vh',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '2rem',
  padding: '2rem',
  boxSizing: 'border-box',
  backgroundColor: '#1976d2',

  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    height: 'auto',
    padding: '1rem',
  },
}));

export const ProfileLeft = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'flex-start',
  padding: '2rem',
  minHeight: '400px',
  color: '#fff',

  [theme.breakpoints.down('md')]: {
    alignItems: 'center',
    textAlign: 'center',
  },
}));

export const ProfileTitle = styled(Typography)({
  fontSize: '3rem',
  fontWeight: 700,
  marginBottom: '1rem',
});

export const ProfileSubtitle = styled(Typography)({
  fontSize: '1.2rem',
  fontWeight: 400,
});

export const ProfileRight = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '400px',
}));

export const ProfileCard = styled(Paper)({
  width: '100%',
  maxWidth: '400px',
  padding: '2rem',
  borderRadius: '12px',
  display: 'flex',
  flexDirection: 'column',
  gap: '1.2rem',
});

export const ProfileItem = styled(Typography)({
  fontSize: '1rem',
});
