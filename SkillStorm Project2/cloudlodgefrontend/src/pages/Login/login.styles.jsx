// login.styles.jsx
import { styled } from '@mui/material/styles';
import { Box, Paper, Typography } from '@mui/material';

// Main container: two columns, responsive
export const LoginContainer = styled(Box)(({ theme }) => ({
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
    flexDirection: 'column', // stack on small screens
    height: 'auto',
    padding: '1rem',
  },
}));

// LEFT PANEL
export const LoginLeft = styled(Box)(({ theme }) => ({
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
    minHeight: 'auto',
  },
}));

export const LoginTitle = styled(Typography)({
  fontSize: '3rem',
  fontWeight: 700,
  marginBottom: '1rem',
});

export const LoginSubtitle = styled(Typography)({
  fontSize: '1.2rem',
  fontWeight: 400,
});

// RIGHT PANEL
export const LoginRight = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '400px',

  [theme.breakpoints.down('md')]: {
    width: '100%',
    minHeight: 'auto',
    marginTop: '2rem',
  },
}));

export const LoginCard = styled(Paper)({
  width: '100%',
  maxWidth: '400px',
  padding: '2rem',
  borderRadius: '12px',
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
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
