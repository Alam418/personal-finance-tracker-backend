import express from "express";
import authMiddleware from "../../middleware/authMiddleware.js";
import {
  editUser,
  getMyTransactions,
  getUsers,
  getMe,
  register,
} from "../../controllers/user/userController.js";

const router = express.Router();

router.post("/register", register);
router.get("/", getUsers); // /api/users/
router.get("/me", authMiddleware, getMe);
router.patch("/me", authMiddleware, editUser);
router.get("/transactions", authMiddleware, getMyTransactions);

export default router;
