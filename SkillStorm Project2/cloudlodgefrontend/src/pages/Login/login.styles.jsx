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
  backgroundColor: '#0f1113',
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
  color: '#e3e6ea',
  width: '100%',
  maxWidth: '900px',

  [theme.breakpoints.down('md')]: {
    minHeight: 'auto',
  },
}));

export const LoginTitle = styled(Typography)({
  fontSize: '3rem',
  fontWeight: 700,
  marginBottom: '0.5rem',
  color: '#e3e6ea',
});

export const LoginSubtitle = styled(Typography)({
  fontSize: '1.2rem',
  fontWeight: 400,
  color: '#b0b3b8',
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
  backgroundColor: '#181a1b',
  border: '1px solid #23272a',
  color: '#e3e6ea',
});

export const FormTitle = styled(Typography)({
  fontSize: '1.8rem',
  fontWeight: 600,
  marginBottom: '1rem',
  textAlign: 'center',
});

export const FormWrapper = styled(Box)({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
});

export const SmallLink = styled('a')({
  color: '#646cff',
  textDecoration: 'none',
  fontWeight: 500,
  '&:hover': {
    textDecoration: 'underline',
  },
});

export const SmallText = styled(Typography)({
  fontSize: '0.9rem',
  color: '#ccc',
});
