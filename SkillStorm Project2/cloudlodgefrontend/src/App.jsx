import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login/Login";
import Rooms from "./pages/Rooms/Rooms";
import RoomTypes from "./pages/RoomTypes/RoomTypes";
import Register from "./pages/Register/Register";
import CreateReservation from "./pages/CreateReservation/CreateReservation";
import Dashboard from "./pages/Dashboard/Dashboard";
import LandingPage from "./pages/LandingPage/LandingPage";
import Profile from "./pages/Profile/Profile";
import OAuthCallback from "./pages/OAuthCallback/OAuthCallback";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        {/* Default route redirects to landing page */}
        <Route path="/" element={<LandingPage />} />

        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes */}
        <Route 
          path="/rooms" 
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <Rooms />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/roomtypes" 
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <RoomTypes />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />

        {/* Protected dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <Dashboard />
            </ProtectedRoute>
          }
        />
        
        {/* Create Reservation route */}
        <Route 
          path="/create-reservation" 
          element={
            <ProtectedRoute requiredRole={["GUEST", "ADMIN", "MANAGER"]}>
              <CreateReservation />
            </ProtectedRoute>
          } 
        />

        {/* OAuth callback */}
        <Route path="/oauth/callback" element={<OAuthCallback />} />

        {/* Catch-all 404 */}
        <Route path="*" element={<div>Page not found</div>} />
      </Routes>
    </Router>
  );
}

export default App;
