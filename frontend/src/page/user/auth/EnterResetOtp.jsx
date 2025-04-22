import React, { useState, useContext, useRef } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../../../context/AppContext";
import { toast } from "react-toastify";
import "../../../css/EnterResetOtp.css";

const EnterResetOtp = () => {
  const { backendUrl } = useContext(AppContext);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { email } = useParams(); // Get email from URL params
  const inputRefs = useRef([]);

  const handleChange = (index, value) => {
    if (isNaN(value)) return; // Ensure only numbers are entered
    let newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1); // Only store the last digit
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1].focus(); // Move to next input
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus(); // Move to previous input on Backspace
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const finalOtp = otp.join(""); // Combine OTP digits into a string

    if (finalOtp.length < 6) {
      toast.error("Please enter all 6 digits.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${backendUrl}/api/auth/verify-reset-otp`, {
        email,
        otp: finalOtp,
      });

      if (response.data.success) {
        toast.success("OTP verified successfully. You can now reset your password!");
        navigate(`/new/password/${email}`); // Redirect to password reset page
      } else {
        toast.error(response.data.message || "Invalid OTP");
      }
    } catch (error) {
      toast.error("Error verifying OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="enter-reset-otp-container">
      <h2 className="enter-reset-otp-title">Enter OTP</h2>
      <form className="enter-reset-otp-form" onSubmit={handleVerifyOtp}>
        <div className="otp-input-group">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              className="enter-reset-otp-input"
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              maxLength="1"
              required
            />
          ))}
        </div>
        <button className="enter-reset-otp-btn" type="submit" disabled={loading}>
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
      </form>
    </div>
  );
};

export default EnterResetOtp;
