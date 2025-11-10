// src/pages/Profile.jsx
import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

const Profile = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        if (logout) logout(); // clear user context / token
        navigate("/"); // redirect to home after logout
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4">
            <div className="w-full max-w-md text-center">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-6">
                    Profile
                </h2>

                {user ? (
                    <div className="bg-white border rounded-2xl shadow-md p-6 text-left">
                        <div className="flex flex-col gap-3">
                            <p className="text-lg">
                                <strong className="text-gray-700">Name:</strong> {user.name}
                            </p>
                            <p className="text-lg">
                                <strong className="text-gray-700">Email:</strong> {user.email}
                            </p>
                            <p className="text-lg">
                                <strong className="text-gray-700">Role:</strong> {user.role}
                            </p>
                        </div>

                        <div className="mt-6 flex items-center justify-between">
                            <button
                                onClick={handleLogout}
                                className="px-6 py-2 bg-rose-500 text-white rounded-full font-medium hover:bg-rose-600 transition"
                            >
                                Logout
                            </button>

                            <Link
                                to="/menu"
                                className="px-6 py-2 border border-rose-500 text-rose-600 rounded-full font-medium hover:bg-rose-50 transition"
                            >
                                Go to Menu
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white border rounded-2xl shadow-md p-6">
                        <p className="text-gray-700 mb-4 text-lg">
                            You are not logged in yet.
                        </p>
                        <Link
                            to="/login"
                            className="px-8 py-3 bg-rose-500 text-white rounded-full shadow hover:bg-rose-600 transition"
                        >
                            Login to View Profile
                        </Link>
                    </div>
                )}

                <p className="mt-8 text-xs text-gray-500">
                    © 2025 Quantum Kitchen — Secure user dashboard
                </p>
            </div>
        </div>
    );
};

export default Profile;
