import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const ChangePassword = ({ onBack, token: tokenProp }) => {
  const [passwords, setPasswords] = useState({
    old_password: "",
    new_password: "",
    confirm_password: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswords(prev => ({
      ...prev,
      [name]: value
    }));
  };


   // normalize token helper
  const resolveToken = (candidate) => {
    let t = candidate ||
      localStorage.getItem("access") ||
      localStorage.getItem("accessToken") ||
      localStorage.getItem("access_token") ||
      null;
    if (!t) return null;
    try {
      const s = t.trim();
      if (s === "[object Object]") {
        t = localStorage.getItem("accessToken") || null;
      } else if (s.startsWith("{")) {
        const parsed = JSON.parse(s);
        t = parsed?.access || parsed?.accessToken || parsed?.token || null;
      } else {
        t = s;
      }
    } catch {
      // ignore
    }
    if (!t) return null;
    return t.replace(/^Bearer\s+/i, "").trim();
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      // Get token from localStorage
      const raw = resolveToken(tokenProp);
      if (!raw) {
        setError("Not authenticated. Please log in again.");
        setLoading(false);
        return;
      }

      const res = await fetch("http://127.0.0.1:8000/api/auth/change-password/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${raw}`,
        },
        body: JSON.stringify(passwords)
      });

      const data = await res.json().catch( () => ({}));

      if (res.ok) {
        setMessage(data.message || "Password changed successfully!");
        // Clear form
        setPasswords({
          old_password: "",
          new_password: "",
          confirm_password: ""
        });
        // Return to profile after 2 seconds
        setTimeout(() => onBack && onBack(), 2000);
      } else {
        if (res.status === 401) {
          setError("Session expired. Please log in again.");}
        else{
        setError(data.error || "Failed to change password");
      }
    }
    } catch (err) {
      console.error("Change password error:", err);
      setError("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-2">
      <div className="w-full sm:w-11/12 md:w-3/4 lg:w-2/3 xl:w-1/2 bg-white rounded-3xl shadow-lg overflow-hidden p-8">
        <button
          onClick={onBack}
          className="text-blue-600 hover:text-blue-700 mb-6 flex items-center gap-2"
        >
         ← Back to Profile
        </button>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Change Your Password
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Password
            </label>
            <input
              type="password"
              name="old_password"
              value={passwords.old_password}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              name="new_password"
              value={passwords.new_password}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              name="confirm_password"
              value={passwords.confirm_password}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Changing Password..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;