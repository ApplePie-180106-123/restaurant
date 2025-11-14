// models/inventoryModel.js
import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    unit: { type: String, required: true, enum: ['kg', 'g', 'ml', 'L', 'unit', 'pack'] },
    stockLevel: { type: Number, required: true, default: 0 },
    minStock: { type: Number, default: 10, required: true }, // For low stock alerts
    category: { type: String, default: 'General' },
}, { timestamps: true });

const Inventory = mongoose.model("Inventory", inventorySchema);
export default Inventory;