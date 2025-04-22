import React, { useState, useContext } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../../../context/AppContext";
import { z } from "zod";
import "../../../css/NewPassword.css";

// Password validation schema using Zod
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .regex(/[A-Z]/, "Password must include at least one uppercase letter")
  .regex(/[a-z]/, "Password must include at least one lowercase letter")
  .regex(/[0-9]/, "Password must include at least one number");
// .regex(/[@$!%*?&]/, "Password must include at least one special character (@$!%*?&)"); // Uncomment if needed

const NewPassword = () => {
  const { email } = useParams(); // Retrieve email from URL parameters
  const { backendUrl } = useContext(AppContext);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setPasswordError(""); // Reset errors
    setConfirmPasswordError("");

    // Validate new password
    try {
      passwordSchema.parse(newPassword);
    } catch (error) {
      setPasswordError(error.errors[0].message);
      return;
    }

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${backendUrl}/api/auth/reset-password`, {
        newPassword,
        email,
      });

      if (response.data.success) {
        navigate("/signin"); // Redirect to login page
      } else {
        setPasswordError(response.data.message || "Failed to create a new password.");
      }
    } catch (error) {
      setPasswordError(error.response?.data?.message || "An error occurred while resetting the password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="new-password-container">
      <h2 className="new-password-title">Create New Password</h2>
      <form className="new-password-form" onSubmit={handleSubmit}>
        <div>
          <input
            type="password"
            id="newPassword"
            className="new-password-input"
            value={newPassword}
            placeholder="New Password"
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          {passwordError && <p className="error">{passwordError}</p>}
        </div>

        <div>
          <input
            type="password"
            id="confirmPassword"
            className="new-password-input"
            value={confirmPassword}
            placeholder="Confirm Password"
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          {confirmPasswordError && <p className="error">{confirmPasswordError}</p>}
        </div>

        <button className="new-password-btn" type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Password"}
        </button>
      </form>
    </div>
  );
};

export default NewPassword;
