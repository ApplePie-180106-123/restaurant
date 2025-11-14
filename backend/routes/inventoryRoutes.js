// routes/inventoryRoutes.js
import express from 'express';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import {
    createStockItem,
    getStockItems,
    updateStockItem,
    deleteStockItem,
} from '../controllers/inventoryController.js';

const router = express.Router();

const roles = ['inventory', 'admin']; // Only Inventory Manager and Admin can manage stock

router.route('/')
    .get(protect, authorizeRoles(...roles), getStockItems)  // List all stock
    .post(protect, authorizeRoles(...roles), createStockItem); // Create new stock item

router.route('/:id')
    .put(protect, authorizeRoles(...roles), updateStockItem) // Update stock item
    .delete(protect, authorizeRoles(...roles), deleteStockItem); // Delete stock item

export default router;