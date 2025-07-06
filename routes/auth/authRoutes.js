import express from "express";
import authMiddleware from "../../middleware/authMiddleware.js";
import {
  register,
  login,
  logout,
  getMe,
} from "../../controllers/auth/authController.js";

const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", authMiddleware, logout);
authRouter.get("/me", authMiddleware, getMe);

export default authRouter;
