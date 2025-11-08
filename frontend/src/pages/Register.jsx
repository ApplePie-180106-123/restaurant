// src/pages/Register.jsx
import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const Register = () => {
    const { register, loading } = useContext(AuthContext);
    const [form, setForm] = useState({ name: "", email: "", password: "", role: "customer" });
    const [error, setError] = useState(null);

    const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const onSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        const res = await register(form);
        if (!res.ok) setError(res.error);
    };

    return (
        <div className="container mt-5" style={{ maxWidth: 520 }}>
            <h3>Register</h3>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={onSubmit}>
                <div className="mb-3">
                    <label className="form-label">Name</label>
                    <input name="name" value={form.name} onChange={onChange} required className="form-control" />
                </div>

                <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input name="email" value={form.email} onChange={onChange} type="email" required className="form-control" />
                </div>

                <div className="mb-3">
                    <label className="form-label">Password</label>
                    <input name="password" value={form.password} onChange={onChange} type="password" required className="form-control" />
                </div>

                <div className="mb-3">
                    <label className="form-label">Role</label>
                    <select name="role" value={form.role} onChange={onChange} className="form-select">
                        <option value="customer">Customer</option>
                        <option value="waiter">Waiter</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>

                <button className="btn btn-primary" disabled={loading}>{loading ? "Registering..." : "Register"}</button>
            </form>
        </div>
    );
};

export default Register;
