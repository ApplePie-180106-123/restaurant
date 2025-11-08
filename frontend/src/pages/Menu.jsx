// src/pages/Menu.jsx
import React, { useEffect, useState, useContext } from "react";
import API from "../api";
import FilterSort from "../components/FilterSort";
import MenuCard from "../components/MenuCard";
import MenuDetailModal from "../components/MenuDetailModal";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";

const Menu = () => {
    const { addItem, cart, subtotal, placeOrder, placingOrder } = useContext(CartContext);
    const { user } = useContext(AuthContext);

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
            list = list.filter(i => (i.name || "").toLowerCase().includes(qq) || (i.description || "").toLowerCase().includes(qq));
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
        setShowDetail(true);
    };

    const handleDelete = async (item) => {
        if (!window.confirm("Delete this menu item?")) return;
        try {
            await API.delete(`/api/menu/${item._id}`);
            setItems(prev => prev.filter(p => p._id !== item._1d && p._id !== item._id));
        } catch (err) {
            alert(err.response?.data?.message || err.message);
        }
    };

    const handleEdit = (item) => {
        // navigate to admin menu manager or open modal - implement as you like
        alert("Open admin menu manager to edit item (not implemented).");
    };

    const handleCheckout = async () => {
        const tableNumber = window.prompt("Table number (optional) — leave blank if not applicable");
        const tn = tableNumber ? parseInt(tableNumber, 10) : null;
        const res = await placeOrder({ tableNumber: tn });
        if (res.ok) {
            alert("Order placed! Order id: " + res.data._id);
        } else {
            alert("Order failed: " + res.error);
        }
    };

    return (
        <div className="container mx-auto px-4 py-6">
            <h2 className="text-2xl font-semibold mb-4">Menu</h2>

            <FilterSort
                q={q} onQChange={setQ}
                categories={categories} category={category} onCategoryChange={setCategory}
                sort={sort} onSortChange={setSort}
                showAvailableOnly={availOnly} onAvailableToggle={setAvailOnly}
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
                            <MenuCard key={item._id} item={item} onView={handleView} onDelete={handleDelete} onEdit={handleEdit} />
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
                                <button onClick={() => window.location.href = "/cart"} className="px-4 py-2 border rounded">View Cart</button>
                                <button onClick={handleCheckout} disabled={cart.length === 0 || placingOrder} className="px-4 py-2 bg-rose-500 text-white rounded">
                                    {placingOrder ? "Placing..." : "Checkout"}
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {showDetail && <MenuDetailModal item={selected} onClose={() => { setShowDetail(false); setSelected(null); }} />}
        </div>
    );
};

export default Menu;
