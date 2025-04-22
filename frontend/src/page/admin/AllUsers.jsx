import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AppContext } from "../../context/AppContext";
import "../../css/admin/AllUsers.css"; // Import external CSS file
import {SyncLoader} from 'react-spinners'

const AllUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { backendUrl } = useContext(AppContext);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/user/users`);
        setUsers(response.data.users);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch users");
        setLoading(false);
      }
    };

    fetchUsers();
  }, [backendUrl]);

  if (loading) {
    return   <div className="loader-container">
          <SyncLoader color="#4b2c35" />
        </div>  ;
  }

  if (error) {
    return <p className="error-text">{error}</p>;
  }

  return (
    <div className="user-list-container">
      <h1 className="user-list-title">All Users</h1>
      {users.length === 0 ? (
        <p className="no-users">No users found.</p>
      ) : (
        <div className="table-wrapper">
          <table className="user-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.userId}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.phone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AllUsers;
