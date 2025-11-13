// backend/routes/orderRoutes.js
import express from "express";
import {
    createOrder,
    getOrders,
    updateOrderStatus,
    refundOrder,
    cancelOrder,
    getInvoice
} from "../controllers/orderController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// create order (customers) and list orders (admin/waiter/cashier)
router
    .route("/")
    .post(protect, createOrder)
    .get(protect, authorizeRoles("admin", "waiter", "cashier"), getOrders);

// update order status (admin, waiter, cashier allowed)
router.route("/:id/status")
    .put(protect, authorizeRoles("admin", "waiter", "cashier"), updateOrderStatus);

// cashier/admin actions: refund, cancel, invoice (print)
router.route("/:id/refund")
    .put(protect, authorizeRoles("cashier", "admin", "stakeholder"), refundOrder);

router.route("/:id/cancel")
    .put(protect, authorizeRoles("cashier", "admin"), cancelOrder);

router.route("/:id/invoice")
    .get(protect, authorizeRoles("cashier", "admin", "stakeholder"), getInvoice);

export default router;
