import express from "express";
import authMiddleware from "../../middleware/authMiddleware.js";
import {
  addCategories,
  deleteCategories,
  editCategories,
  getAllCategories,
} from "../../controllers/category/categoryController.js";

const router = express.Router();

router.get("/", authMiddleware, getAllCategories);
router.post("/", authMiddleware, addCategories);
router.patch("/:id", authMiddleware, editCategories);
router.delete("/:id", authMiddleware, deleteCategories);

export default router;
