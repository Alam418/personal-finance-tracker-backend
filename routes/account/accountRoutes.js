import express from "express";
import authMiddleware from "../../middleware/authMiddleware.js";
import {
  addBankAccount,
  bankAccountDetail,
  deleteBankAccount,
  editBankAccount,
  getAllBankAccount,
} from "../../controllers/account/accountController.js";

const router = express.Router();

router.get("/", authMiddleware, getAllBankAccount);
router.post("/", authMiddleware, addBankAccount);
router.get("/:id", authMiddleware, bankAccountDetail);
router.patch("/:id", authMiddleware, editBankAccount);
router.delete("/:id", authMiddleware, deleteBankAccount);

export default router;
