import express from "express";
import authMiddleware from "../../middleware/authMiddleware.js";
import {
  addCategories,
  deleteCategories,
  editCategories,
  getAllCategories,
} from "../../controllers/category/categoryController.js";

const router = express.Router();

router.get("/categories", authMiddleware, getAllCategories);
router.post("/categories", authMiddleware, addCategories);
router.patch("/categories/:id", authMiddleware, editCategories);
router.delete("/categories/:id", authMiddleware, deleteCategories);

export default router;
