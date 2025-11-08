import express from "express";
import { createOrder, getOrders, updateOrderStatus } from "../controllers/orderController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
    .post(protect, createOrder)
    .get(protect, authorizeRoles("admin", "waiter"), getOrders);

router.route("/:id/status")
    .put(protect, authorizeRoles("admin", "waiter"), updateOrderStatus);

export default router;
