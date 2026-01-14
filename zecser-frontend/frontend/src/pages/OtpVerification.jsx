import React, { useState } from "react";

export default function OtpVerification({ email, onVerified }) {
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
        body: JSON.stringify({ email, otp }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage("✅ OTP verified successfully!");
        setTimeout(() => onVerified(), 1500);
      } else {
        setMessage(data.error || "Verification failed");
      }
    } catch {
      setMessage("Network error");
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
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (response.ok) setMessage(`📩 New OTP sent to ${email}`);
      else setMessage(data.error || "Failed to resend OTP");
    } catch {
      setMessage("Network error");
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white p-8 rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-2">OTP Verification</h2>
      <p className="text-center text-gray-500 mb-6">
        Enter the OTP sent to <strong>{email}</strong>
      </p>

      <form onSubmit={handleVerify} className="space-y-4">
        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Enter OTP"
          className="w-full p-2 border rounded-lg focus:ring focus:ring-blue-200"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
      </form>

      <button
        onClick={handleResend}
        disabled={loading}
        className="w-full mt-4 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200"
      >
        Resend OTP
      </button>

      {message && (
        <p className="text-center text-sm text-gray-700 mt-3">{message}</p>
      )}
    </div>
  );
}
