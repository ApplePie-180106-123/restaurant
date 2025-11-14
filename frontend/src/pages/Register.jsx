// src/pages/Register.jsx
import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, useLocation, Link } from "react-router-dom";

const Register = () => {
    const { register, loading } = useContext(AuthContext);
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        role: "customer",
    });
    const [error, setError] = useState(null);

    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from || "/";

    const onChange = (e) =>
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });

    const onSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            const res = await register(form);
            if (res.ok) {
                // After successful register, navigate to the requested page (or home)
                navigate(from, { replace: true });
            } else {
                setError(res.error || "Registration failed");
            }
        } catch (err) {
            setError(err.message || "Something went wrong");
        }
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-6">
                    <h2 className="text-3xl font-extrabold text-gray-900">Create your account</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Join Rockerzzz — register to place orders and manage your profile.
                    </p>
                    {location.state?.from && (
                        <p className="mt-3 text-sm text-rose-600 font-medium">
                            You were asked to register to continue.
                        </p>
                    )}
                </div>

                <div className="bg-white border rounded-2xl shadow-sm p-6">
                    {error && (
                        <div className="mb-4 rounded-md bg-rose-50 border border-rose-100 p-3 text-rose-700">
                            {error}
                        </div>
                    )}

                    <form onSubmit={onSubmit}>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <input
                            name="name"
                            value={form.name}
                            onChange={onChange}
                            required
                            className="mt-1 mb-4 block w-full rounded-md border-gray-200 shadow-sm px-3 py-2 focus:ring-rose-500 focus:border-rose-500"
                        />

                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            name="email"
                            value={form.email}
                            onChange={onChange}
                            type="email"
                            required
                            className="mt-1 mb-4 block w-full rounded-md border-gray-200 shadow-sm px-3 py-2 focus:ring-rose-500 focus:border-rose-500"
                        />

                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            name="password"
                            value={form.password}
                            onChange={onChange}
                            type="password"
                            required
                            className="mt-1 mb-4 block w-full rounded-md border-gray-200 shadow-sm px-3 py-2 focus:ring-rose-500 focus:border-rose-500"
                        />

                        <label className="block text-sm font-medium text-gray-700">Role</label>
                        <select
                            name="role"
                            value={form.role}
                            onChange={onChange}
                            className="mt-1 mb-6 block w-full rounded-md border-gray-200 shadow-sm px-3 py-2 focus:ring-rose-500 focus:border-rose-500"
                        >
                            <option value="customer">Customer</option>
                            <option value="cashier">Cashier</option>
                            <option value="admin">Admin</option>
                            <option value="waiter">Delivery Boy</option>
                            <option value="inventory">Inventory Manager</option>
                        </select>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-full bg-rose-500 text-white font-medium hover:bg-rose-600 transition"
                        >
                            {loading ? "Registering..." : "Create Account"}
                        </button>
                    </form>

                    <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                        <Link to="/login" className="px-3 py-2 rounded-full border border-gray-200 hover:bg-gray-50">
                            Already have an account? Log in
                        </Link>
                        <Link to="/" className="text-rose-600 hover:underline">
                            Back to Home
                        </Link>
                    </div>
                </div>

                <p className="mt-6 text-center text-xs text-gray-500">
                    By creating an account you agree to our <span className="underline">Terms</span> and <span className="underline">Privacy</span>.
                </p>
            </div>
        </div>
    );
};

export default Register;
