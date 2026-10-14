const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const {
  createOrder,
  getAllOrders,
  getMyOrders,
  updateOrderStatus,
  deleteOrder
} = require("../controllers/orderController");

// Public order placement
router.post("/", createOrder);

// User-specific orders (Protected with authMiddleware)
router.get("/my-orders", authMiddleware, getMyOrders);

// Admin routes
router.get("/", getAllOrders);
router.put("/:id", updateOrderStatus);
router.delete("/:id", deleteOrder);

module.exports = router;