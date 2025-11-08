// src/context/CartContext.jsx
import React, { createContext, useEffect, useState, useContext } from "react";
import API from "../api";
import { AuthContext } from "./AuthContext"; // path depends; yours is ../context/AuthContext.jsx

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const { token, user } = useContext(AuthContext);
    const [cart, setCart] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("rms_cart")) || [];
        } catch {
            return [];
        }
    });
    const [placingOrder, setPlacingOrder] = useState(false);

    useEffect(() => {
        localStorage.setItem("rms_cart", JSON.stringify(cart));
    }, [cart]);

    const addItem = (item, qty = 1) => {
        setCart(prev => {
            const found = prev.find(i => i._id === item._id);
            if (found) {
                return prev.map(i => i._id === item._id ? { ...i, qty: i.qty + qty } : i);
            } else {
                return [...prev, { ...item, qty }];
            }
        });
    };

    const updateQty = (id, qty) => {
        if (qty <= 0) return removeItem(id);
        setCart(prev => prev.map(i => i._id === id ? { ...i, qty } : i));
    };

    const removeItem = (id) => {
        setCart(prev => prev.filter(i => i._id !== id));
    };

    const clearCart = () => setCart([]);

    // placeOrder: maps items to backend structure and calls POST /api/orders
    // expects optional tableNumber (for dine-in) and optional customerId
    const placeOrder = async ({ tableNumber = null, customerId = null } = {}) => {
        if (cart.length === 0) throw new Error("Cart is empty");
        setPlacingOrder(true);
        try {
            const items = cart.map(i => ({ menuItem: i._id, quantity: i.qty }));
            const body = { tableNumber, items, customerId: customerId || (user?._id || null) };
            const { data } = await API.post("/api/orders", body);
            setPlacingOrder(false);
            clearCart();
            return { ok: true, data };
        } catch (err) {
            setPlacingOrder(false);
            return { ok: false, error: err.response?.data?.message || err.message };
        }
    };

    const subtotal = cart.reduce((s, i) => s + (i.price || 0) * (i.qty || 0), 0);

    return (
        <CartContext.Provider value={{
            cart, addItem, updateQty, removeItem, clearCart,
            subtotal, placeOrder, placingOrder
        }}>
            {children}
        </CartContext.Provider>
    );
};
