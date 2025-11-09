// src/pages/admin/MenuManager.jsx
import React, { useEffect, useState } from "react";
import API from "../../api";
import AddEditMenuModal from "../../components/AddEditMenuModal";
import { useLocation } from "react-router-dom";

export default function MenuManager() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [error, setError] = useState(null);
    const location = useLocation();

    useEffect(() => {
        const fetchMenu = async () => {
            setLoading(true);
            try {
                const { data } = await API.get("/api/menu");
                setItems(data);
            } catch (err) {
                setError(err.response?.data?.message || err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchMenu();
    }, []);

    // open edit if query param exists
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const editId = params.get("edit");
        if (editId && items.length > 0) {
            const itm = items.find(i => i._id === editId);
            if (itm) {
                setEditing(itm);
                setShowModal(true);
            }
        }
    }, [location.search, items]);

    const handleCreateClick = () => {
        setEditing(null);
        setShowModal(true);
    };

    const handleSaved = (savedItem) => {
        // if created add to list, if edited update
        setItems(prev => {
            const exists = prev.find(i => i._id === savedItem._id);
            if (exists) {
                return prev.map(i => i._id === savedItem._id ? savedItem : i);
            } else {
                return [savedItem, ...prev];
            }
        });
        setShowModal(false);
        setEditing(null);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this menu item?")) return;
        try {
            await API.delete(`/api/menu/${id}`);
            setItems(prev => prev.filter(i => i._id !== id));
        } catch (err) {
            alert(err.response?.data?.message || err.message);
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Manage Menu</h2>
                <button onClick={handleCreateClick} className="px-4 py-2 bg-rose-500 text-white rounded-lg">Add Item</button>
            </div>

            {loading ? <div>Loading...</div> : (
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map(it => (
                        <div key={it._id} className="bg-white rounded-lg p-4 shadow flex flex-col">
                            <div className="h-36 mb-3 bg-gray-100 rounded overflow-hidden">
                                {it.imageUrl ? <img src={it.imageUrl} alt={it.name} className="w-full h-full object-cover" /> : null}
                            </div>
                            <h3 className="font-semibold">{it.name}</h3>
                            <div className="text-sm text-gray-500 mb-2">{it.category}</div>
                            <div className="flex items-center justify-between mt-auto">
                                <div className="font-bold">₹{it.price}</div>
                                <div className="flex gap-2">
                                    <button onClick={() => { setEditing(it); setShowModal(true); }} className="px-3 py-1 border rounded">Edit</button>
                                    <button onClick={() => handleDelete(it._id)} className="px-3 py-1 border rounded text-red-600">Delete</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && <AddEditMenuModal item={editing} onClose={() => setShowModal(false)} onSaved={handleSaved} />}
        </div>
    );
}
