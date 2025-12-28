import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Login from "./pages/Login/Login";
import Rooms from "./pages/Rooms/Rooms";
import RoomTypes from "./pages/RoomTypes/RoomTypes";
import Register from "./pages/Register/Register";
import CreateReservation from "./pages/CreateReservation/CreateReservation";
import Dashboard from "./pages/Dashboard/Dashboard";
import LandingPage from "./pages/LandingPage/LandingPage";
import Profile from "./pages/Profile/Profile";
import OAuthCallback from "./pages/OAuthCallback/OAuthCallback";
import Checkout from "./pages/Checkout/Checkout";
import AddCard from "./pages/AddCard/AddCard";
import ProtectedRoute from "./components/ProtectedRoute";
import ViewUserReservations from "./pages/ViewUserReservations/ViewUserReservations";

function App() {
  const token = useSelector((state) => state.auth.token);
  let role = null;
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      role = (payload.role || "").toString().toUpperCase();
    } catch {
      role = null;
    }
  }
  return (
    <Router>
      <Routes>
        {/* Default route redirects to landing page */}
        <Route
          path="/"
          element={
            token && role === "GUEST"
              ? <Navigate to="/create-reservation" replace />
              : <LandingPage />
          }
        />

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
        <Route 
          path="/user-reservations" 
          element={
            <ProtectedRoute requiredRole={["GUEST", "ADMIN", "MANAGER"]}>
              <ViewUserReservations />
            </ProtectedRoute>
          } 
        />

        <Route
          path="/user-reservations"
          element={
            <ProtectedRoute requiredRole={["GUEST", "ADMIN", "MANAGER"]}>
              <ViewUserReservations />
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

        <Route 
          path="/pay/:reservationId" 
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />

        <Route 
          path="/pay/add-card" 
          element={
            <ProtectedRoute>
              <AddCard />
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
