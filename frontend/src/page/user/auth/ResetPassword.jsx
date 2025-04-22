import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import '../../../css/ResetPassword.css';

const ResetPassword = () => {
  const { email } = useParams(); // Retrieve email from URL parameters
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!email) {
      toast.error("Invalid email. Please try again.");
      navigate("/send-reset-otp"); // Redirect back to OTP request page
    }
  }, [email, navigate]);

  const handleResetPassword = async (e) => {
    e.preventDefault();

    // Validate passwords
    if (!newPassword || !confirmPassword) {
      toast.error("Both fields are required.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`/api/auth/reset-password`, {
        email,
        newPassword,
      });

      if (response.data.success) {
        toast.success("Password has been reset successfully!");
        navigate("/login"); // Redirect to login page
      } else {
        toast.error(response.data.message || "Failed to reset password");
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      toast.error("Error resetting password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-password-container">
      <h2 className="reset-title">Reset Your Password</h2>
      <form onSubmit={handleResetPassword} className="reset-form">
        <div className="input-group">
          <label htmlFor="newPassword">New Password</label>
          <input
            type="password"
            id="newPassword"
            className="input-field"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            className="input-field"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="reset-btn" disabled={loading}>
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
