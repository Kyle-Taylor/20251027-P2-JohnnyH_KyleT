// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login/Login";
import Rooms from "./pages/Rooms/Rooms";
import RoomTypes from "./pages/RoomTypes/RoomTypes";
import Register from "./pages/Register/Register";
import CreateReservation from "./pages/CreateReservation/CreateReservation";
import Dashboard from "./pages/Dashboard/Dashboard";

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
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Rooms route */}
        <Route path="/rooms" element={<Rooms />} />

        {/* Room Types route */}
        <Route path="/roomtypes" element={<RoomTypes />} />
        
        {/* Create Reservation route */}
        <Route path="/create-reservation" element={<CreateReservation />} />

        {/* Catch-all 404 */}
        <Route path="*" element={<div>Page not found</div>} />
      </Routes>
    </Router>
  );
}

export default App;
