import React, {useState} from "react";
import {FaFacebook, FaApple} from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import OtpVerification from "./OtpVerification";

function Signup({ onOtpRequired, onVerified }) {
    const [formData, setFormData] = useState({
        name : "",
        email : "",
        role : "",
        password : "",
        confirm_password : "",
        agree : false,
    });

    const [showOtpForm, setShowOtpForm] = useState(false);
    const [message, setMessage] = useState("");
    const [email, setEmail] = useState("");

    const handleChange = (e) => {
        const {name, value, type, checked} = e.target;
        setFormData({...formData, [name]: type === "checkbox" ? checked : value});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if(formData.password !== formData.confirm_password) {
            setMessage("Password do not match");
            return;
        }

        try {
            const response = await fetch("http://127.0.0.1:8000/api/auth/signup/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    confirm_password: formData.confirm_password,
                    role: formData.role,
                }),
            });
            
            const data = await response.json();
            if (response.ok){
                setMessage("Signup successful! Please verify OTP sent to your email.");
                setEmail(formData.email); // store email to pass into OTP form
                onOtpRequired(formData.email);
            } else {
                setMessage(data.error|| data.detail || "Signup failed.Try again.");
            }
        } catch (error) {
            setMessage("Server error. PLease try again later.");
        }
    };

    if (showOtpForm) {
        return <OtpVerification email={formData.email} onVerified={onVerified} />;
    }

    return (
        <div className="form-content">
            <h3>Create an Account</h3>
            <p>Build your profile, connect with peers, and discover jobs.</p>

            <form onSubmit={handleSubmit}>
                <label>Full Name</label>
                <input 
                name="name"
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}/>

                <label>Email</label>
                <input
                name="email"
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}/>

                <label>Role</label>
                <input
                name="role"
                type="text"
                placeholder="Select role"
                value={formData.role}
                onChange={handleChange}/>

                <label>Password</label>
                <input
                name="password"
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}/>

                <label>Confirm Password</label>
                <input
                name="confirm_password"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirm_password}
                onChange={handleChange}/>

                <div className="checkbox">
                    <input
                    name="agree"
                    type="checkbox"
                    checked={formData.agree}
                    onChange={handleChange}
                    />
                    <span>I agree to the Terms and Conditions and Privacy Policy</span>
                </div>
                <button type="submit" className="btn-primary" disabled={!formData.agree}>Sign Up</button>
            </form>

            {message && <p className="message">{message}</p>}

            <div className="social-container">
                <div className="divider">
                    <hr className="line" />
                    <span className="text">Or Continue With</span>
                    <hr className="line" />
                </div>
            
                <div className="social-icons">
                    <div className="social-item">
                        <div className="icon-circle">
                            <FcGoogle size={22}/>
                        </div>
                        <p>Google</p>
                    </div>
            
                    <div className="social-item">
                        <div className="icon-circle">
                            <FaFacebook size={22} color="#1877F2"/>
                        </div>
                        <p>Facebook</p>
                    </div>
            
                    <div className="social-item">
                        <div className="icon-circle">
                            <FaApple size={22} color="#000"/>
                        </div>
                        <p>Apple ID</p>
                    </div>
                </div>
            </div>
        </div>
    );
}


export default Signup;