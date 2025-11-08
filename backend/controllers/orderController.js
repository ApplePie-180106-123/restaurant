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
