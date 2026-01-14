import React, { useEffect, useState } from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import OtpVerification from "./pages/OtpVerification";
import ForgotPassword from "./pages/ForgotPassword";
import UserProfile from "./pages/UserProfile";
import CompanyProfile from "./pages/CompanyProfile";
import EmployerProfile from "./pages/EmployerProfile";
import Jobs from "./pages/Jobs"; 
import "./App.css";

export default function App() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showJobsPage, setShowJobsPage] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (token) setIsLoggedIn(true);
  }, []);

  const decodeJwt = (jwt) => {
    try {
      const payload = jwt.split(".")[1];
      const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
      return JSON.parse(decodeURIComponent(escape(json)));
    } catch {
      return null;
    }
  };

  const handleLoginSuccess = (data) => {
    const access = data?.access;
    const refresh = data?.refresh;
    let role = data?.role;

    if (access) {
      localStorage.setItem("access", access);
      if (!role) {
        const payload = decodeJwt(access);
        role = payload?.role;
      }
      if (role) localStorage.setItem("role", role);
    }

    if (refresh) localStorage.setItem("refresh", refresh);

    setIsLoggedIn(true);

    // Redirect based on role
    if (role === "company") navigate("/company");
    else if (role === "jobseeker") navigate("/profile");
    else if (role === "employer") navigate("/employer");
    else navigate("/login");
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    navigate("/login");
  };

  const handleShowJobsPage = () => {
    setShowJobsPage(true);
  };

  const handleCloseJobsPage = () => {
    setShowJobsPage(false);
  };

  // if user navigates to global Jobs page
  if (isLoggedIn && showJobsPage) {
    return <Jobs onClose={handleCloseJobsPage} />;
  }

  const role = localStorage.getItem("role");

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/otp" element={<OtpVerification />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Protected routes */}
      <Route
        path="/profile"
        element={
          isLoggedIn && role === "jobseeker" ? (
            <UserProfile onLogout={handleLogout} onShowJobsPage={handleShowJobsPage}/>
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/company"
        element={
          isLoggedIn && role === "company" ? (
            <CompanyProfile onLogout={handleLogout} onShowJobsPage={handleShowJobsPage}/>
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/employer"
        element={
          isLoggedIn && role === "employer" ? (
            <EmployerProfile onLogout={handleLogout} onShowJobsPage={handleShowJobsPage}/>
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/jobs" element={<Jobs />}
      />
      

      {/* Default route */}
      <Route path="*" element={<Navigate to="/login" />} />

    </Routes>
  );
}
