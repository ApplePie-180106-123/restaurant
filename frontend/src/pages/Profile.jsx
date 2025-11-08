// src/pages/Profile.jsx
import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const Profile = () => {
    const { user } = useContext(AuthContext);

    return (
        <div className="container mt-4">
            <h3>Profile</h3>
            {user ? (
                <div className="card p-3" style={{ maxWidth: 600 }}>
                    <p><strong>Name:</strong> {user.name}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Role:</strong> {user.role}</p>
                </div>
            ) : (
                <p>No user data</p>
            )}
        </div>
    );
};

export default Profile;
