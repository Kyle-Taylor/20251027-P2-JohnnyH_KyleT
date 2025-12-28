import { createTheme } from "@mui/material/styles";

// Create a custom MUI theme
const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#7dd3fc",
      dark: "#0ea5e9",
      light: "#bae6fd",
    },
    secondary: {
      main: "#60a5fa",
    },
    success: {
      main: "#34d399",
    },
    warning: {
      main: "#fbbf24",
    },
    error: {
      main: "#f87171",
    },
    background: {
      default: "#0f1113",
      paper: "#181a1b",
    },
    text: {
      primary: "#e6edf6",
      secondary: "#9aa4b2",
    },
  },
  typography: {
    fontFamily: "'Manrope', 'Segoe UI', Arial, sans-serif",
    h1: {
      fontFamily: "'Playfair Display', serif",
      fontWeight: 700,
    },
    h2: {
      fontFamily: "'Playfair Display', serif",
      fontWeight: 700,
    },
    h3: {
      fontFamily: "'Playfair Display', serif",
      fontWeight: 700,
    },
    h4: {
      fontFamily: "'Playfair Display', serif",
      fontWeight: 600,
    },
    h5: {
      fontFamily: "'Playfair Display', serif",
      fontWeight: 600,
    },
    button: {
      textTransform: "none",
      fontWeight: 600,
      letterSpacing: 0.2,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: "1px solid rgba(125, 211, 252, 0.08)",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: "1px solid rgba(125, 211, 252, 0.08)",
        },
      },
    },
  },
});

export default theme;
