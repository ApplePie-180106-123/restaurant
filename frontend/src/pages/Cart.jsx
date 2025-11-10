import React, { useContext, useState } from "react";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export default function Cart() {
    const navigate = useNavigate();
    const { cart, updateQty, removeItem, clearCart, subtotal, placeOrder, placingOrder } = useContext(CartContext);
    const { user } = useContext(AuthContext);

    // simple tax config
    const TAX_RATE = 0.05; // 5% tax
    const tax = +(subtotal * TAX_RATE).toFixed(2);
    const total = +(subtotal + tax).toFixed(2);

    const [loadingCheckout, setLoadingCheckout] = useState(false);
    const [error, setError] = useState(null);
    const [tableNumber, setTableNumber] = useState("");
    const [showPopup, setShowPopup] = useState(false);
    const [quote, setQuote] = useState("");

    // Some funny / silly restaurant quotes 🍽️❤️
    const quotes = [
        "Before you blink, your order will be there — faster than your crush’s reply 😉",
        "Relax and smile! Your food’s coming quicker than your mood swings 😎",
        "Chef just whispered — ‘Serve it before he checks his girlfriend’s messages!’ 😏",
        "Order confirmed! You’ve officially earned 5 seconds of peace before the feast 🍕",
        "Sit tight, foodie. The kitchen’s working harder than your brain on Mondays 🧠🔥"
    ];

    const handleQtyChange = (id, newQty) => updateQty(id, newQty);

    const handleRemove = (id) => {
        if (!window.confirm("Remove item from cart?")) return;
        removeItem(id);
    };

    const handleCheckout = async () => {
        setError(null);
        if (cart.length === 0) {
            setError("Cart is empty");
            return;
        }

        if (!user) {
            if (!window.confirm("You must be logged in to place an order. Go to login?"))
                return navigate("/login");
            return;
        }

        setLoadingCheckout(true);
        try {
            const tn = tableNumber ? Number(tableNumber) : null;
            const res = await placeOrder({ tableNumber: tn, customerId: user?._id });
            if (res.ok) {
                // Random quote
                const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
                setQuote(randomQuote);
                setShowPopup(true);
                clearCart(); // clear cart after successful order
            } else {
                setError(res.error || "Failed to place order");
            }
        } catch (err) {
            setError(err.message || "Failed to place order");
        } finally {
            setLoadingCheckout(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-semibold mb-4">Your Cart</h1>

            {cart.length === 0 ? (
                <div className="text-center py-16">
                    <p className="text-lg mb-4">Your cart is empty.</p>
                    <Link to="/menu" className="px-4 py-2 bg-rose-500 text-white rounded">
                        Browse Menu
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: items */}
                    <div className="lg:col-span-2 space-y-4">
                        {cart.map((item) => (
                            <div key={item._id} className="flex gap-4 bg-white p-4 rounded-lg shadow">
                                <div className="w-32 h-24 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                    {item.imageUrl ? (
                                        <img
                                            src={item.imageUrl}
                                            alt={item.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="h-full flex items-center justify-center text-gray-400">
                                            No image
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 flex flex-col">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-semibold">{item.name}</h3>
                                            <div className="text-sm text-gray-500">{item.category}</div>
                                        </div>
                                        <div className="font-bold">₹{item.price}</div>
                                    </div>

                                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                                        {item.description || ""}
                                    </p>

                                    <div className="mt-3 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <button
                                                className="px-2 py-1 border rounded"
                                                onClick={() =>
                                                    handleQtyChange(item._id, Math.max(1, item.qty - 1))
                                                }
                                            >
                                                -
                                            </button>
                                            <div className="px-3 py-1 border rounded min-w-[48px] text-center">
                                                {item.qty}
                                            </div>
                                            <button
                                                className="px-2 py-1 border rounded"
                                                onClick={() => handleQtyChange(item._id, item.qty + 1)}
                                            >
                                                +
                                            </button>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="text-sm text-gray-500">
                                                Item total:{" "}
                                                <span className="font-semibold">
                                                    ₹{(item.price * item.qty).toFixed(2)}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => handleRemove(item._id)}
                                                className="text-sm text-red-600"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Right: summary */}
                    <aside className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-semibold">Order Summary</h4>
                            <div className="text-sm text-gray-500">{cart.length} items</div>
                        </div>

                        <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-sm">
                                <span>Subtotal</span>
                                <span>₹{subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Tax (5%)</span>
                                <span>₹{tax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-base font-semibold">
                                <span>Total</span>
                                <span>₹{total.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="mb-3">
                            <label className="block text-sm text-gray-600 mb-1">
                                Table number (optional)
                            </label>
                            <input
                                value={tableNumber}
                                onChange={(e) => setTableNumber(e.target.value)}
                                placeholder="e.g., 5"
                                className="w-full border rounded px-3 py-2"
                            />
                        </div>

                        {error && <div className="mb-3 text-sm text-red-600">{error}</div>}

                        <div className="flex flex-col gap-2">
                            {!user ? (
                                <button
                                    onClick={() => navigate("/login")}
                                    className="px-4 py-2 bg-rose-500 text-white rounded"
                                >
                                    Login to place order
                                </button>
                            ) : (
                                <button
                                    onClick={handleCheckout}
                                    disabled={loadingCheckout || placingOrder}
                                    className="px-4 py-2 bg-rose-500 text-white rounded"
                                >
                                    {loadingCheckout || placingOrder
                                        ? "Placing order..."
                                        : "Place Order"}
                                </button>
                            )}

                            <button
                                onClick={() => {
                                    if (confirm("Clear cart?")) clearCart();
                                }}
                                className="px-4 py-2 border rounded"
                            >
                                Clear Cart
                            </button>
                            <Link to="/menu" className="text-sm text-gray-600 underline">
                                Continue browsing
                            </Link>
                        </div>
                    </aside>
                </div>
            )}

            {/* ✅ Order Success Popup */}
            {showPopup && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
                    <div className="bg-white rounded-2xl shadow-lg p-6 w-[90%] max-w-sm text-center animate-fade-in">
                        <h2 className="text-2xl font-semibold text-rose-600 mb-3">
                            Order Placed Successfully ✅
                        </h2>
                        <p className="text-gray-700 mb-4">{quote}</p>
                        <button
                            onClick={() => {
                                setShowPopup(false);
                                navigate("/menu");
                            }}
                            className="mt-3 px-6 py-2 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition"
                        >
                            Okay 😋
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
