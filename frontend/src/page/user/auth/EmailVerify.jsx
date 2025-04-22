import axios from 'axios';
import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from "../../../context/AppContext";
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../../../css/EmailVerify.css';

const EmailVerify = () => {
    const { backendUrl } = useContext(AppContext);
    const navigate = useNavigate();
    const location = useLocation();

    // Extracting query parameters
    const params = new URLSearchParams(location.search);
    const email = params.get("email");
    const name = params.get("name");
    const phone = params.get("phone");
    const password = params.get("password");

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!email || !name || !phone || !password) {
            toast.error("Missing user details. Please register again.");
            navigate("/register"); // Redirect user back to registration if missing details
        }
    }, [email, name, phone, password, navigate]);

    const sendOtp = async () => {
        setLoading(true);
        try {
            axios.defaults.withCredentials = true; // Ensure session persists
    
            const { data } = await axios.post(
                `${backendUrl}/api/auth/send-verify-otp`, 
                { email, name, phone, password },
                { withCredentials: true }
            );
    
            if (data.success) {
                toast.success('Welcome! Check your email for verification.');
    
                // Navigate to OTP verification page securely
                navigate(`/verify-otp?email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}&phone=${encodeURIComponent(phone)}`);
            } else {
                toast.error(data.message || 'Failed to send OTP.');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'An error occurred while sending OTP.');
        } finally {
            setLoading(false);
        }
    };
    
    
    

    return (
        <div className="email-verify-container">
            <h1 className="email-verify-title">Email Verification</h1>
            <div className="email-verify-form">
                <input className='email-input' type="text" readOnly  value={email} />
                <button className="verify-btn" onClick={sendOtp} disabled={loading}>
                    {loading ? 'Sending...' : 'Send OTP'}
                </button>
            </div>
        </div>
    );
};

export default EmailVerify;
