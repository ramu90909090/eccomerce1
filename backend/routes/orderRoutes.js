const express = require("express");
const router = express.Router();
const {
  createOrder,
  getAllOrders,
  updateOrderStatus,
  deleteOrder
} = require("../controllers/orderController");

// Public route to place orders
router.post("/", createOrder);

// Admin routes for CRUD
router.get("/", getAllOrders);
router.put("/:id", updateOrderStatus);
router.delete("/:id", deleteOrder);

module.exports = router;