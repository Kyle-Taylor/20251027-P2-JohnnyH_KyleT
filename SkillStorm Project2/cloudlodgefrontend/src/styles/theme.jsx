import { createTheme } from "@mui/material/styles";

// Create a custom MUI theme
const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#7dd3fc",
      dark: "#4ea8f3",
      light: "#b8e6ff",
    },
    secondary: {
      main: "#60a5fa",
    },
    success: {
      main: "#22c55e",
    },
    warning: {
      main: "#f59e0b",
    },
    error: {
      main: "#f87171",
    },
    background: {
      default: "#0f1113",
      paper: "#151a1f",
    },
    text: {
      primary: "#e6edf6",
      secondary: "#98a2b3",
    },
  },
  typography: {
    fontFamily: "'Manrope', 'Segoe UI', Arial, sans-serif",
    h1: {
      fontFamily: "'Playfair Display', serif",
      fontWeight: 700,
      letterSpacing: 0.4,
    },
    h2: {
      fontFamily: "'Playfair Display', serif",
      fontWeight: 700,
      letterSpacing: 0.3,
    },
    h3: {
      fontFamily: "'Playfair Display', serif",
      fontWeight: 700,
      letterSpacing: 0.2,
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
      letterSpacing: 0.3,
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          paddingInline: 18,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 18,
          border: "1px solid rgba(125, 211, 252, 0.16)",
          backgroundImage:
            "linear-gradient(160deg, rgba(255,255,255,0.03), rgba(0,0,0,0))",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 18,
          border: "1px solid rgba(125, 211, 252, 0.14)",
          backgroundImage:
            "linear-gradient(160deg, rgba(255,255,255,0.03), rgba(0,0,0,0))",
        },
      },
    },
  },
});

export default theme;
