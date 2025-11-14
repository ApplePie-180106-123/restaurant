import React, { useEffect, useState, useContext, useMemo } from "react";
import API from "../api";
import FilterSort from "../components/FilterSort";
import MenuCard from "../components/MenuCard";
import MenuDetailModal from "../components/MenuDetailModal";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation

const Menu = () => {
    const { addItem, cart, subtotal, placeOrder, placingOrder, clearCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const isAdmin = user?.role === "admin";
    const navigate = useNavigate();

    const [items, setItems] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // filters
    const [q, setQ] = useState("");
    const [category, setCategory] = useState("");
    const [sort, setSort] = useState("");
    const [availOnly, setAvailOnly] = useState(false);

    // modal / admin
    const [selected, setSelected] = useState(null);
    const [showDetail, setShowDetail] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // success popup
    const [showPopup, setShowPopup] = useState(false);
    const [quote, setQuote] = useState("");

    const quotes = [
        "Before you blink, your food will arrive — faster than your crush’s reply 😉",
        "Chef just whispered: 'Serve it before he starts scrolling Instagram again!' 🍽️",
        "Your order is racing to you like it’s on a mission from flavor heaven 🚀",
        "Take a breath — our chefs are quicker than your thoughts 😎",
        "Perfect! Now you can stare at your girlfriend — we’ll handle the food 😏"
    ];

    useEffect(() => {
        const fetchMenu = async () => {
            setLoading(true);
            try {
                const { data } = await API.get("/api/menu");
                setItems(data);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || err.message);
                setLoading(false);
            }
        };
        fetchMenu();
    }, []);

    // Derive categories (using useMemo for optimization)
    const categories = useMemo(() => {
        return Array.from(new Set(items.map(i => i.category).filter(Boolean)));
    }, [items]);

    useEffect(() => {
        let list = [...items];
        if (q) {
            const qq = q.toLowerCase();
            list = list.filter(i =>
                (i.name || "").toLowerCase().includes(qq) ||
                (i.description || "").toLowerCase().includes(qq)
            );
        }
        if (category) list = list.filter(i => i.category === category);
        if (availOnly) list = list.filter(i => i.availability);

        if (sort === "price_asc") list.sort((a, b) => a.price - b.price);
        else if (sort === "price_desc") list.sort((a, b) => b.price - a.price);
        else if (sort === "name_asc") list.sort((a, b) => a.name.localeCompare(b.name));
        else if (sort === "name_desc") list.sort((a, b) => b.name.localeCompare(a.name));

        setFiltered(list);
    }, [items, q, category, sort, availOnly]);

    const handleView = (item) => {
        setSelected(item);
        setIsEditing(false);
        setShowDetail(true);
    };

    const handleEdit = (item) => {
        if (!isAdmin) return;
        setSelected(item);
        setIsEditing(true);
        setShowDetail(true);
    };

    const handleUpdateItem = (updatedItem) => {
        setItems(prev => prev.map(item => (item._id === updatedItem._id ? updatedItem : item)));
        setShowDetail(false);
        setSelected(null);
        setIsEditing(false);
    }

    const handleDelete = async (item) => {
        if (!isAdmin) {
            alert("Only admins can delete menu items.");
            return;
        }
        if (!window.confirm("Delete this menu item?")) return;
        try {
            await API.delete(`/api/menu/${item._id}`);
            setItems(prev => prev.filter(p => p._id !== item._id));
        } catch (err) {
            alert(err.response?.data?.message || err.message);
        }
    };

    const handleCheckout = async () => {
        if (!user) {
            if (!window.confirm("You must be logged in to place an order. Go to login?")) return;
            navigate("/login", { state: { from: "/menu" } }); // Use navigate instead of window.location
            return;
        }

        const tableNumber = window.prompt("Table number (optional) — leave blank if delivery/takeout.");
        const tn = tableNumber ? parseInt(tableNumber, 10) : null;

        const res = await placeOrder({ tableNumber: tn });
        if (res.ok) {
            const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
            setQuote(randomQuote);
            setShowPopup(true);
            clearCart?.();
        } else {
            alert("Order failed: " + res.error);
        }
    };

    // --- Component JSX ---

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header & Title Section */}
            <header className="bg-white shadow-md sticky top-0 z-30">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-3xl font-extrabold text-gray-900">
                        The <span className="text-rose-600">Quantum</span> Menu 🚀
                    </h1>
                    <button
                        onClick={() => navigate('/')}
                        className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition duration-150"
                    >
                        Back to Home
                    </button>
                </div>
            </header>

            {/* Filter/Sort Bar - Sticky below the header */}
            <div className="bg-white border-b sticky top-[68px] z-20 shadow-inner">
                <div className="container mx-auto px-4 py-3">
                    <FilterSort
                        q={q}
                        onQChange={setQ}
                        categories={categories}
                        category={category}
                        onCategoryChange={setCategory}
                        sort={sort}
                        onSortChange={setSort}
                        showAvailableOnly={availOnly}
                        onAvailableToggle={setAvailOnly}
                    />
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Menu Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="animate-pulse bg-gray-200 h-64 rounded-xl shadow-md" />
                        ))}
                    </div>
                ) : error ? (
                    <div className="text-center bg-red-100 text-red-700 p-4 rounded-lg border border-red-300">
                        Error loading menu: {error}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20 text-gray-500 text-xl">
                        No menu items found matching your filters.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filtered.map(item => (
                            <MenuCard
                                key={item._id}
                                item={item}
                                onView={handleView}
                                onDelete={handleDelete}
                                onEdit={handleEdit}
                                isAdmin={isAdmin}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Cart Summary Bottom Bar (Floating) */}
            <div className="fixed bottom-0 left-0 w-full z-40 bg-white border-t-2 border-rose-500 shadow-2xl">
                <div className="container mx-auto px-6 py-3 flex items-center justify-between">
                    <div className="flex flex-col">
                        <div className="text-sm font-medium text-gray-600">
                            Your Order: <span className="text-rose-600 font-bold">{cart.length} items</span>
                        </div>
                        <div className="text-xl font-bold text-gray-900">
                            Total: <span className="text-rose-600">₹{subtotal.toFixed(2)}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate("/cart")}
                            className="px-5 py-2 text-rose-600 border border-rose-600 rounded-full hover:bg-rose-50 transition"
                        >
                            View Cart ({cart.length})
                        </button>
                        <button
                            onClick={handleCheckout}
                            disabled={cart.length === 0 || placingOrder}
                            className={`px-6 py-2 text-white rounded-full transition duration-200 ${cart.length === 0 || placingOrder
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-200"
                                }`}
                        >
                            {placingOrder ? "Placing Order..." : "Place Order Now"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Menu Detail/Edit Modal */}
            {showDetail && (
                <MenuDetailModal
                    item={selected}
                    isEditing={isEditing}
                    onUpdateItem={handleUpdateItem}
                    onClose={() => {
                        setShowDetail(false);
                        setSelected(null);
                        setIsEditing(false);
                    }}
                />
            )}

            {/* ✅ Success Popup */}
            {showPopup && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50 transition-opacity duration-300">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 w-[90%] max-w-sm text-center transform scale-100 transition-transform duration-500 ease-out">
                        <div className="text-5xl mb-4">🎉</div>
                        <h2 className="text-2xl font-bold text-green-600 mb-3">
                            Order Confirmed!
                        </h2>
                        <p className="text-gray-700 italic mb-6">
                            "{quote}"
                        </p>
                        <button
                            onClick={() => setShowPopup(false)}
                            className="mt-3 px-8 py-3 bg-rose-500 text-white font-semibold rounded-full hover:bg-rose-600 transition shadow-md"
                        >
                            Awesome!
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Menu;