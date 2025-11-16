import asyncHandler from "express-async-handler";
import MenuItem from "../models/menuModel.js";

// @desc    Create menu item
// @route   POST /api/menu
// @access  Admin
export const createMenuItem = asyncHandler(async (req, res) => {
    const { name, description, category, price, availability, imageUrl } = req.body;
    const menu = new MenuItem({ name, description, category, price, availability, imageUrl });
    const created = await menu.save();
    res.status(201).json(created);
});

// @desc    Get all menu items
// @route   GET /api/menu
// @access  Public
export const getMenu = asyncHandler(async (req, res) => {
    const items = await MenuItem.find({});
    res.json(items);
});

// @desc    Update menu item
// @route   PUT /api/menu/:id
// @access  Admin
export const updateMenuItem = asyncHandler(async (req, res) => {
    const menu = await MenuItem.findById(req.params.id);
    if (!menu) { res.status(404); throw new Error("Menu item not found"); }
    Object.assign(menu, req.body);
    const updated = await menu.save();
    res.json(updated);
});
// @desc    Delete menu item
// @route   DELETE /api/menu/:id
// @access  Admin
export const deleteMenuItem = asyncHandler(async (req, res) => {
    const menu = await MenuItem.findById(req.params.id);

    if (!menu) {
        res.status(404);
        throw new Error("Menu item not found");
    }

    // Fix: Use deleteOne() instead of the deprecated remove()
    await menu.deleteOne();

    // Alternatively, you could use: await MenuItem.deleteOne({ _id: req.params.id });

    res.json({ message: "Menu item removed" });
});