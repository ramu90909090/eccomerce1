const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  quickUpdateStock, // <-- Is import ke miss hone se ReferenceError aa raha tha
  deleteProduct
} = require("../controllers/productController");

// Public routes
router.get("/", getAllProducts);
router.get("/:id", getProductById);

// Admin Product Operations
router.post("/", upload.array("imageFiles", 5), createProduct);
router.put("/:id", upload.array("imageFiles", 5), updateProduct);
router.patch("/:id/stock", quickUpdateStock);
router.delete("/:id", deleteProduct);

module.exports = router;