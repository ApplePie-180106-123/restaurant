// src/components/MenuDetailModal.jsx
import React, { useContext, useState, useEffect } from "react";
import { CartContext } from "../context/CartContext";
import API from "../api"; // Assuming your API client is imported here

const MenuDetailModal = ({ item, onClose, isEditing = false, onUpdateItem }) => {
    const { addItem } = useContext(CartContext);
    const [qty, setQty] = useState(1);

    // State for the Edit Form
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: 0,
        category: "",
        availability: true,
        imageUrl: ""
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // State to manage which tab is visible inside the modal (only relevant if isEditing is true)
    const [activeTab, setActiveTab] = useState(isEditing ? 'edit' : 'view');

    // Populate form data when the component mounts or item/isEditing changes
    useEffect(() => {
        if (item) {
            setQty(1); // Reset quantity on item change
            setActiveTab(isEditing ? 'edit' : 'view');

            if (isEditing) {
                setFormData({
                    name: item.name || "",
                    description: item.description || "",
                    price: item.price || 0,
                    category: item.category || "",
                    availability: item.availability !== undefined ? item.availability : true,
                    imageUrl: item.imageUrl || ""
                });
            }
        }
    }, [item, isEditing]);


    if (!item) return null;

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (loading) return;
        setLoading(true);
        setError(null);

        try {
            // Convert price to number and ensure availability is boolean
            const payload = {
                ...formData,
                price: parseFloat(formData.price),
                availability: Boolean(formData.availability)
            };

            const res = await API.put(`/api/menu/${item._id}`, payload);

            onUpdateItem(res.data);
            // Modal is closed via onUpdateItem success callback in Menu.jsx
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update item.");
        } finally {
            setLoading(false);
        }
    };


    // --- VIEW MODE RENDER ---
    const renderViewMode = () => (
        <div className="flex gap-6">
            <div className="w-2/5">
                {item.imageUrl
                    ? <img src={item.imageUrl} alt={item.name} className="w-full h-64 object-cover rounded-xl shadow-lg" />
                    : <div className="w-full h-64 bg-gray-200 rounded-xl flex items-center justify-center text-gray-500 font-medium">No Image</div>
                }
            </div>
            <div className="w-3/5 flex flex-col justify-between">
                <div>
                    <h3 className="text-3xl font-bold text-gray-900">{item.name}</h3>
                    <div className="text-base text-rose-600 font-semibold mt-1">{item.category}</div>
                    <p className="mt-3 text-gray-700 text-sm">{item.description || "A delicious item served fresh."}</p>

                    <div className="mt-4 flex items-center gap-3">
                        <div className="text-3xl font-extrabold text-green-700">₹{item.price.toFixed(2)}</div>
                        {!item.availability && <span className="text-sm font-semibold text-red-500 bg-red-100 px-3 py-1 rounded-full">SOLD OUT</span>}
                    </div>
                </div>


                <div className="mt-6 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 border border-gray-300 rounded-lg p-1">
                            <button
                                onClick={() => setQty(q => Math.max(1, q - 1))}
                                className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-md"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"></path></svg>
                            </button>
                            <div className="font-semibold text-lg w-6 text-center">{qty}</div>
                            <button
                                onClick={() => setQty(q => q + 1)}
                                className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-md"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                            </button>
                        </div>

                        <button
                            onClick={() => { addItem(item, qty); onClose(); }}
                            className={`px-6 py-3 text-white font-semibold rounded-full transition shadow-md ${item.availability ? 'bg-rose-500 hover:bg-rose-600' : 'bg-gray-400 cursor-not-allowed'}`}
                            disabled={!item.availability}
                        >
                            {item.availability ? `Add ${qty} to Cart` : "Unavailable"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    // --- ENHANCED EDIT MODE RENDER (Admin Only) ---
    const renderEditMode = () => (
        <form onSubmit={handleSave} className="space-y-6 flex flex-col h-full">
            <h3 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-3">
                Edit Item Details 🛠️
            </h3>

            {/* Scrollable Form Content */}
            <div className="flex-grow overflow-y-auto pr-4 space-y-6">
                {/* Grid for Name, Price, Category, Availability */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">

                    {/* 1. Name */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1">
                            Item Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 rounded-xl shadow-sm p-3 placeholder-gray-400 focus:ring-rose-500 focus:border-rose-500 transition duration-150"
                        />
                    </div>

                    {/* 2. Price */}
                    <div>
                        <label htmlFor="price" className="block text-sm font-semibold text-gray-700 mb-1">
                            Price (₹)
                        </label>
                        <input
                            type="number"
                            id="price"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            required
                            min="0"
                            step="0.01"
                            className="w-full border border-gray-300 rounded-xl shadow-sm p-3 placeholder-gray-400 focus:ring-rose-500 focus:border-rose-500 transition duration-150"
                        />
                    </div>

                    {/* 3. Category */}
                    <div>
                        <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-1">
                            Category
                        </label>
                        <input
                            type="text"
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-xl shadow-sm p-3 placeholder-gray-400 focus:ring-rose-500 focus:border-rose-500 transition duration-150"
                        />
                    </div>

                    {/* 4. Availability Toggle (Switch-like) */}
                    <div className="flex items-center pt-2">
                        <label htmlFor="availability" className="flex items-center cursor-pointer">
                            <div className="relative">
                                <input
                                    id="availability"
                                    type="checkbox"
                                    name="availability"
                                    checked={formData.availability}
                                    onChange={handleChange}
                                    className="sr-only"
                                />
                                <div className={`block w-14 h-8 rounded-full ${formData.availability ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition transform ${formData.availability ? 'translate-x-full' : 'translate-x-0'}`}></div>
                            </div>
                            <div className="ml-4 text-base font-semibold text-gray-900">
                                {formData.availability ? 'Available' : 'Unavailable'}
                            </div>
                        </label>
                    </div>

                </div>

                {/* 5. Image URL */}
                <div className="mt-6">
                    <label htmlFor="imageUrl" className="block text-sm font-semibold text-gray-700 mb-1">
                        Image URL
                    </label>
                    <input
                        type="text"
                        id="imageUrl"
                        name="imageUrl"
                        value={formData.imageUrl}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-xl shadow-sm p-3 placeholder-gray-400 focus:ring-rose-500 focus:border-rose-500 transition duration-150"
                    />
                </div>

                {/* 6. Description */}
                <div>
                    <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-1">
                        Description
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="4"
                        className="w-full border border-gray-300 rounded-xl shadow-sm p-3 placeholder-gray-400 focus:ring-rose-500 focus:border-rose-500 transition duration-150 resize-none"
                    ></textarea>
                </div>

                {/* Error Message */}
                {error && <div className="mt-4 text-red-600 text-sm bg-red-100 p-3 rounded-lg border border-red-300">{error}</div>}
            </div> {/* End of scrollable area */}

            {/* Action Buttons (Sticky Footer - Always visible) */}
            <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end gap-3 flex-shrink-0">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-3 border border-gray-300 rounded-full text-gray-700 font-semibold hover:bg-gray-100 transition duration-150"
                    disabled={loading}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-6 py-3 bg-rose-500 text-white font-semibold rounded-full hover:bg-rose-600 transition duration-150 shadow-lg shadow-rose-200 disabled:bg-gray-400"
                    disabled={loading}
                >
                    {loading ? "Saving Changes..." : "Save Changes"}
                </button>
            </div>
        </form>
    );

    // --- MAIN RENDER ---
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

            {/* Modal Content */}
            {/* Added max-h-5/6 and h-full to the modal body to enable internal scrolling */}
            <div className="bg-white rounded-2xl shadow-2xl z-10 max-w-4xl w-full p-6 max-h-[90vh] h-full transform scale-100 transition-transform duration-300 ease-out flex flex-col">

                {/* Tab Navigation (for admin context) */}
                {isEditing && (
                    <div className="flex border-b border-gray-200 mb-6 flex-shrink-0">
                        <button
                            onClick={() => setActiveTab('view')}
                            className={`px-4 py-2 text-lg font-medium transition ${activeTab === 'view' ? 'text-rose-600 border-b-2 border-rose-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            View Details
                        </button>
                        <button
                            onClick={() => setActiveTab('edit')}
                            className={`px-4 py-2 text-lg font-medium transition ${activeTab === 'edit' ? 'text-rose-600 border-b-2 border-rose-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Admin Edit Mode
                        </button>
                    </div>
                )}

                {/* Render content based on active tab */}
                <div className="flex-grow overflow-hidden">
                    {activeTab === 'view' ? renderViewMode() : renderEditMode()}
                </div>

                {/* Close button for non-edit mode if no tabs are shown */}
                {!isEditing && (
                    <div className="absolute top-4 right-4">
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 p-2 rounded-full bg-gray-50 transition"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
};

export default MenuDetailModal;