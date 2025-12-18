// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login/Login";
import Rooms from "./pages/Rooms/Rooms";
import RoomTypes from "./pages/RoomTypes/RoomTypes";
import Register from "./pages/Register/Register";

function App() {
  return (
    <Router>
      <Routes>
        {/* Default route redirects to login */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Login route */}
        <Route path="/login" element={<Login />} />

        {/* Register route */}
        <Route path="/register" element={<Register />} />

        {/* Placeholder dashboard route */}
        <Route path="/dashboard" element={<div>Dashboard (coming soon)</div>} />

        {/* Rooms route */}
        <Route path="/rooms" element={<Rooms />} />

        {/* Room Types route */}
        <Route path="/roomtypes" element={<RoomTypes />} />
              
        {/* Catch-all 404 */}
        <Route path="*" element={<div>Page not found</div>} />
      </Routes>
    </Router>
  );
}

export default App;
