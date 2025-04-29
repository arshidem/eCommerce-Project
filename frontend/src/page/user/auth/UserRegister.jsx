import React, { useContext, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { AppContext } from "../../../context/AppContext";
import { toast } from "react-toastify";
import { z } from "zod";
import "../../../css/UserRegister.css";
import fashion from "../../../assets/images/sign/fashion.jpg";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .regex(/[A-Z]/, "Password must include at least one uppercase letter")
  .regex(/[a-z]/, "Password must include at least one lowercase letter")
  .regex(/[0-9]/, "Password must include at least one number");

const mobileSchema = z
  .string()
  .length(10, "Mobile number must be exactly 10 digits")
  .regex(/^\d{10}$/, "Mobile number must contain only digits");

const UserRegister = () => {
  const navigate = useNavigate();
  const { backendUrl } = useContext(AppContext);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [loading, setLoading] = useState(false);
  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
        mobileSchema.parse(phone);
        setPhoneError("");
    } catch (error) {
        setPhoneError(error.errors[0].message);
        return;
    }

    try {
        passwordSchema.parse(password);
        setPasswordError("");
    } catch (error) {
        setPasswordError(error.errors[0].message);
        return;
    }

    setLoading(true);
    try {
        axios.defaults.withCredentials = true;
        const { data } = await axios.post(`${backendUrl}/api/auth/register`, {
            name,
            phone,
            email,
            password
        });

        if (data.success) {
            toast.success("Proceed to email verification.");

            // Navigate with all details in params
            navigate(`/verify-email?name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&phone=${encodeURIComponent(phone)}&password=${encodeURIComponent(password)}`);
        } else {
            toast.error(data.message);
        }
    } catch (error) {
        toast.error(error?.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
        setLoading(false);
    }
};



  return (
    <div className="whole-container">
      <div className="image-container">
       
        <img className="img3" src={fashion} alt="fashion" />
      </div>
      <div className="register-container">
        <h1 className="register-title">Register</h1>
        <form className="register-form" onSubmit={onSubmitHandler}>
          <input
            onChange={(e) => setName(e.target.value)}
            value={name}
            type="text"
            placeholder="Full Name"
            required
            className="register-input"
          />
          <input
            onChange={(e) => setPhone(e.target.value)}
            value={phone}
            type="text"
            placeholder="Phone Number"
            required
            className="register-input"
          />
          <input
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            type="text"
            placeholder="Email"
            required
            className="register-input"
          />
          <input
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            type="password"
            placeholder="Password"
            required
            className="register-input"
          />
          {phoneError && <p className="error">{phoneError}</p>}
          {passwordError && <p className="error">{passwordError}</p>}
          <button type="submit" className="register-button" disabled={loading}>
            {loading ? "Processing..." : "Register"}
          </button>
        </form>
        <p className="register-links">
          Already have an account? <Link to="/signin" className="register-link">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default UserRegister;
