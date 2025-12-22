import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login/Login";
import Rooms from "./pages/Rooms/Rooms";
import RoomTypes from "./pages/RoomTypes/RoomTypes";
import Register from "./pages/Register/Register";
import Profile from "./pages/Profile/Profile";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        {/* Default route redirects to login */}
        <Route path="/" element={<Navigate to="/login" />} />

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
              <div>Dashboard (coming soon)</div>
            </ProtectedRoute>
          }
        />


        {/* Catch-all 404 */}
        <Route path="*" element={<div>Page not found</div>} />
      </Routes>
    </Router>
  );
}

export default App;
