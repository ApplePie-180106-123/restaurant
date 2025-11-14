import React, { useEffect, useState, useContext } from "react";
import API from "../api";
import FilterSort from "../components/FilterSort";
import MenuCard from "../components/MenuCard";
import MenuDetailModal from "../components/MenuDetailModal";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";

const Menu = () => {
    const { addItem, cart, subtotal, placeOrder, placingOrder, clearCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const isAdmin = user?.role === "admin"; // Check admin role once

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
    const [isEditing, setIsEditing] = useState(false); // NEW STATE for edit mode

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

    // derive categories
    const categories = Array.from(new Set(items.map(i => i.category).filter(Boolean)));

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

    // Handle viewing details (default mode)
    const handleView = (item) => {
        setSelected(item);
        setIsEditing(false); // Ensure edit mode is false
        setShowDetail(true);
    };

    // NEW: Handle editing (Admin mode)
    const handleEdit = (item) => {
        if (!isAdmin) return; // Guard for non-admin clicks
        setSelected(item);
        setIsEditing(true); // Set edit mode to true
        setShowDetail(true);
    };

    // NEW: Function to update item in state after successful edit (to be passed to MenuDetailModal)
    const handleUpdateItem = (updatedItem) => {
        setItems(prev => prev.map(item => (item._id === updatedItem._id ? updatedItem : item)));
        setShowDetail(false); // Close modal
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
            window.location.href = "/login";
            return;
        }

        const tableNumber = window.prompt("Table number (optional) — leave blank if not applicable");
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

    return (
        <div className="container mx-auto px-4 py-6">
            <h2 className="text-2xl font-semibold mb-4">Menu</h2>

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

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="animate-pulse bg-gray-100 h-56 rounded-lg" />
                    ))}
                </div>
            ) : error ? (
                <div className="alert alert-danger">{error}</div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-10">No menu items found.</div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {filtered.map(item => (
                            <MenuCard
                                key={item._id}
                                item={item}
                                onView={handleView}
                                onDelete={handleDelete}
                                // Pass handleEdit to MenuCard (assuming MenuCard uses it if isAdmin is true)
                                onEdit={handleEdit}
                                isAdmin={isAdmin}
                            />
                        ))}
                    </div>

                    {/* Cart summary bottom bar */}
                    <div className="fixed bottom-4 right-4 bg-white border rounded-lg shadow p-4 w-full max-w-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm text-gray-500">Cart • {cart.length} items</div>
                                <div className="font-semibold">Subtotal: ₹{subtotal}</div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => (window.location.href = "/cart")}
                                    className="px-4 py-2 border rounded"
                                >
                                    View Cart
                                </button>
                                <button
                                    onClick={handleCheckout}
                                    disabled={cart.length === 0 || placingOrder}
                                    className="px-4 py-2 bg-rose-500 text-white rounded"
                                >
                                    {placingOrder ? "Placing..." : "Checkout"}
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* MenuDetailModal now receives the isEditing flag and the update handler */}
            {showDetail && (
                <MenuDetailModal
                    item={selected}
                    isEditing={isEditing} // NEW PROP
                    onUpdateItem={handleUpdateItem} // NEW PROP
                    onClose={() => {
                        setShowDetail(false);
                        setSelected(null);
                        setIsEditing(false); // Reset editing state on close
                    }}
                />
            )}

            {/* ✅ Success Popup */}
            {showPopup && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                    <div className="bg-white rounded-2xl shadow-lg p-6 w-[90%] max-w-sm text-center animate-fade-in">
                        <h2 className="text-2xl font-semibold text-rose-600 mb-3">
                            Order Placed Successfully ✅
                        </h2>
                        <p className="text-gray-700 mb-4">{quote}</p>
                        <button
                            onClick={() => setShowPopup(false)}
                            className="mt-3 px-6 py-2 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition"
                        >
                            Okay 😋
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Menu;