// src/components/AddEditMenuModal.jsx
import React, { useState } from "react";
import API from "../api";

export default function AddEditMenuModal({ item = null, onClose = () => { }, onSaved = () => { } }) {
    const [form, setForm] = useState({
        name: item?.name || "",
        description: item?.description || "",
        category: item?.category || "",
        price: item?.price || 0,
        availability: item?.availability ?? true,
        imageUrl: item?.imageUrl || ""
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const onChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true); setError(null);
        try {
            if (item) {
                const { data } = await API.put(`/api/menu/${item._id}`, form);
                onSaved(data);
            } else {
                const { data } = await API.post("/api/menu", form);
                onSaved(data);
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="bg-white rounded-lg shadow-lg p-6 z-10 w-full max-w-xl">
                <h3 className="text-lg font-semibold mb-3">{item ? "Edit Menu Item" : "Add Menu Item"}</h3>

                {error && <div className="mb-3 text-red-600">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                        <label className="form-label">Name</label>
                        <input name="name" value={form.name} onChange={onChange} required className="form-control" />
                    </div>

                    <div>
                        <label className="form-label">Category</label>
                        <input name="category" value={form.category} onChange={onChange} required className="form-control" />
                    </div>

                    <div>
                        <label className="form-label">Price (INR)</label>
                        <input name="price" value={form.price} onChange={onChange} type="number" min="0" required className="form-control" />
                    </div>

                    <div>
                        <label className="form-label">Image URL (optional)</label>
                        <input name="imageUrl" value={form.imageUrl} onChange={onChange} className="form-control" />
                    </div>

                    <div>
                        <label className="form-label">Description</label>
                        <textarea name="description" value={form.description} onChange={onChange} className="form-control" rows="3" />
                    </div>

                    <div className="flex items-center gap-3">
                        <input type="checkbox" id="avail" name="availability" checked={form.availability} onChange={onChange} />
                        <label htmlFor="avail" className="text-sm">Available</label>
                    </div>

                    <div className="flex items-center justify-end gap-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 border rounded">Cancel</button>
                        <button type="submit" disabled={saving} className="px-4 py-2 bg-rose-500 text-white rounded">{saving ? "Saving..." : (item ? "Save" : "Create")}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
