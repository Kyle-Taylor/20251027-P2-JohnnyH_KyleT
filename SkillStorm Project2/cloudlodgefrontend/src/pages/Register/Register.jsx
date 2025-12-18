import React, { useState } from "react";
import { TextField, Button, Box, MenuItem, Select, InputLabel, FormControl } from "@mui/material";
import { useNavigate } from "react-router-dom";

import {
  RegisterContainer,
  RegisterLeft,
  RegisterTitle,
  RegisterSubtitle,
  RegisterRight,
  RegisterCard,
  FormTitle,
  FormWrapper,
  SmallLink,
  SmallText
} from "./register.styles";

const Register = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("GUEST"); // default role
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          role,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Registration failed");
        return;
      }

      console.log("Registration successful:", data);
      navigate("/login");

    } catch (err) {
      console.error(err);
      setError("Error connecting to backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <RegisterContainer>
      {/* LEFT PANEL */}
      <RegisterLeft>
        <RegisterTitle>CloudLodge</RegisterTitle>
        <RegisterSubtitle>Create your account to get started.</RegisterSubtitle>
      </RegisterLeft>

      {/* RIGHT PANEL */}
      <RegisterRight>
        <RegisterCard elevation={6}>
          <FormTitle>Register</FormTitle>

          <FormWrapper>
            <Box component="form" onSubmit={handleRegister}>
              <TextField
                label="Full Name"
                variant="outlined"
                fullWidth
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                sx={{ mb: 2 }}
              />
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
                label="Phone (optional)"
                variant="outlined"
                fullWidth
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                sx={{ mb: 2 }}
              />
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="role-label">Role</InputLabel>
                <Select
                  labelId="role-label"
                  value={role}
                  label="Role"
                  onChange={(e) => setRole(e.target.value)}
                >
                  <MenuItem value="GUEST">GUEST</MenuItem>
                  <MenuItem value="ADMIN">ADMIN</MenuItem>
                  <MenuItem value="MANAGER">MANAGER</MenuItem>
                </Select>
              </FormControl>
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
              <TextField
                label="Confirm Password"
                variant="outlined"
                type="password"
                fullWidth
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
                {loading ? "Creating account..." : "Register"}
              </Button>
            </Box>

            <Box textAlign="center" mt={3}>
              <SmallText>Already have an account?</SmallText>{" "}
              <SmallLink href="/login">Login</SmallLink>
            </Box>
          </FormWrapper>
        </RegisterCard>
      </RegisterRight>
    </RegisterContainer>
  );
};

export default Register;
