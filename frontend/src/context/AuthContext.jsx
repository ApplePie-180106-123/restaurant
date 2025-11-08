// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("user")) || null;
        } catch {
            return null;
        }
    });
    const [token, setToken] = useState(() => localStorage.getItem("token") || null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (token && !user) {
            // Optionally fetch user profile from backend
            // but the token / user returned at login/register is enough
        }
    }, []);

    const register = async (payload) => {
        setLoading(true);
        try {
            const { data } = await API.post("/api/users/register", payload);
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data));
            setToken(data.token);
            setUser({ _id: data._id, name: data.name, email: data.email, role: data.role });
            setLoading(false);
            navigate("/");
            return { ok: true, data };
        } catch (err) {
            setLoading(false);
            return { ok: false, error: err.response?.data?.message || err.message };
        }
    };

    const login = async (payload) => {
        setLoading(true);
        try {
            const { data } = await API.post("/api/users/login", payload);
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data));
            setToken(data.token);
            setUser({ _id: data._id, name: data.name, email: data.email, role: data.role });
            setLoading(false);
            navigate("/");
            return { ok: true, data };
        } catch (err) {
            setLoading(false);
            return { ok: false, error: err.response?.data?.message || err.message };
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setToken(null);
        setUser(null);
        navigate("/login");
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, register, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
