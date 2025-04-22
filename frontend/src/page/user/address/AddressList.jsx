import React, { useEffect, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppContext } from "../../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../../css/AddressList.css"; // Import CSS file

const AddressList = () => {
    const navigate = useNavigate();
    const { backendUrl, userData, getUserData, getAuthState } = useContext(AppContext);
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState(""); // To store error messages

    useEffect(() => {
        const fetchData = async () => {
            try {
                await getAuthState();
                await getUserData();
            } catch (error) {
                console.error("Error during authentication or user data retrieval:", error);
                setErrorMessage("Failed to load user data.");
                toast.error("Failed to load user data.");
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (userData?.userId) {
            fetchAddresses(); // Fetch addresses when userData is available
        }
    }, [userData]);

    const fetchAddresses = async () => {
        
        if (!userData?.userId) {
            
            toast.error("User data or userId is missing!");
            setLoading(false);
            return;
        }

        try {

            const response = await axios.get(`${backendUrl}/api/addresses/${userData.userId}`, {
                withCredentials: true,
            });

            if (response.data.success) {
                setAddresses(response.data.addresses || []);
            } else {
                toast.error("Failed to fetch addresses.");
                setAddresses([]);
            }
        } catch (error) {
            console.error("Error fetching addresses:", error);
            setErrorMessage(error.response?.data?.message || "Error fetching addresses.");
            toast.error(error.response?.data?.message || "Error fetching addresses.");
            setAddresses([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (addressId) => {
        toast(
            ({ closeToast }) => (
                <div>
                    <p>Are you sure you want to delete this address?</p>
                    <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                        <button
                            style={{
                                background: "red",
                                color: "white",
                                padding: "5px 10px",
                                border: "none",
                                cursor: "pointer",
                                borderRadius: "5px",
                            }}
                            onClick={async () => {
                                closeToast(); // Close toast immediately on click
                                await confirmDelete(addressId); // Confirm delete
                            }}
                        >
                            ✔ Yes
                        </button>
                        <button
                            style={{
                                background: "gray",
                                color: "white",
                                padding: "5px 10px",
                                border: "none",
                                cursor: "pointer",
                                borderRadius: "5px",
                            }}
                            onClick={closeToast} // Close toast on cancel
                        >
                            ❌ No
                        </button>
                    </div>
                </div>
            ),
            {
                autoClose: false, // Prevent auto-closing
                closeOnClick: false,
                draggable: false,
                hideProgressBar: true,
                closeButton: false, // Remove close button
                className: "custom-toast", // Custom class for absolute centering
            }
        );
    };

    const confirmDelete = async (addressId) => {
        try {
            const response = await axios.delete(`${backendUrl}/api/address/${addressId}`, { withCredentials: true });

            if (response.data.success) {
                toast.success("Address deleted successfully.");
                setAddresses((prevAddresses) => prevAddresses.filter((address) => address._id !== addressId));
            } else {
                toast.error("Failed to delete address.");
            }
        } catch (error) {
            console.error("Error deleting address:", error);
            setErrorMessage(error.response?.data?.message || "Something went wrong.");
            toast.error(error.response?.data?.message || "Something went wrong.");
        }
    };

    const handleAddAddress = () => {
        navigate("/add-address");
    };
    const handleBack = () => {
        navigate(-1); // Navigate to the previous page
      };

    return (
        <div className="address-container">
              <div style={{display:'flex',alignItems:'center', gap:'15px'}}>
         <button onClick={handleBack} className="back-btn">← </button>
         <h1 className="address-title">Manage Addresses</h1>
         </div>
            <button className="add-btn" onClick={handleAddAddress}>➕ Add New Address</button>

            {loading ? (
                <p className="loading-text">Loading addresses...</p>
            ) : addresses.length > 0 ? (
                <ul className="address-list">
                    {addresses.map((address) => (
                        <li key={address._id} className="address-item">
                            <p className="address-name">{address.firstName} {address.lastName}</p>
                            <p className="address-info">{address.address} {address.city}, {address.state}, {address.zip}</p>
                            <p className="address-country">{address.country}</p>
                            <p className="address-phone">📞 {address.phone}</p>
                            <div className="address-actions">
                                <Link to={`/address/edit/${address._id}`}>
                                    <button className="edit-btn">✏️ Edit</button>
                                </Link>
                                <button className="delete-btn" onClick={() => handleDelete(address._id)}>🗑️ Delete</button>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="no-address-container">
                    <p className="no-address">No addresses found.</p>
                </div>
            )}

            {/* Show error message if exists */}
            {errorMessage && (
                <div className="error-message">
                    <p>{errorMessage}</p>
                </div>
            )}
        </div>
    );
};

export default AddressList;
