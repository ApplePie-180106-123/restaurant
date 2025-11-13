import asyncHandler from "express-async-handler";
import Order from "../models/orderModel.js";
import MenuItem from "../models/menuModel.js";

// @desc create order
// @route POST /api/orders
// @access waiter or customer
export const createOrder = asyncHandler(async (req, res) => {
    const { tableNumber, items, customerId } = req.body;
    if (!items || items.length === 0) {
        res.status(400); throw new Error("No order items");
    }

    // calculate total
    let total = 0;
    for (const it of items) {
        const menu = await MenuItem.findById(it.menuItem);
        if (!menu) { res.status(400); throw new Error("Menu item not found"); }
        total += menu.price * (it.quantity || 1);
    }

    const order = new Order({
        tableNumber,
        items,
        total,
        customer: customerId || null,
        servedBy: req.user?._id || null
    });

    const created = await order.save();
    res.status(201).json(created);
});

// @desc get all orders (admin/waiter)
// @route GET /api/orders
// @access protected
export const getOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({})
        .populate("items.menuItem", "name price")
        .populate("customer", "name")
        .populate("servedBy", "name");
    res.json(orders);
});

// @desc update order status
// @route PUT /api/orders/:id/status
// @access protected (waiter/admin)
export const updateOrderStatus = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) { res.status(404); throw new Error("Order not found"); }
    order.status = req.body.status || order.status;
    if (req.body.payment) order.payment = req.body.payment;
    const updated = await order.save();
    res.json(updated);
});

// Refund: marks payment as refunded and records who refunded
export const refundOrder = async (req, res) => {
    try {
        const orderId = req.params.id;
        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        // only refund if paid
        if (!order.payment || order.payment.status !== 'Paid') {
            return res.status(400).json({ message: 'Only paid orders can be refunded' });
        }

        // set refund fields (you can expand with gatewayRef)
        order.payment.status = 'Refunded';
        order.payment.refundedAt = new Date();
        order.payment.refundedBy = req.user._id;
        order.status = 'Refunded'; // or 'Cancelled' depending on your policy

        await order.save();
        return res.json(order);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// Cancel: cancel before it is served (or allow refund+cancel)
export const cancelOrder = async (req, res) => {
    try {
        const orderId = req.params.id;
        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        // if served or paid and you don't want to cancel, guard accordingly
        if (order.status === 'Served') {
            return res.status(400).json({ message: 'Cannot cancel served orders' });
        }

        order.status = 'Cancelled';
        order.cancelledAt = new Date();
        order.cancelledBy = req.user._id;

        // if it was paid, optionally mark payment refunded = false (choose policy)
        if (order.payment?.status === 'Paid') {
            order.payment.status = 'RefundPending'; // or 'Refunded' if auto-refund
        }

        await order.save();
        return res.json(order);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// Optional - invoice payload for printing
export const getInvoice = async (req, res) => {
    const order = await Order.findById(req.params.id).populate('items.menuItem').populate('servedBy', 'name').populate('customer', 'name email');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    // return order with required fields for printing
    return res.json(order);
};
