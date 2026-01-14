import React, { useState } from "react";
import { FaFacebook, FaApple } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import OtpVerification from "./OtpVerification";

export default function Signup({ onOtpRequired }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    password: "",
    confirm_password: "",
    agree: false,
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirm_password) {
      setMessage("Passwords do not match");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/api/auth/signup/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          confirm_password: formData.confirm_password,
          role: formData.role,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("Signup successful! Check your email for OTP.");
        onOtpRequired(formData.email);
      } else {
        setMessage(data.error || data.detail || "Signup failed. Try again.");
      }
    } catch {
      setMessage("Server error. Please try again later.");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white p-8 rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-2">Create an Account</h2>
      <p className="text-center text-gray-500 mb-6">
        Build your profile and discover jobs.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {["name", "email", "role", "password", "confirm_password"].map((field) => (
          <div key={field}>
            <label className="block text-sm font-medium capitalize">
              {field.replace("_", " ")}
            </label>
            <input
              name={field}
              type={
                field.includes("password")
                  ? "password"
                  : field === "email"
                  ? "email"
                  : "text"
              }
              value={formData[field]}
              onChange={handleChange}
              placeholder={`Enter ${field.replace("_", " ")}`}
              className="w-full mt-1 p-2 border rounded-lg focus:ring focus:ring-blue-200"
              required
            />
          </div>
        ))}

        <label className="flex items-center space-x-2 text-sm">
          <input
            type="checkbox"
            name="agree"
            checked={formData.agree}
            onChange={handleChange}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded"
          />
          <span>I agree to the Terms and Privacy Policy</span>
        </label>

        <button
          type="submit"
          disabled={!formData.agree}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          Sign Up
        </button>
      </form>

      {message && (
        <p className="text-center text-sm text-gray-700 mt-3">{message}</p>
      )}

      <div className="flex items-center my-6">
        <hr className="flex-1 border-gray-300" />
        <span className="px-3 text-gray-500 text-sm">Or continue with</span>
        <hr className="flex-1 border-gray-300" />
      </div>

      <div className="flex justify-center space-x-6">
        <FcGoogle size={28} className="cursor-pointer" />
        <FaFacebook size={28} color="#1877F2" className="cursor-pointer" />
        <FaApple size={28} className="cursor-pointer" />
      </div>
    </div>
  );
}
