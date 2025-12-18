import { createTheme } from "@mui/material/styles";

// Create a custom MUI theme
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: "#1976d2", // blue
    },
    secondary: {
      main: "#f50057", // pink
    },
    background: {
      default: "#181a1b", // dark background
      paper: "#23272a", // dark dialog background
    },
  },
  typography: {
    fontFamily: "Roboto, Arial, sans-serif",
    h4: {
      fontWeight: 600,
    },
    button: {
      textTransform: "none",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8, // default button radius
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          marginBottom: 16,
        },
      },
    },
  },
});

export default theme;
