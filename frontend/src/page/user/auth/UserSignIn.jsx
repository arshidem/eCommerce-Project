import React, { useState, useContext } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { AppContext } from "../../../context/AppContext";
import { toast } from "react-toastify";
import "../../../css/UserSignIn.css"; // Import external CSS
import fashion from '../../../assets/images/sign/fashion.jpg'

const UserSignIn = () => {
    const navigate = useNavigate();
    const { backendUrl, setLoggedin, getUserData, setToken } = useContext(AppContext);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const onSubmitUserSignIn = async (e) => {
        e.preventDefault();
    
        try {
            if (!email || !password) {
                return toast.error("Both email and password are required");
            }
    
            const { data } = await axios.post(`${backendUrl}/api/auth/signin`, { email, password },{ withCredentials: true });
    
            if (data.success) {
                setLoggedin(true);
                setToken(data.token);
                localStorage.setItem('userToken', data.token); // Ensure consistent key
                axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
                await getUserData();  // Wait for user data
                navigate('/');  // Redirect after user data is loaded
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error("User Sign-in error:", error?.response?.data || error.message);
            toast.error(error?.response?.data?.message || "Something went wrong. Please try again.");
        }
    };
    
    

    return (
        <div className="whole-container">
            <div className="image-container">
                <img className="img3" src={fashion} alt="fashion" />
            </div>

            <div className="signin-container">
                <h1 className="signin-title">Sign In</h1>
                <form className="signin-form" onSubmit={onSubmitUserSignIn}>
                    <input
                        onChange={(e) => setEmail(e.target.value)}
                        value={email}
                        type="text"
                        placeholder="Email"
                        required
                        className="signin-input"
                    />
                    <input
                        onChange={(e) => setPassword(e.target.value)}
                        value={password}
                        type="password"
                        placeholder="Password"
                        required
                        className="signin-input"
                    />
                    <button type="submit" className="signin-button">Sign In</button>
                </form>

                <p className="signin-links">
                    Forgot Password? <Link to="/reset-password" className="signin-link">Click here</Link>
                </p>
                <p className="signin-links">
                    Don't have an account? <Link to="/register" className="signin-link">Register</Link>
                </p>
            </div>
        </div>
    );
};

export default UserSignIn;
