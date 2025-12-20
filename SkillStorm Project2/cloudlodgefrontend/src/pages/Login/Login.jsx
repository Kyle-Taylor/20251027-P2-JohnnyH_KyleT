// login.jsx
import React, { useState } from "react";
import { TextField, Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

import {
  LoginContainer,
  LoginLeft,
  LoginTitle,
  LoginSubtitle,
  LoginRight,
  LoginCard,
  FormTitle,
  FormWrapper,
  SmallLink,
  SmallText
} from "./login.styles";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:8080/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed");
        return;
      }

      console.log("Login successful:", data);
      navigate("/profile");

    } catch (err) {
      console.error(err);
      setError("Error connecting to backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginContainer>
      {/* LEFT PANEL */}
      <LoginLeft>
        <LoginTitle>CloudLodge</LoginTitle>
        <LoginSubtitle>Welcome back. Sign in to continue.</LoginSubtitle>
      </LoginLeft>

      {/* RIGHT PANEL */}
      <LoginRight>
        <LoginCard elevation={6}>
          <FormTitle>Sign In</FormTitle>

          <FormWrapper>
            {/* FORM */}
            <Box component="form" onSubmit={handleLogin}>
              <TextField
                label="Email"
                variant="outlined"
                fullWidth
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                label="Password"
                variant="outlined"
                type="password"
                fullWidth
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{ mb: 2 }}
              />

              {error && (
                <Box sx={{ color: "error.main", textAlign: "center", mb: 2 }}>
                  {error}
                </Box>
              )}

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
              >
                {loading ? "Signing in..." : "Login"}
              </Button>
            </Box>

            {/* Forgot password / signup */}
            <Box textAlign="center" mt={3}>
              <SmallLink href="#">Forgot password?</SmallLink>
              <br /><br />
              <SmallText>Don’t have an account?</SmallText>{" "}
              {/* Updated sign up link */}
              <SmallLink
                component="button"
                onClick={() => navigate("/register")}
                sx={{ cursor: "pointer", border: "none", background: "none", padding: 0 }}
              >
                Sign up
              </SmallLink>
            </Box>

            {/* Google / Okta buttons */}
            <Button
              variant="outlined"
              fullWidth
              sx={{ mt: 4 }}
              onClick={() =>
                (window.location.href = "http://localhost:8080/auth/oauth2/google")
              }
            >
              Continue with Google
            </Button>
            <Button
              variant="outlined"
              color="primary"
              fullWidth
              sx={{ mt: 2 }}
              onClick={() => console.log("Okta login clicked")}
            >
              Continue with Okta
            </Button>
          </FormWrapper>
        </LoginCard>
      </LoginRight>
    </LoginContainer>
  );
};

export default Login;
