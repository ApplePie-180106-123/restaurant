import express from "express";
import { createMenuItem, getMenu, updateMenuItem, deleteMenuItem } from "../controllers/menuController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
    .get(getMenu)
    .post(protect, authorizeRoles("admin"), createMenuItem);

router.route("/:id")
    .put(protect, authorizeRoles("admin"), updateMenuItem)
    .delete(protect, authorizeRoles("admin"), deleteMenuItem);

export default router;
