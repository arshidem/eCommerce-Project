import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "../../../css/AddAddress.css"; // Import CSS file

const AddAddress = () => {
    const { backendUrl, userData, getAuthState, getUserData } = useContext(AppContext);
    const navigate = useNavigate();

    useEffect(() => {
        getAuthState();
        getUserData();
    }, []);

    const [address, setAddress] = useState({
        firstName: '',
        lastName: '',
        houseNo: '',
        city: '',
        state: '',
        pin: '',
        phone: '',
        isDefault: false,
    });

    const handleInputChange = (e) => {
        setAddress({ ...address, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!userData || !userData.userId) {
            toast.error('User data not available!');
            return;
        }

        const addressWithUserId = {
            userId: userData.userId,
            firstName: address.firstName,
            lastName: address.lastName,
            houseNo: address.houseNo,
            city: address.city,
            state: address.state,
            pin: address.pin,
            phone: address.phone,
            isDefault: address.isDefault || false,
        };

        try {
            const response = await axios.post(`${backendUrl}/api/addresses`, addressWithUserId, {
                withCredentials: true,
            });

            if (response.data.success) {
                toast.success('Address added successfully!');
                navigate('/address');
            } else {
                toast.error(response.data.message || 'Failed to add address');
            }
        } catch (error) {
            console.error('Error adding address:', error.response || error.message);
            toast.error(error.response?.data?.message || 'Error adding address');
        }
    };
    const handleBack = () => {
        navigate(-1); // Navigate to the previous page
      };

    return (
        <div className="add-address-container">
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <button onClick={handleBack} className="back-btn">←</button>
        </div>
            <h1 className="add-address-title">Add Address</h1>
            <form className="add-address-form" onSubmit={handleSubmit}>
                <div className="input-group">
                    <input type="text" name="firstName" placeholder="First Name" value={address.firstName} onChange={handleInputChange} required />
                    <input type="text" name="lastName" placeholder="Last Name" value={address.lastName} onChange={handleInputChange} required />
                </div>

                <input type="text" name="houseNo" placeholder="House No" value={address.houseNo} onChange={handleInputChange} required />
                <input type="text" name="city" placeholder="City" value={address.city} onChange={handleInputChange} required />
                <input type="text" name="state" placeholder="State" value={address.state} onChange={handleInputChange} required />
                <input type="text" name="pin" placeholder="Pin Code" value={address.pin} onChange={handleInputChange} required />
                <input type="text" name="phone" placeholder="Phone" value={address.phone} onChange={handleInputChange} required />

                <label className="checkbox-label">
                    <input className='checkbox' type="checkbox" name="isDefault" checked={address.isDefault} onChange={(e) => setAddress({ ...address, isDefault: e.target.checked })} />
                    Default Address
                </label>

                <button className="save-btn" type="submit">Save Address</button>
            </form>
        </div>
    );
};

export default AddAddress;
