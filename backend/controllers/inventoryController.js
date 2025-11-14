// controllers/inventoryController.js (Basic CRUD logic)
import Inventory from '../models/inventoryModel.js';

// 1. Create Stock Item (POST /api/inventory)
export const createStockItem = async (req, res) => {
    try {
        const item = await Inventory.create(req.body);
        res.status(201).json(item);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// 2. Get All Stock Items (GET /api/inventory)
export const getStockItems = async (req, res) => {
    try {
        // Optional: Add filtering for low stock later
        const items = await Inventory.find({}).sort({ name: 1 });
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 3. Update Stock Item (PUT /api/inventory/:id)
export const updateStockItem = async (req, res) => {
    try {
        const item = await Inventory.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!item) return res.status(404).json({ message: 'Stock item not found' });
        res.json(item);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// 4. Delete Stock Item (DELETE /api/inventory/:id)
export const deleteStockItem = async (req, res) => {
    try {
        const item = await Inventory.findByIdAndDelete(req.params.id);
        if (!item) return res.status(404).json({ message: 'Stock item not found' });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};