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
  background: 'radial-gradient(circle at 10% 10%, rgba(125,211,252,0.16), transparent 40%), radial-gradient(circle at 90% 30%, rgba(96,165,250,0.16), transparent 45%), #0f1113',

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
  color: '#e6edf6',

  [theme.breakpoints.down('md')]: {
    alignItems: 'center',
    textAlign: 'center',
    minHeight: 'auto',
  },
}));

export const RegisterTitle = styled(Typography)({
  fontSize: '3.2rem',
  fontWeight: 700,
  marginBottom: '0.5rem',
  color: '#e6edf6',
  fontFamily: "'Playfair Display', serif",
});

export const RegisterSubtitle = styled(Typography)({
  fontSize: '1.1rem',
  fontWeight: 400,
  color: '#9aa4b2',
  maxWidth: 480,
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
  backgroundColor: 'rgba(24, 26, 27, 0.9)',
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
