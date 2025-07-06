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

router.get("/accounts", authMiddleware, getAllBankAccount);
router.post("/accounts", authMiddleware, addBankAccount);
router.get("/accounts/:id", authMiddleware, bankAccountDetail);
router.patch("/accounts/:id", authMiddleware, editBankAccount);
router.delete("/accounts/:id", authMiddleware, deleteBankAccount);

export default router;
