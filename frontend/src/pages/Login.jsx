// src/pages/Login.jsx
import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
    const { login, loading } = useContext(AuthContext);
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState(null);

    const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const onSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        const res = await login(form);
        if (!res.ok) setError(res.error);
    };

    return (
        <div className="container mt-5" style={{ maxWidth: 520 }}>
            <h3>Login</h3>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={onSubmit}>
                <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input name="email" value={form.email} onChange={onChange} type="email" required className="form-control" />
                </div>

                <div className="mb-3">
                    <label className="form-label">Password</label>
                    <input name="password" value={form.password} onChange={onChange} type="password" required className="form-control" />
                </div>

                <button className="btn btn-primary" disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
            </form>
        </div>
    );
};

export default Login;
