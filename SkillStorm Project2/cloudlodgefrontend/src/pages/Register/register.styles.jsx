import { styled } from '@mui/material/styles';
import { Box, Paper, Typography } from '@mui/material';

// Main container: two columns
export const RegisterContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  width: '100%',
  minHeight: 'calc(100vh - 72px)',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '2rem',
  boxSizing: 'border-box',
  padding: '2rem',
  backgroundColor: '#0f1113',

  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    minHeight: 'auto',
    padding: '1rem',
  },
}));

// LEFT PANEL
export const RegisterLeft = styled(Box)(({ theme }) => ({
  flex: 1,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'flex-start',
  padding: '2rem',
  color: '#e3e6ea',

  [theme.breakpoints.down('md')]: {
    alignItems: 'center',
    textAlign: 'center',
    minHeight: 'auto',
  },
}));

export const RegisterTitle = styled(Typography)({
  fontSize: '3rem',
  fontWeight: 700,
  marginBottom: '0.5rem',
  color: '#e3e6ea',
});

export const RegisterSubtitle = styled(Typography)({
  fontSize: '1.2rem',
  fontWeight: 400,
  color: '#b0b3b8',
});

// RIGHT PANEL
export const RegisterRight = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#0f1113',

  [theme.breakpoints.down('md')]: {
    width: '100%',
    minHeight: 'auto',
    marginTop: '2rem',
  },
}));

export const RegisterCard = styled(Paper)({
  width: '100%',
  maxWidth: '400px',
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
