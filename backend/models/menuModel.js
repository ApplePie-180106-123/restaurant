import mongoose from "mongoose";

const menuItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    category: { type: String },
    price: { type: Number, required: true },
    availability: { type: Boolean, default: true },
    imageUrl: { type: String }
}, { timestamps: true });

const MenuItem = mongoose.model("MenuItem", menuItemSchema);
export default MenuItem;
