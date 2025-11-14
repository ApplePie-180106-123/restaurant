import React, { useEffect, useState } from "react";
import API from "../../api"; // Your Axios instance
import { FaTrash, FaEdit, FaPlus } from 'react-icons/fa';

// --- Reusable Modal Wrapper (Defined inline for simplicity) ---
// You will still need a simple global Modal component (src/components/Modal.jsx) 
// or integrate this logic into a simple div/dialog element.
// NOTE: I am assuming you have a basic Modal component defined elsewhere.
const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-xl">
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h3 className="text-xl font-bold text-gray-800">{title}</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-800 text-2xl font-semibold"
                    >
                        &times;
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
};
// ------------------------------------------------------------------

const units = ['kg', 'g', 'ml', 'L', 'unit', 'pack', 'bottle'];

// --- Inline Modal Content Component ---
const AddEditForm = ({ itemToEdit, onSuccess, onClose }) => {
    const [formData, setFormData] = useState({
        name: '',
        unit: units[0],
        stockLevel: 0,
        minStock: 10,
        category: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Reset or populate form when itemToEdit changes
        if (itemToEdit) {
            setFormData({
                name: itemToEdit.name,
                unit: itemToEdit.unit,
                stockLevel: itemToEdit.stockLevel,
                minStock: itemToEdit.minStock,
                category: itemToEdit.category,
            });
        } else {
            setFormData({
                name: '',
                unit: units[0],
                stockLevel: 0,
                minStock: 10,
                category: '',
            });
        }
        setError(null);
    }, [itemToEdit]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'stockLevel' || name === 'minStock' ? Number(value) : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (itemToEdit) {
                // UPDATE (PUT)
                await API.put(`/api/inventory/${itemToEdit._id}`, formData);
                alert(`Updated stock for ${formData.name}`);
            } else {
                // CREATE (POST)
                await API.post('/api/inventory', formData);
                alert(`Added new stock item: ${formData.name}`);
            }
            onSuccess(); // Close modal and trigger list refresh
        } catch (err) {
            setError(err.response?.data?.message || 'Submission failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="p-2 text-sm text-red-700 bg-red-100 rounded">{error}</div>}

            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    required
                />
            </div>

            <div className="flex gap-4">
                <div className="w-1/2">
                    <label htmlFor="stockLevel" className="block text-sm font-medium text-gray-700">Stock Level</label>
                    <input
                        type="number"
                        id="stockLevel"
                        name="stockLevel"
                        value={formData.stockLevel}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        required
                        min="0"
                    />
                </div>
                <div className="w-1/2">
                    <label htmlFor="unit" className="block text-sm font-medium text-gray-700">Unit</label>
                    <select
                        id="unit"
                        name="unit"
                        value={formData.unit}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        required
                    >
                        {units.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                </div>
            </div>

            <div className="flex gap-4">
                <div className="w-1/2">
                    <label htmlFor="minStock" className="block text-sm font-medium text-gray-700">Minimum Stock Alert</label>
                    <input
                        type="number"
                        id="minStock"
                        name="minStock"
                        value={formData.minStock}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        required
                        min="0"
                    />
                </div>
                <div className="w-1/2">
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                    <input
                        type="text"
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    />
                </div>
            </div>

            <div className="pt-4 flex justify-end">
                <button
                    type="button"
                    onClick={onClose}
                    className="mr-2 px-4 py-2 text-gray-700 border rounded shadow transition hover:bg-gray-100"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className={`px-4 py-2 text-white rounded shadow transition ${loading ? 'bg-gray-400' : 'bg-rose-600 hover:bg-rose-700'}`}
                >
                    {loading ? 'Saving...' : itemToEdit ? 'Update Stock' : 'Add Stock'}
                </button>
            </div>
        </form>
    );
};
// ------------------------------------------------------------------


// --- Main Page Component ---
export default function InventoryManager() {
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const fetchInventory = async () => {
        try {
            setLoading(true);
            const res = await API.get("/api/inventory");
            setInventory(res.data);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch inventory.");
            setInventory([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    // --- CRUD Handlers ---

    const handleAddItem = () => {
        setEditingItem(null);
        setIsModalOpen(true);
    };

    const handleEditItem = (item) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleDeleteItem = async (id, name) => {
        if (window.confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
            try {
                await API.delete(`/api/inventory/${id}`);
                alert("Stock item deleted successfully.");
                fetchInventory(); // Re-fetch the data to update the table
            } catch (err) {
                alert(err.response?.data?.message || "Failed to delete item.");
            }
        }
    };

    const handleModalSubmitSuccess = () => {
        setIsModalOpen(false);
        fetchInventory();
    };

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">📦 Inventory Management</h2>
                <button
                    onClick={handleAddItem}
                    className="flex items-center bg-rose-600 text-white px-4 py-2 rounded shadow hover:bg-rose-700 transition"
                >
                    <FaPlus className="mr-2" /> Add New Stock
                </button>
            </div>

            {loading ? (
                <div className="text-center text-gray-600 py-10">Loading inventory...</div>
            ) : error ? (
                <div className="text-center text-red-600 py-10">{error}</div>
            ) : inventory.length === 0 ? (
                <div className="text-center text-gray-600 py-10">No stock items found.</div>
            ) : (
                <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-100">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Name</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Category</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Current Stock</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Min Stock Alert</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {inventory.map((item) => {
                                const isLowStock = item.stockLevel <= item.minStock;
                                return (
                                    <tr
                                        key={item._id}
                                        className={isLowStock ? "bg-red-50 hover:bg-red-100 transition" : "hover:bg-gray-50"}
                                    >
                                        <td className="px-4 py-3 text-sm font-medium text-gray-800">{item.name}</td>
                                        <td className="px-4 py-3 text-sm text-gray-700">{item.category}</td>
                                        <td className="px-4 py-3 text-sm text-gray-700">{item.stockLevel} {item.unit}</td>
                                        <td className="px-4 py-3 text-sm text-gray-700">{item.minStock} {item.unit}</td>
                                        <td className="px-4 py-3 text-sm">
                                            {isLowStock ? (
                                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-200 text-red-800">LOW STOCK</span>
                                            ) : (
                                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">OK</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm flex gap-3">
                                            <button onClick={() => handleEditItem(item)} className="text-blue-600 hover:text-blue-800">
                                                <FaEdit title="Edit Stock" />
                                            </button>
                                            <button onClick={() => handleDeleteItem(item._id, item.name)} className="text-red-600 hover:text-red-800">
                                                <FaTrash title="Delete Stock" />
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* The Modal Rendering */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingItem ? 'Edit Stock Item' : 'Add New Stock Item'}
            >
                <AddEditForm
                    itemToEdit={editingItem}
                    onSuccess={handleModalSubmitSuccess}
                    onClose={() => setIsModalOpen(false)}
                />
            </Modal>
        </div>
    );
}