import React, { useEffect, useState, useRef, useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom"; // 1. Import useNavigate
import API from "../../api";
import dayjs from "dayjs";
import { AuthContext } from "../../context/AuthContext";

// --- Bill Modal Component (Defined inside Orders.jsx) ---
const BillModal = ({ order, onClose }) => {
    if (!order) return null;

    // ... (BillModal content remains the same)
    const subtotal = order.total / (1 + (order.taxRate || 0) / 100);
    const taxAmount = order.total - subtotal;

    return (
        // Modal Overlay
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={onClose}>
            {/* Modal Content - Receipt Style */}
            <div className="bg-white p-6 rounded-lg shadow-2xl max-w-sm w-full font-mono relative" onClick={e => e.stopPropagation()}>
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-900 text-2xl font-bold"
                >
                    &times;
                </button>

                <div className="text-center border-b pb-4 mb-4">
                    <h1 className="text-xl font-bold text-gray-800">Your Restaurant Name</h1>
                    <p className="text-xs text-gray-500">Invoice No: {order._id.substring(order._id.length - 8).toUpperCase()}</p>
                </div>

                <div className="text-sm space-y-1 mb-4">
                    <p><strong>Order Type:</strong> {order.tableNumber ? `Table ${order.tableNumber}` : 'Delivery'}</p>
                    <p><strong>Date:</strong> {dayjs(order.createdAt).format("DD MMM YYYY hh:mm A")}</p>
                    <p><strong>Customer:</strong> {order.customer?.name || "Guest"}</p>
                </div>

                {/* Items Table */}
                <table className="min-w-full text-sm mb-4">
                    <thead className="border-t border-b border-gray-300">
                        <tr>
                            <th className="py-2 text-left">Item</th>
                            <th className="py-2 text-center">Qty</th>
                            <th className="py-2 text-right">Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.items.map((it, index) => (
                            <tr key={index} className="border-b border-gray-100">
                                <td className="py-1">{it.menuItem?.name || "Item"}</td>
                                <td className="py-1 text-center">{it.quantity}</td>
                                <td className="py-1 text-right">₹{(it.menuItem?.price * it.quantity)?.toFixed(2) || '0.00'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Totals Section */}
                <div className="text-sm space-y-1 border-t pt-4">
                    <div className="flex justify-between">
                        <span className="text-gray-700">Subtotal:</span>
                        <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                    </div>
                    {/* Assuming a tax rate is available or fixed, e.g., 5% */}
                    <div className="flex justify-between">
                        <span className="text-gray-700">Tax ({order.taxRate || 0}%):</span>
                        <span className="font-medium">₹{taxAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-base font-bold border-t mt-2 pt-2">
                        <span>Total Paid:</span>
                        <span>₹{order.total?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-700">Payment Status:</span>
                        <span className={`font-semibold ${order.payment?.status === 'Paid' ? 'text-green-600' : 'text-red-600'}`}>
                            {order.payment?.status || 'Unpaid'}
                        </span>
                    </div>
                </div>

                <div className="text-center mt-6 pt-4 border-t">
                    <p className="text-xs text-gray-600">Thank you for your order!</p>
                </div>

                <button
                    onClick={() => window.print()}
                    className="mt-4 w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 print:hidden"
                >
                    Print Bill
                </button>
            </div>
        </div>
    );
};
// --- End Bill Modal Component ---


export default function Orders() {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate(); // 2. Initialize useNavigate
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updating, setUpdating] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [highlighted, setHighlighted] = useState([]);
    const [selectedOrderForBill, setSelectedOrderForBill] = useState(null);
    const intervalRef = useRef(null);

    // 1. UPDATED STATUSES: Add delivery-related options
    const allStatuses = ["Pending", "Preparing", "Served", "Paid", "Out for delivery", "Delivered", "Cancelled", "Refunded"];

    // Statuses a kitchen/waiter deals with (for the dropdown)
    const waiterStatuses = ["Pending", "Preparing", "Served", "Paid"];

    // Statuses a delivery person deals with (for the dropdown)
    const deliveryStatusesForDropdown = ["Preparing", "Out for delivery", "Delivered"];

    // --- Role Definitions ---
    const userRole = user?.role;
    const isCashier = userRole === 'cashier';
    const isAdmin = userRole === 'admin';
    const isWaiter = userRole === 'waiter';
    const isDelivery = userRole === 'delivery';

    // Roles that see the Status Update column
    const canUpdateStatus = isAdmin || isWaiter || isDelivery;

    // Roles that see the Cashier Actions column
    const showCashierActions = isCashier || isAdmin;

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
        // Auto refresh logic commented out as per your file
        // intervalRef.current = setInterval(() => fetchOrders(true), 10000);
        // return () => clearInterval(intervalRef.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // --- Update order status ---
    const updateStatus = async (orderId, newStatus) => {
        try {
            setUpdating(true);
            const res = await API.put(`/api/orders/${orderId}/status`, { status: newStatus });
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
            alert("Order cancelled.Money refunded to customer");
        } catch (err) {
            alert(err.response?.data?.message || "Cancel failed");
        }
    };

    const handlePrint = (orderId) => {
        const orderToDisplay = orders.find(o => o._id === orderId);
        if (orderToDisplay) {
            setSelectedOrderForBill(orderToDisplay);
        }
    };

    const getStatusBadge = (status) => {
        const colors = {
            Pending: "bg-yellow-100 text-yellow-700",
            Preparing: "bg-blue-100 text-blue-700",
            Served: "bg-green-100 text-green-700",
            Paid: "bg-gray-100 text-gray-700",
            Cancelled: "bg-red-100 text-red-700",
            Refunded: "bg-purple-100 text-purple-700",
            'Out for delivery': "bg-indigo-100 text-indigo-700",
            Delivered: "bg-emerald-100 text-emerald-700",
        };
        const cls = colors[status] || "bg-gray-100 text-gray-700";
        return (
            <span className={`px-3 py-1 text-xs font-medium rounded-full ${cls}`}>
                {status}
            </span>
        );
    };

    // 2. ROLE FILTERING: Memoize filtered orders
    const filteredOrders = useMemo(() => {
        // Admin, Cashier, Waiter see ALL orders
        if (isAdmin || isCashier || isWaiter) {
            return orders;
        }

        if (isDelivery) {
            // Delivery person only sees orders that are ready for delivery, out, or recently delivered.
            const deliveryRelevantStatuses = ['Preparing', 'Out for delivery', 'Delivered'];
            return orders.filter(order => deliveryRelevantStatuses.includes(order.status));
        }

        // Default: see all if role is undefined or falls through (or restrict to no orders)
        return orders;
    }, [orders, isAdmin, isCashier, isDelivery, isWaiter]);


    // 3. Statuses available in the dropdown based on role
    const getAvailableStatuses = () => {
        if (isDelivery) {
            // Delivery can only change between these states (e.g., Prepared -> Out -> Delivered)
            return deliveryStatusesForDropdown.filter(s => s !== 'Pending' && s !== 'Served' && s !== 'Paid');
        } else if (isWaiter || isAdmin) {
            // Waiter and Admin use the standard kitchen/dining statuses
            return waiterStatuses;
        }
        // No status update allowed for other roles like cashier
        return [];
    };

    // Function to check if status is mutable (not final/cancelled/refunded/delivered)
    const isStatusMutable = (status) => {
        return status !== 'Cancelled' && status !== 'Refunded' && status !== 'Delivered' && status !== 'Served';
    };


    return (
        <div className="max-w-7xl mx-auto p-6">
            {/* NEW: Home Navigation Button */}
            <div className="mb-4">
                <button
                    onClick={() => navigate('/')}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition duration-150 ease-in-out flex items-center"
                >
                    🏠 Home
                </button>
            </div>

            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Order Management ({userRole ? userRole.toUpperCase() : 'STAFF'} View)</h2>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span className="text-gray-400">|</span>
                    <span>Last updated: {lastUpdated || "just now"}</span>
                </div>
            </div>

            {loading ? (
                <div className="text-center text-gray-600 py-10">Loading orders...</div>
            ) : error ? (
                <div className="text-center text-red-600 py-10">{error}</div>
            ) : filteredOrders.length === 0 ? (
                <div className="text-center text-gray-600 py-10">No relevant orders found.</div>
            ) : (
                <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-100">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">#</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Table/Location</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Customer</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Items</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Total</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Time</th>

                                {/* Action column is for status updates: Only Waiter, Delivery, Admin */}
                                {canUpdateStatus && (
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Status Update</th>
                                )}

                                {/* Cashier Actions Header: Only Cashier, Admin */}
                                {showCashierActions && (
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Cashier Actions</th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredOrders.slice().reverse().map((order, i) => (
                                <tr
                                    key={order._id}
                                    className={`transition-all ${highlighted.includes(order._id) ? "bg-rose-50 animate-pulse" : "hover:bg-gray-50"
                                        }`}
                                >
                                    <td className="px-4 py-3 text-sm text-gray-700">{i + 1}</td>
                                    <td className="px-4 py-3 text-sm text-gray-700">{order.tableNumber || "Delivery"}</td>
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

                                    {/* Action: Status Dropdown - visible if role allows updates */}
                                    {canUpdateStatus && (
                                        <td className="px-4 py-3 text-sm">
                                            <select
                                                value={order.status}
                                                onChange={(e) => updateStatus(order._id, e.target.value)}
                                                // Disable dropdown if status is final or role can't change it
                                                disabled={updating || !isStatusMutable(order.status) || getAvailableStatuses().length === 0}
                                                className="border rounded px-2 py-1 text-sm focus:ring-rose-400 focus:outline-none"
                                            >
                                                {/* Only show statuses relevant to the current role */}
                                                {getAvailableStatuses().map((s) => (
                                                    <option key={s}>{s}</option>
                                                ))}
                                            </select>
                                        </td>
                                    )}

                                    {/* Cashier Actions Column (Refund / Cancel / Receipt) */}
                                    {showCashierActions && (
                                        <td className="px-4 py-3 text-sm flex gap-2">
                                            {/* Refund: only if paid, and only Admin sees it, or Cashier sees it if not Admin, otherwise hide if only Cashier */}
                                            {isAdmin && order.payment?.status === "Paid" && (
                                                <button
                                                    onClick={() => handleRefund(order._id)}
                                                    className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded"
                                                >
                                                    Refund
                                                </button>
                                            )}

                                            {/* Cancel: only if not served, cancelled, or refunded, AND if Cashier/Admin */}
                                            {order.status !== "Served" && order.status !== "Cancelled" && order.status !== "Refunded" && (
                                                <button
                                                    onClick={() => handleCancel(order._id)}
                                                    className="px-2 py-1 text-xs border rounded"
                                                >
                                                    Cancel
                                                </button>
                                            )}

                                            {/* Print / Receipt (Cashier/Admin can always print) */}
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

            {/* Bill Modal Rendering */}
            {selectedOrderForBill && (
                <BillModal
                    order={selectedOrderForBill}
                    onClose={() => setSelectedOrderForBill(null)}
                />
            )}
        </div>
    );
}