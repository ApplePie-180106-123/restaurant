// frontend/src/pages/admin/AddMenuItem.jsx
import React, { useState } from "react";
import API from "../../api";
import { useNavigate } from "react-router-dom";

export default function AddMenuItem() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        description: "",
        category: "",
        price: "",
        availability: true,
        imageUrl: ""
    });

    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    const onChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    };

    const onFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            // clear imageUrl input if a file is chosen
            setForm(prev => ({ ...prev, imageUrl: "" }));
        }
    };

    const uploadFile = async () => {
        if (!file) return null;
        setUploading(true);
        setError(null);
        try {
            const fd = new FormData();
            fd.append("image", file);
            // API will attach Authorization header via interceptor
            const res = await API.post("/api/uploads", fd, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            // backend should return { imageUrl: "/uploads/..." } or full URL
            setUploading(false);
            return res.data.imageUrl;
        } catch (err) {
            setUploading(false);
            throw new Error(err.response?.data?.message || err.message || "Upload failed");
        }
    };

    const validate = () => {
        if (!form.name.trim()) return "Name is required";
        if (!form.category.trim()) return "Category is required";
        if (form.price === "" || isNaN(Number(form.price)) || Number(form.price) < 0) return "Price must be a non-negative number";
        // either imageUrl or file is optional — no validation enforced here
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMsg(null);

        const v = validate();
        if (v) { setError(v); return; }

        setSaving(true);
        try {
            let imageUrlToSend = form.imageUrl?.trim() || "";

            if (file && !imageUrlToSend) {
                // first upload file
                imageUrlToSend = await uploadFile();
            }

            const payload = {
                name: form.name,
                description: form.description,
                category: form.category,
                price: Number(form.price),
                availability: Boolean(form.availability),
                imageUrl: imageUrlToSend || ""
            };

            const { data } = await API.post("/api/menu", payload);
            setSuccessMsg("Menu item created successfully");
            setForm({
                name: "",
                description: "",
                category: "",
                price: "",
                availability: true,
                imageUrl: ""
            });
            setFile(null);

            // optional: navigate back to admin list or to the newly created item
            setTimeout(() => navigate("/admin/menu"), 800);

        } catch (err) {
            setError(err.response?.data?.message || err.message || "Failed to create menu item");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-4">Add Menu Item</h2>

            {error && <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-100 p-3 rounded">{error}</div>}
            {successMsg && <div className="mb-4 text-sm text-green-800 bg-green-50 border border-green-100 p-3 rounded">{successMsg}</div>}

            <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
                <div>
                    <label className="block text-sm font-medium mb-1">Name *</label>
                    <input name="name" value={form.name} onChange={onChange} className="w-full border rounded px-3 py-2" required />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Category *</label>
                    <input name="category" value={form.category} onChange={onChange} className="w-full border rounded px-3 py-2" placeholder="e.g., Main Course, Starters" required />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Price (INR) *</label>
                        <input name="price" value={form.price} onChange={onChange} type="number" step="0.01" min="0" className="w-full border rounded px-3 py-2" required />
                    </div>

                    <div className="flex items-center gap-3">
                        <input id="avail" name="availability" type="checkbox" checked={form.availability} onChange={onChange} className="w-4 h-4" />
                        <label htmlFor="avail" className="text-sm">Available</label>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea name="description" value={form.description} onChange={onChange} rows="3" className="w-full border rounded px-3 py-2" />
                </div>

                <div>
                    <div className="text-sm font-medium mb-1">Image (URL or upload)</div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input name="imageUrl" value={form.imageUrl} onChange={onChange} placeholder="Paste image URL (optional)" className="w-full border rounded px-3 py-2" />

                        <label className="flex items-center gap-3 border rounded p-2 cursor-pointer bg-gray-50">
                            <svg className="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7" /><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M16 3v4M8 3v4" /></svg>
                            <span className="text-sm text-gray-700">Upload file (optional)</span>
                            <input type="file" accept="image/*" onChange={onFileChange} className="hidden" />
                        </label>
                    </div>

                    {file && (
                        <div className="mt-2 text-sm text-gray-600">Selected file: <span className="font-medium">{file.name}</span></div>
                    )}
                </div>

                <div className="flex items-center justify-end gap-3">
                    <button type="button" onClick={() => navigate("/admin/menu")} className="px-4 py-2 border rounded">Cancel</button>
                    <button type="submit" disabled={saving || uploading} className="px-4 py-2 bg-rose-500 text-white rounded hover:bg-rose-600">
                        {saving ? "Saving..." : "Create Item"}
                    </button>
                </div>

                {(uploading || saving) && (
                    <div className="mt-2 text-sm text-gray-600">
                        {uploading && "Uploading image... "} {saving && "Saving item..."}
                    </div>
                )}
            </form>

            <div className="mt-6 text-xs text-gray-500">
                Note: This page posts to <code className="bg-gray-100 px-1 py-0.5 rounded">POST /api/menu</code>. If you use file upload, the file is posted first to <code className="bg-gray-100 px-1 py-0.5 rounded">POST /api/uploads</code> which should return <code>{`{ imageUrl: "/uploads/..." }`}</code>.
            </div>
        </div>
    );
}
