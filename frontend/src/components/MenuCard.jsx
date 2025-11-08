// src/components/MenuCard.jsx
import React, { useState, useContext } from "react";
import { CartContext } from "../context/CartContext";
import API from "../api";
import { AuthContext } from "../context/AuthContext";

const MenuCard = ({ item, onDelete = () => { }, onEdit = () => { }, onView = () => { } }) => {
    const { addItem } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const [qty, setQty] = useState(1);
    const [adding, setAdding] = useState(false);

    const handleAdd = async () => {
        setAdding(true);
        addItem(item, qty);
        // small delay to show action effect
        setTimeout(() => setAdding(false), 300);
    };

    const isAdmin = user?.role === "admin";

    return (
        <div className="bg-white border rounded-lg shadow-sm overflow-hidden flex flex-col">
            <div className="h-40 w-full bg-gray-100 flex items-center justify-center">
                {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="h-full object-cover w-full" />
                ) : (
                    <div className="text-gray-400">No image</div>
                )}
            </div>

            <div className="p-3 flex-1 flex flex-col">
                <div className="flex justify-between items-start gap-2">
                    <div>
                        <h4 className="font-semibold text-sm">{item.name}</h4>
                        <div className="text-xs text-gray-500">{item.category}</div>
                    </div>
                    <div className="text-lg font-semibold">₹{item.price}</div>
                </div>

                <p className="text-xs text-gray-600 mt-2 line-clamp-3">{item.description || "Delicious item."}</p>

                <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-2 py-1 border rounded">-</button>
                        <div className="px-3 py-1 border rounded">{qty}</div>
                        <button onClick={() => setQty(q => q + 1)} className="px-2 py-1 border rounded">+</button>
                    </div>

                    <div className="flex items-center gap-2">
                        <button onClick={handleAdd} disabled={!item.availability || adding} className={`px-3 py-1 rounded ${item.availability ? "bg-rose-500 text-white" : "bg-gray-200 text-gray-500"}`}>
                            {adding ? "Adding..." : "Add"}
                        </button>

                        <button onClick={() => onView(item)} className="px-2 py-1 border rounded text-sm">View</button>
                    </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs">
                    <div className={`${item.availability ? "text-green-600" : "text-red-500"}`}>
                        {item.availability ? "Available" : "Out of stock"}
                    </div>

                    {isAdmin && (
                        <div className="flex items-center gap-2">
                            <button onClick={() => onEdit(item)} className="text-sm px-2 py-1 border rounded">Edit</button>
                            <button onClick={() => onDelete(item)} className="text-sm px-2 py-1 border rounded text-red-600">Delete</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MenuCard;
