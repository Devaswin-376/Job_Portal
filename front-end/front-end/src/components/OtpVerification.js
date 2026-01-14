// OtpVerification.js
import React, { useState } from "react";

function OtpVerification({ email, onVerified }) {
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/api/auth/verify-otp/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }), // ✅ send email + otp
      });
      const data = await response.json();
      if (response.ok) {
        setMessage(" OTP verified successfully!");
        setTimeout(() => onVerified(), 1500);
      } else {
        setMessage(data.error || " Verification failed");
      }
    } catch (err) {
      setMessage(" Network error");
    }
    setLoading(false);
  };

  const handleResend = async () => {
    setMessage("");
    setLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/api/auth/resend-otp/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }), //  send email only
      });
      const data = await response.json();
      if (response.ok) {
        setMessage(` New OTP sent to ${email}`);
      } else {
        setMessage(data.error || " Failed to resend OTP");
      }
    } catch (err) {
      setMessage(" Network error");
    }
    setLoading(false);
  };

  return (
    <div className="auth-card-otp">
      <h3>OTP Verification</h3>
      <p>Enter the OTP sent to <strong>{email}</strong></p>

      <form onSubmit={handleVerify}>
        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
        />
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
      </form>

      <button type = "button" onClick={handleResend} className="btn-secondary resend-btn">
        Resend OTP
      </button>

      {message && <p style={{ marginTop: "10px", color: "#555" , textAlign: "center"}}>{message}</p>}
    </div>
  );
}

export default OtpVerification;
