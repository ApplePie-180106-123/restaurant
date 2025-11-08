// src/components/MenuDetailModal.jsx
import React, { useContext, useState } from "react";
import { CartContext } from "../context/CartContext";

const MenuDetailModal = ({ item, onClose }) => {
    const { addItem } = useContext(CartContext);
    const [qty, setQty] = useState(1);

    if (!item) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>
            <div className="bg-white rounded-lg shadow-lg z-10 max-w-2xl w-full p-4">
                <div className="flex gap-4">
                    <div className="w-1/3">
                        {item.imageUrl ? <img src={item.imageUrl} alt={item.name} className="w-full h-48 object-cover rounded" /> : <div className="h-48 bg-gray-100 rounded" />}
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold">{item.name}</h3>
                        <div className="text-sm text-gray-500">{item.category}</div>
                        <p className="mt-2 text-sm text-gray-700">{item.description || "Tasty."}</p>

                        <div className="mt-4 flex items-center gap-3">
                            <div className="text-xl font-bold">₹{item.price}</div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-2 py-1 border rounded">-</button>
                                <div className="px-3 py-1 border rounded">{qty}</div>
                                <button onClick={() => setQty(q => q + 1)} className="px-2 py-1 border rounded">+</button>
                            </div>
                        </div>

                        <div className="mt-4 flex gap-2">
                            <button onClick={() => { addItem(item, qty); onClose(); }} className="px-4 py-2 bg-rose-500 text-white rounded">Add to Cart</button>
                            <button onClick={onClose} className="px-4 py-2 border rounded">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MenuDetailModal;
