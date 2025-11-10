// src/pages/Login.jsx
import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, useLocation, Link } from "react-router-dom";

const Login = () => {
    const { login, loading } = useContext(AuthContext);
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState(null);

    const navigate = useNavigate();
    const location = useLocation();
    // Where to go after login; default to home
    const from = location.state?.from || "/";

    const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const onSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            const res = await login(form);
            if (res.ok) {
                navigate(from, { replace: true });
            } else {
                setError(res.error || "Login failed");
            }
        } catch (err) {
            setError(err.message || "Something went wrong");
        }
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-6">
                    <h2 className="text-3xl font-extrabold text-gray-900">Sign in to Quantum Kitchen</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Welcome back — enter your credentials to continue.
                    </p>
                    {location.state?.from && (
                        <p className="mt-3 text-sm text-rose-600 font-medium">
                            Please login to view the menu.
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
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            name="email"
                            value={form.email}
                            onChange={onChange}
                            type="email"
                            required
                            autoFocus
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

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-full bg-rose-500 text-white font-medium hover:bg-rose-600 transition"
                        >
                            {loading ? "Logging in..." : "Login"}
                        </button>
                    </form>

                    <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                        <Link to="/register" className="px-3 py-2 rounded-full border border-gray-200 hover:bg-gray-50">
                            Create account
                        </Link>
                        <Link to="/forgot" className="text-rose-600 hover:underline">
                            Forgot password?
                        </Link>
                    </div>
                </div>

                <p className="mt-6 text-center text-xs text-gray-500">
                    By signing in you agree to our <span className="underline">Terms</span> and <span className="underline">Privacy</span>.
                </p>
            </div>
        </div>
    );
};

export default Login;
