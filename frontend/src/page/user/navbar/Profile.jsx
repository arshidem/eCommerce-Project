import React, { useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../../context/AppContext";
import { toast } from "react-toastify";
import "../../../css/Profile.css"; // Import external CSS

const Profile = () => {
  const { userData, backendUrl, getAuthState } = useContext(AppContext);
const navigate=useNavigate()
  const [name, setName] = useState(userData?.name || "");
  const [email, setEmail] = useState(userData?.email || "");
  const [phone, setPhone] = useState(userData?.phone || "");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await axios.put(
        `${backendUrl}/api/user/update/${userData.userId}`,
        { name, email, phone },
        {
          headers: { Authorization: `Bearer ${userData.token}` },
        }
      );

      if (response.data.success) {
        toast.success("Profile updated successfully!");
        await getAuthState(); // Refresh user data in context
        navigate("/");
      } else {
        toast.error(response.data.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Error updating profile");
    } finally {
      setSaving(false);
    }
  };
  const handleBack = () => {
    navigate(-1); // Navigate to the previous page
  };
  return (
    <div className="profile-container">
        <div style={{display:'flex',alignItems:'center', gap:'15px'}}>
      <button onClick={handleBack} className="back-btn">←</button>
     </div>
      <h1 className="profile-title">Profile</h1>
      <form className="profile-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name</label>
          <input
            type="text"
            className="form-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            className="form-input"
            value={email}
            // readOnly // Prevent manual edits (optional)
          />
        </div>

        <div className="form-group">
          <label>Phone</label>
          <input
            type="text"
            className="form-input"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <button type="submit" className="profile-btn" disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
};

export default Profile;
