import React, { useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../../context/AppContext";
import { toast } from "react-toastify";
import "../../../css/SendResetOtp.css";

const SendResetOtp = () => {
  const { backendUrl } = useContext(AppContext);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${backendUrl}/api/auth/send-reset-otp`, { email });

      if (response.data.success) {
        toast.success("OTP sent to your email. Check your inbox!");
        navigate(`/verify-reset-otp/${email}`);
      } else {
        toast.error(response.data.message || "Failed to send OTP");
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast.error("Error sending OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="send-reset-otp-container">
      <h2 className="send-reset-otp-title">Reset Password</h2>
      <form className="send-reset-otp-form" onSubmit={handleSendOtp}>
        <div>
          <input
            type="email"
            className="send-reset-otp-input"
            value={email}
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button className="send-reset-otp-btn" type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send OTP"}
        </button>
      </form>
    </div>
  );
};

export default SendResetOtp;
