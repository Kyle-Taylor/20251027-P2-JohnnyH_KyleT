import React, { useState } from "react";
import { Box, Button, TextField } from "@mui/material";

// Import styled components
import {
  LoginContainer,
  LoginLeft,
  LoginTitle,
  LoginSubtitle,
  LoginRight,
  FormTitle,
  SmallLink,
  SmallText
} from "./login.styles";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // TEMP placeholder login handler
  const handleLogin = (e) => {
    e.preventDefault();
    console.log("Logging in with:", username, password);
    // Later this will call your Auth API
  };

  return (
    <LoginContainer>
      {/* LEFT PANEL (Branding) */}
      <LoginLeft>
        <LoginTitle>CloudLodge</LoginTitle>
        <LoginSubtitle>Welcome back. Sign in to continue.</LoginSubtitle>
      </LoginLeft>

      {/* RIGHT PANEL (Form) */}
      <LoginRight elevation={6}>
        <FormTitle>Sign In</FormTitle>

        {/* FORM */}
        <Box
          component="form"
          onSubmit={handleLogin}
          sx={{ width: "100%", mt: 2 }}
        >
          <TextField
            label="Email or Username"
            variant="outlined"
            fullWidth
            required
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <TextField
            label="Password"
            variant="outlined"
            type="password"
            fullWidth
            required
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 3, py: 1.2, fontSize: "1rem" }}
          >
            Login
          </Button>
        </Box>

        {/* FORGOT PASSWORD & SIGN UP */}
        <Box mt={3} textAlign="center">
          <SmallLink href="#">Forgot password?</SmallLink>
          <br /><br />
          <SmallText>Don’t have an account?</SmallText>{" "}
          <SmallLink href="#">Sign up</SmallLink>
        </Box>

        {/* GOOGLE OAUTH */}
        <Button
          variant="outlined"
          fullWidth
          sx={{ mt: 4, py: 1.2 }}
          onClick={() => {
            window.location.href = "/api/auth/oauth2/google"; 
          }}
        >
          Continue with Google
        </Button>

        {/* Okta Button Placeholder */}
        <Button
          variant="outlined"
          color="primary"
          fullWidth
          sx={{
            textTransform: "none",
            fontWeight: 600,
            py: 1.2,
            borderRadius: 1.5,
          }}
          onClick={() => console.log("Okta login clicked (placeholder)")}
        >
          Sign in with Okta
        </Button>
      </LoginRight>

    </LoginContainer>
  );
};

export default Login;
