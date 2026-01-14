import React, { useState } from 'react';
import Login from "./components/Login";
import Signup from "./components/SignUp";
import OtpVerification from './components/OtpVerification';
import Profile from './components/Profile';
import './components/Auth.css';

function App() {
  const [activeTab, setActiveTab] = useState("login");
  const [otpEmail, setOtpEmail] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("accessToken")
  );

  // Handle signup → move to OTP
  const handleOtpVerification = (email) => {
    setOtpEmail(email);
  };

  // Handle OTP success → go back to login tab
  const handleOtpVerified = () => {
    setOtpEmail(null);
    setActiveTab("login");
  };

  // After login success → store token and show profile
  const handleLoginSuccess = (data) => {
    localStorage.setItem("accessToken", data.access);
    setIsLoggedIn(true);
  };

  // Logout handler for profile page
  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    setIsLoggedIn(false);
  };

  // ✅ If logged in → show Jobseeker Profile page
  if (isLoggedIn) {
    return <Profile onLogout={handleLogout} />;
  }

  return (
    <div className='auth-container'>
      <div className='auth-card'>
        <h2 className='logo'>CareerConnect</h2>

        {/* Hide tabs when OTP form is active */}
        {!otpEmail && (
          <div className='tabs'>
            <button
              className={activeTab === "login" ? "active" : ""}
              onClick={() => setActiveTab("login")}
            >
              Login
            </button>
            <button
              className={activeTab === "signup" ? "active" : ""}
              onClick={() => setActiveTab("signup")}
            >
              Sign Up
            </button>
          </div>
        )}

        {/* Conditional Rendering */}
        {otpEmail ? (
          <OtpVerification email={otpEmail} onVerified={handleOtpVerified} />
        ) : activeTab === "login" ? (
          <Login onLoginSuccess={handleLoginSuccess} />
        ) : (
          <Signup onOtpRequired={handleOtpVerification} />
        )}
      </div>
    </div>
  );
}

export default App;
