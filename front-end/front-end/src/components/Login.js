import React, { useState } from "react";
import { FaFacebook, FaApple } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://127.0.0.1:8000/api/auth/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json(); // read only once

      if (response.ok) {
        // store tokens if present
        if (data.access) localStorage.setItem("accessToken", data.access);
        if (data.refresh) localStorage.setItem("refreshToken", data.refresh);
        if (data.role) localStorage.setItem("role", data.role);

        // call parent callback with data
        if (onLoginSuccess) onLoginSuccess(data);
      } else {
        setError(data.detail || "Invalid email or password");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="form-content">
      <h3>Welcome Back!</h3>
      <p>Log in to your account to connect with professionals and explore opportunities.</p>

      <form onSubmit={handleSubmit}>
        <label>Email</label>
        <input type="email" placeholder="Email" value={email}
               onChange={(e) => setEmail(e.target.value)} required />

        <label>Password</label>
        <input type="password" placeholder="Password" value={password}
               onChange={(e) => setPassword(e.target.value)} required />

        {error && <p style={{ color: "red" }}>{error}</p>}

        <a href="http://127.0.0.1:8000/api/auth/forgot-password/" className="forgot">Forgot Password?</a>

        <button type="submit" className="btn-primary">Login</button>
      </form>

      {/* social UI unchanged */}
      <div className="social-container">
        <div className="divider">
          <hr className="line" />
          <span className="text">Or Continue With</span>
          <hr className="line" />
        </div>

        <div className="social-icons">
          <div className="social-item">
            <div className="icon-circle"><FcGoogle size={22} /></div>
            <p>Google</p>
          </div>
          <div className="social-item">
            <div className="icon-circle"><FaFacebook size={22} color="#1877F2" /></div>
            <p>Facebook</p>
          </div>
          <div className="social-item">
            <div className="icon-circle"><FaApple size={22} color="#000" /></div>
            <p>Apple ID</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
