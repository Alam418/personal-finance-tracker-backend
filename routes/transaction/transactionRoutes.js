import express from "express";
import authMiddleware from "../../middleware/authMiddleware.js";
import {
  createTransaction,
  deleteTransaction,
  getAllTransaction,
  getTransactionDetail,
  getTransactionSummary,
  updateTransaction,
} from "../../controllers/transaction/transactionController.js";

const router = express.Router();

router.get("/summary", authMiddleware, getTransactionSummary);
router.get("/", authMiddleware, getAllTransaction);
router.get("/:id", authMiddleware, getTransactionDetail);
router.post("/", authMiddleware, createTransaction);
router.patch("/:id", authMiddleware, updateTransaction);
router.delete("/:id", authMiddleware, deleteTransaction);

export default router;
