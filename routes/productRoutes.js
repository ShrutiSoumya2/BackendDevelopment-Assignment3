import express from "express";
import {
  createProduct,
  getProducts,
  getLowStockProducts,
  getInventorySummary,
  getProductById,
  updateProduct,
  updateStock,
  deleteProduct
} from "../controller/productController.js";

const router = express.Router();

router.post("/", createProduct);
router.get("/", getProducts);
router.get("/low-stock", getLowStockProducts);
router.get("/summary", getInventorySummary);
router.get("/:id", getProductById);
router.put("/:id", updateProduct);
router.patch("/:id/stock", updateStock);
router.delete("/:id", deleteProduct);

export default router;