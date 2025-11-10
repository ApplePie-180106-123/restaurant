// src/pages/Home.jsx
import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Home = () => {
    const navigate = useNavigate();
    const { user, logout } = useContext(AuthContext); // expects AuthContext to provide `user` and `logout`

    const goToMenu = () => {
        if (user) {
            navigate("/menu");
        } else {
            // Not logged in -> send to login and tell login where to return afterwards
            navigate("/login", { state: { from: "/menu" } });
        }
    };

    return (
        <div className="min-h-screen bg-white text-gray-800 font-sans">
            {/* NAVBAR */}
            <nav className="border-b bg-white">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link to="/" className="text-xl font-bold text-gray-900">
                            Quantum <span className="text-rose-600">Kitchen</span>
                        </Link>
                        <span className="text-sm text-gray-500">• Fresh • Fast • Futuristic</span>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Show Login/Register when not logged in */}
                        {!user ? (
                            <>
                                <Link to="/login" className="px-5 py-2 bg-rose-500 text-white text-lg shadow-lg hover:bg-rose-600 transition-all duration-300">
                                    Login
                                </Link>
                                <Link to="/register" className="px-5 py-2 bg-rose-500 text-white text-lg shadow-lg hover:bg-rose-600 transition-all duration-300">
                                    Register
                                </Link>
                            </>
                        ) : (
                            /* Show simple profile & logout when logged in */
                            <>
                                <div className="text-sm text-gray-700 mr-2">Hello, {user.name}</div>
                                <Link to="/profile" className="px-3 py-2 text-sm rounded hover:bg-gray-100">
                                    Profile
                                </Link>
                                <button
                                    onClick={() => { logout?.(); navigate("/"); }}
                                    className="px-3 py-2 text-sm rounded border hover:bg-gray-50"
                                >
                                    Logout
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="container mx-auto px-6 py-16 flex flex-col lg:flex-row items-center justify-between gap-10">
                {/* Text Section */}
                <div className="flex-1 text-center lg:text-left">
                    <h1 className="text-5xl font-bold mb-4 text-gray-900">
                        Welcome to <span className="text-rose-600">Quantum Kitchen</span>
                    </h1>
                    <p className="text-lg text-gray-600 max-w-lg mx-auto lg:mx-0">
                        Where innovation meets flavor. Step into the future of dining — crafted with taste, precision, and technology.
                    </p>

                    <blockquote className="mt-6 text-xl italic text-gray-700 font-light">
                        “Tap the Menu. Taste the Future.”
                    </blockquote>

                    <div className="mt-8 flex justify-center lg:justify-start">
                        <button
                            onClick={goToMenu}
                            className="px-10 py-4 bg-rose-500 text-white text-lg rounded-full shadow-lg hover:bg-rose-600 transition-all duration-300"
                        >
                            View Menu 🍽️
                        </button>
                    </div>
                </div>

                {/* Hero Image Section */}
                <div className="flex-1 flex justify-center">
                    <img
                        src="https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=900&q=60"
                        alt="Restaurant Dish"
                        className="w-full max-w-md rounded-2xl shadow-xl"
                    />
                </div>
            </header>

            {/* About Section */}
            <section className="container mx-auto px-6 py-12 text-center">
                <h2 className="text-3xl font-semibold text-gray-900 mb-4">
                    About Our Restaurant
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    Quantum Kitchen blends the art of traditional cuisine with futuristic technology.
                    Our chefs prepare every dish to perfection while our smart management system ensures
                    a fast, contactless, and elegant dining experience.
                </p>

                <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
                    <div className="bg-white border rounded-xl p-6 shadow-md hover:shadow-lg transition">
                        <img
                            src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=60"
                            alt="Quality Food"
                            className="w-full h-40 object-cover rounded-lg mb-4"
                        />
                        <h3 className="text-xl font-semibold mb-2 text-rose-600">Premium Quality</h3>
                        <p className="text-sm text-gray-600">
                            Only the freshest ingredients, sourced daily and crafted into mouth-watering dishes.
                        </p>
                    </div>

                    <div className="bg-white border rounded-xl p-6 shadow-md hover:shadow-lg transition">
                        <img
                            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=60"
                            alt="Modern Ambience"
                            className="w-full h-40 object-cover rounded-lg mb-4"
                        />
                        <h3 className="text-xl font-semibold mb-2 text-rose-600">Modern Ambience</h3>
                        <p className="text-sm text-gray-600">
                            A soothing, tech-inspired atmosphere — dine in comfort, surrounded by elegance.
                        </p>
                    </div>

                    <div className="bg-white border rounded-xl p-6 shadow-md hover:shadow-lg transition">
                        <img
                            src="https://images.unsplash.com/photo-1600891963938-a8f5f9c6d22a?auto=format&fit=crop&w=800&q=60"
                            alt="Fast Service"
                            className="w-full h-40 object-cover rounded-lg mb-4"
                        />
                        <h3 className="text-xl font-semibold mb-2 text-rose-600">Lightning Fast</h3>
                        <p className="text-sm text-gray-600">
                            Our intelligent order system ensures your food reaches you faster than ever.
                        </p>
                    </div>
                </div>
            </section>

            {/* Call-to-Action Section */}
            <section className="bg-rose-50 py-12 mt-10">
                <div className="container mx-auto text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-3">
                        Hungry Already?
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Explore our menu and experience the magic of Quantum Kitchen.
                    </p>
                    <button
                        onClick={goToMenu}
                        className="px-10 py-4 bg-rose-500 text-white text-lg rounded-full shadow-lg hover:bg-rose-600 transition-all duration-300"
                    >
                        Go to Menu 🚀
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-100 py-6 text-center text-gray-600 mt-10">
                © 2025 Quantum Kitchen — Designed with ❤️ for a futuristic dining experience.
            </footer>
        </div>
    );
};

export default Home;
