import React, { useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AppContext } from "../../context/AppContext";
import "../../css/admin/AdminSignin.css"; // Import external CSS

const AdminSignin = () => {
    const navigate = useNavigate();
    const { backendUrl, setAdminIsLoggedin, getAdminData } = useContext(AppContext);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("admin");

    const onSubmitHandler = async (e) => {
        try {
            e.preventDefault();
    
            if (!email || !password) {
                return toast.error("Both email and password are required");
            }
    
            axios.defaults.withCredentials = true;
    
            const { data } = await axios.post(`${backendUrl}/api/admin-auth`, { email, password });
    
            if (data.success) {
                setAdminIsLoggedin(true);
                localStorage.setItem("adminToken", data.adminToken);
                await getAdminData();  // Wait for admin data before redirecting
                navigate("/dashboard");
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error("Admin sign-in error:", error?.response?.data || error.message);
            toast.error(error?.response?.data?.message || "Something went wrong. Please try again.");
        }
    };
    
    

    return (
        <div className="admin-signin-container">
            <h1 className="admin-signin-title">Admin Sign In</h1>
            <form className="admin-signin-form" onSubmit={onSubmitHandler}>
                <input
                    className="admin-signin-input"
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                    type="text"
                    placeholder="Email"
                    required
                />
                <input
                    className="admin-signin-input"
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                    type="password"
                    placeholder="Password"
                    required
                />
                <button className="admin-signin-btn" type="submit">Sign In</button>
            </form>
        </div>
    );
};

export default AdminSignin;
