import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem", required: true },
    quantity: { type: Number, default: 1 }
});

const orderSchema = new mongoose.Schema({
    tableNumber: { type: Number },
    items: [orderItemSchema],
    status: { type: String, enum: ["Pending", "Preparing", "Served", "Paid"], default: "Pending" },
    total: { type: Number, default: 0 },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // optional for logged-in customer
    servedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // waiter
    payment: {
        method: { type: String },
        status: { type: String, enum: ["Paid", "Unpaid"], default: "Unpaid" }
    }
}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);
export default Order;
