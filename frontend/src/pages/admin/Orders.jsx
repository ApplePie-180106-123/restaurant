// frontend/src/pages/admin/Orders.jsx
import React, { useEffect, useState, useRef, useContext } from "react";
import API from "../../api";
import dayjs from "dayjs";
import { AuthContext } from "../../context/AuthContext";

export default function Orders() {
    const { user } = useContext(AuthContext); // <-- role detection (cashier/admin/etc)

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updating, setUpdating] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [highlighted, setHighlighted] = useState([]);
    const intervalRef = useRef(null);

    const statuses = ["Pending", "Preparing", "Served", "Paid"];

    // --- Fetch all orders ---
    const fetchOrders = async (showHighlight = false) => {
        try {
            setLoading(true);
            const res = await API.get("/api/orders");
            const newOrders = res.data || [];

            if (showHighlight && orders.length > 0) {
                const existingIds = new Set(orders.map((o) => o._id));
                const newOnes = newOrders
                    .filter((o) => !existingIds.has(o._id))
                    .map((o) => o._id);
                if (newOnes.length > 0) {
                    setHighlighted(newOnes);
                    setTimeout(() => setHighlighted([]), 5000); // glow for 5s
                }
            }

            setOrders(newOrders);
            setLastUpdated(dayjs().format("hh:mm:ss A"));
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();

        // Auto refresh every 10s
        // intervalRef.current = setInterval(() => fetchOrders(true), 10000);
        // return () => clearInterval(intervalRef.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // --- Update order status ---
    const updateStatus = async (orderId, newStatus) => {
        try {
            setUpdating(true);
            const res = await API.put(`/api/orders/${orderId}/status`, { status: newStatus });
            // backend returns updated order or at least the status
            setOrders((prev) =>
                prev.map((o) => (o._id === orderId ? { ...o, status: res.data.status || newStatus } : o))
            );
        } catch (err) {
            alert(err.response?.data?.message || "Failed to update status");
        } finally {
            setUpdating(false);
        }
    };

    // --- Cashier actions: refund, cancel, print invoice ---
    const handleRefund = async (orderId) => {
        if (!window.confirm("Are you sure you want to refund this order? This will mark payment as refunded.")) return;
        try {
            const res = await API.put(`/api/orders/${orderId}/refund`);
            // update local order with returned data if available
            const updated = res.data || null;
            setOrders((prev) => prev.map((o) => (o._id === orderId ? (updated || { ...o, payment: { ...(o.payment || {}), status: "Refunded" }, status: "Refunded" }) : o)));
            alert("Refund processed.");
        } catch (err) {
            alert(err.response?.data?.message || "Refund failed");
        }
    };

    const handleCancel = async (orderId) => {
        if (!window.confirm("Are you sure you want to cancel this order?")) return;
        try {
            const res = await API.put(`/api/orders/${orderId}/cancel`);
            const updated = res.data || null;
            setOrders((prev) => prev.map((o) => (o._id === orderId ? (updated || { ...o, status: "Cancelled" }) : o)));
            alert("Order cancelled.");
        } catch (err) {
            alert(err.response?.data?.message || "Cancel failed");
        }
    };

    const handlePrint = (orderId) => {
        // this expects a printable frontend route or backend invoice endpoint
        // if you implement a frontend printable route use: window.open(`/orders/${orderId}/invoice`, '_blank')
        // if you have backend endpoint that returns printable page: window.open(`${API_BASE_URL}/api/orders/${orderId}/invoice`, '_blank')
        // For now open a new tab to a frontend route where you can implement invoice UI.
        window.open(`/orders/${orderId}/invoice`, "_blank");
    };

    const getStatusBadge = (status) => {
        const colors = {
            Pending: "bg-yellow-100 text-yellow-700",
            Preparing: "bg-blue-100 text-blue-700",
            Served: "bg-green-100 text-green-700",
            Paid: "bg-gray-100 text-gray-700",
            Cancelled: "bg-red-100 text-red-700",
            Refunded: "bg-red-100 text-red-700",
        };
        const cls = colors[status] || "bg-gray-100 text-gray-700";
        return (
            <span className={`px-3 py-1 text-xs font-medium rounded-full ${cls}`}>
                {status}
            </span>
        );
    };

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Order Management</h2>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
                        Auto-refreshing every 10s
                    </div>
                    <span className="text-gray-400">|</span>
                    <span>Last updated: {lastUpdated || "just now"}</span>
                </div>
            </div>

            {loading ? (
                <div className="text-center text-gray-600 py-10">Loading orders...</div>
            ) : error ? (
                <div className="text-center text-red-600 py-10">{error}</div>
            ) : orders.length === 0 ? (
                <div className="text-center text-gray-600 py-10">No orders found.</div>
            ) : (
                <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-100">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">#</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Table</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Customer</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Items</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Total</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Time</th>

                                {/* existing action header */}
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Action</th>

                                {/* cashier actions header - only visible for cashier/admin */}
                                {(user?.role === "cashier" || user?.role === "admin") && (
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Cashier Actions</th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {orders.slice().reverse().map((order, i) => (
                                <tr
                                    key={order._id}
                                    className={`transition-all ${highlighted.includes(order._id) ? "bg-rose-50 animate-pulse" : "hover:bg-gray-50"
                                        }`}
                                >
                                    <td className="px-4 py-3 text-sm text-gray-700">{i + 1}</td>
                                    <td className="px-4 py-3 text-sm text-gray-700">{order.tableNumber || "—"}</td>
                                    <td className="px-4 py-3 text-sm text-gray-700">{order.customer?.name || "Guest"}</td>
                                    <td className="px-4 py-3 text-sm text-gray-700">
                                        {order.items.map((it) => (
                                            <div key={it._id}>
                                                {it.menuItem?.name || "Item"} × {it.quantity}
                                            </div>
                                        ))}
                                    </td>
                                    <td className="px-4 py-3 text-sm font-semibold text-gray-800">₹{order.total?.toFixed(2)}</td>
                                    <td className="px-4 py-3 text-sm">{getStatusBadge(order.status)}</td>
                                    <td className="px-4 py-3 text-sm text-gray-500">{dayjs(order.createdAt).format("hh:mm A")}</td>

                                    {/* existing action: status dropdown */}
                                    <td className="px-4 py-3 text-sm">
                                        <select
                                            value={order.status}
                                            onChange={(e) => updateStatus(order._id, e.target.value)}
                                            disabled={updating}
                                            className="border rounded px-2 py-1 text-sm focus:ring-rose-400 focus:outline-none"
                                        >
                                            {statuses.map((s) => (
                                                <option key={s}>{s}</option>
                                            ))}
                                        </select>
                                    </td>

                                    {/* cashier actions column (Refund / Cancel / Receipt) */}
                                    {(user?.role === "cashier" || user?.role === "admin") && (
                                        <td className="px-4 py-3 text-sm flex gap-2">
                                            {/* Refund: only if paid */}
                                            {order.payment?.status === "Paid" ? (
                                                <button
                                                    onClick={() => handleRefund(order._id)}
                                                    className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded"
                                                >
                                                    Refund
                                                </button>
                                            ) : null}

                                            {/* Cancel: only if not served or already cancelled */}
                                            {order.status !== "Served" && order.status !== "Cancelled" ? (
                                                <button
                                                    onClick={() => handleCancel(order._id)}
                                                    className="px-2 py-1 text-xs border rounded"
                                                >
                                                    Cancel
                                                </button>
                                            ) : null}

                                            {/* Print / Receipt */}
                                            <button
                                                onClick={() => handlePrint(order._id)}
                                                className="px-2 py-1 text-xs bg-rose-500 text-white rounded"
                                            >
                                                Receipt
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
