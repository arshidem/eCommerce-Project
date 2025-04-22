import React, { useState, useContext, useRef, useEffect } from 'react';
import axios from 'axios';
import { AppContext } from '../../../context/AppContext';
import { toast } from 'react-toastify';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../../css/EnterOtp.css';

const EnterOtp = () => {
    const { backendUrl, setLoggedin, setToken, getUserData } = useContext(AppContext);
    const [otp, setOtp] = useState(Array(6).fill(''));
    const [loading, setLoading] = useState(false);
    const inputRefs = useRef([]);
    const navigate = useNavigate();
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const email = params.get("email");

    useEffect(() => {
        inputRefs.current[0]?.focus(); // Auto-focus the first input field
    }, []);

    const handleChange = (index, value) => {
        if (!/^\d?$/.test(value)) return; // Allow only numbers

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6).split('');
        setOtp((prevOtp) => prevOtp.map((_, i) => pasteData[i] || ''));
        inputRefs.current[Math.min(pasteData.length, 5)]?.focus();
    };

    const submitOtp = async () => {
        if (!email) {
            toast.error("Email is missing. Please try again.");
            return;
        }

        if (otp.some((digit) => digit === '')) {
            toast.error("Please enter all 6 OTP digits.");
            return;
        }

        setLoading(true);
        try {
            axios.defaults.withCredentials = true;

            const { data } = await axios.post(
                `${backendUrl}/api/auth/account`,
                { email, otp: otp.join("") },
                { withCredentials: true }
            );

            if (data.success) {
                setLoggedin(true);
                setToken(data.token);
                localStorage.setItem('userToken', data.token);
                await getUserData();
                navigate('/');
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error("OTP Verification Error:", error.response?.data || error);
            toast.error(error.response?.data?.message || "An error occurred while verifying OTP.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="enter-reset-otp-container">
            <h1 className="enter-reset-otp-title">Enter Your OTP</h1>
            <div className="enter-reset-otp-form">
                <div className="otp-input-group" onPaste={handlePaste}>
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            ref={(el) => (inputRefs.current[index] = el)}
                            type="text"
                            className="enter-reset-otp-input"
                            maxLength="1"
                            value={digit}
                            onChange={(e) => handleChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            aria-label={`OTP digit ${index + 1}`}
                        />
                    ))}
                </div>
                <button className="enter-reset-otp-btn" onClick={submitOtp} disabled={loading}>
                    {loading ? 'Verifying...' : 'Submit OTP'}
                </button>
            </div>
        </div>
    );
};

export default EnterOtp;
