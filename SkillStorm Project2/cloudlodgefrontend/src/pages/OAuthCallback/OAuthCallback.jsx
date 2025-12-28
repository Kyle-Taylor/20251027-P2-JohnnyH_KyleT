import React, { useEffect, useState } from "react";
import { Box, CircularProgress, Paper, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setToken } from "../../store/authSlice";

export default function OAuthCallback() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [message, setMessage] = useState("Signing you in with Google...");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const error = params.get("error");

    let timeoutId;

    if (token) {
      dispatch(setToken(token));
      setMessage("Success! Finishing sign-in...");
      timeoutId = setTimeout(() => navigate("/create-reservation", { replace: true }), 800);
    } else if (error) {
      const decodedError = decodeURIComponent(error);
      setMessage(`OAuth login failed: ${decodedError}`);
      timeoutId = setTimeout(() => navigate("/login", { replace: true }), 1600);
    } else {
      setMessage("No login token returned. Redirecting to login...");
      timeoutId = setTimeout(() => navigate("/login", { replace: true }), 1600);
    }

    return () => clearTimeout(timeoutId);
  }, [navigate]);

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#0f1113",
        color: "#e3e6ea",
        p: 2,
      }}
    >
      <Paper
        elevation={4}
        sx={{
          p: 4,
          maxWidth: 420,
          width: "100%",
          textAlign: "center",
          bgcolor: "#181a1b",
          color: "#e3e6ea",
          border: "1px solid #23272a",
        }}
      >
        <CircularProgress size={48} sx={{ color: "#3f6df6", mb: 3 }} />
        <Typography variant="h6" sx={{ mb: 1 }}>
          Finalizing sign-in
        </Typography>
        <Typography variant="body2">{message}</Typography>
      </Paper>
    </Box>
  );
}
