// login.styles.jsx
import { styled } from "@mui/material/styles";
import { Box, Paper } from "@mui/material";

// Main container for the page
export const LoginContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  height: "100vh",
  width: "100%",
}));

// Left gradient branding panel
export const LoginLeft = styled(Box)(({ theme }) => ({
  flex: 1,
  background: "linear-gradient(135deg, #4e8af7 0%, #6dc4ff 100%)",
  color: "#fff",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  paddingLeft: "60px",

  [theme.breakpoints.down("md")]: {
    display: "none", // hides left panel on mobile for cleaner layout
  },
}));

// Title text on left
export const LoginTitle = styled("h1")(({ theme }) => ({
  fontSize: "48px",
  fontWeight: 700,
  margin: 0,
}));

// Subtitle text on left
export const LoginSubtitle = styled("p")(({ theme }) => ({
  marginTop: "10px",
  fontSize: "20px",
  opacity: 0.9,
}));

// Right side panel containing the form
export const LoginRight = styled(Paper)(({ theme }) => ({
  flex: 1,
  padding: "40px 60px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  borderRadius: 0, // matches a card-like panel
}));

// Title above form
export const FormTitle = styled("h2")(({ theme }) => ({
  fontSize: "32px",
  fontWeight: 600,
  marginBottom: "20px",
}));

// For smaller text (like “Don’t have an account?”)
export const SmallText = styled("span")(({ theme }) => ({
  fontSize: "0.9rem",
  color: "#555",
}));

// For text links like “Forgot Password?”
export const SmallLink = styled("a")(({ theme }) => ({
  color: theme.palette.primary.main,
  cursor: "pointer",
  fontWeight: 500,
  textDecoration: "none",
  "&:hover": {
    textDecoration: "underline",
  },
}));