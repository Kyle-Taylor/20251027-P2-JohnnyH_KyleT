// login.styles.jsx
import { styled } from '@mui/material/styles';
import { Box, Paper, Typography } from '@mui/material';

// Main container: two columns, responsive
export const LoginContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  width: '100vw',
  minHeight: '100vh',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '2rem',
  padding: '3rem 1.5rem',
  boxSizing: 'border-box',
  background: 'radial-gradient(circle at top left, rgba(125,211,252,0.18), transparent 45%), radial-gradient(circle at 20% 80%, rgba(96,165,250,0.18), transparent 50%), #0f1113',
  overflowX: 'hidden',

  [theme.breakpoints.down('md')]: {
    minHeight: '100vh',
    padding: '2rem 1rem',
  },
}));

// LEFT PANEL
export const LoginLeft = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
  padding: '0 1rem',
  minHeight: 'auto',
  color: '#e6edf6',
  width: '100%',
  maxWidth: '900px',

  [theme.breakpoints.down('md')]: {
    minHeight: 'auto',
  },
}));

export const LoginTitle = styled(Typography)({
  fontSize: '3.2rem',
  fontWeight: 700,
  marginBottom: '0.5rem',
  color: '#e6edf6',
  fontFamily: "'Playfair Display', serif",
});

export const LoginSubtitle = styled(Typography)({
  fontSize: '1.1rem',
  fontWeight: 400,
  color: '#9aa4b2',
  maxWidth: 520,
});

// RIGHT PANEL
export const LoginRight = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: 'auto',
  width: '100%',

  [theme.breakpoints.down('md')]: {
    width: '100%',
    minHeight: 'auto',
    marginTop: '2rem',
  },
}));

export const LoginCard = styled(Paper)({
  width: '100%',
  maxWidth: '520px',
  padding: '2rem',
  borderRadius: '12px',
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  backgroundColor: 'rgba(24, 26, 27, 0.88)',
  border: '1px solid rgba(125, 211, 252, 0.16)',
  color: '#e6edf6',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 24px 60px rgba(6, 15, 24, 0.45)',
});

export const FormTitle = styled(Typography)({
  fontSize: '1.9rem',
  fontWeight: 600,
  marginBottom: '1rem',
  textAlign: 'center',
  fontFamily: "'Playfair Display', serif",
});

export const FormWrapper = styled(Box)({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
});

export const SmallLink = styled('a')({
  color: '#7dd3fc',
  textDecoration: 'none',
  fontWeight: 500,
  '&:hover': {
    textDecoration: 'underline',
  },
});

export const SmallText = styled(Typography)({
  fontSize: '0.9rem',
  color: '#9aa4b2',
});
