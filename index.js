import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";

import authRoutes from "./routes/auth/authRoutes.js";
import userRoutes from "./routes/user/userRoutes.js";
import accountRoutes from "./routes/account/accountRoutes.js";
import categoryRoutes from "./routes/category/categoryRoutes.js";
import transactionRoutes from "./routes/transaction/transactionRoutes.js"; // ✅ NEW

dotenv.config();

const app = express();
const port = process.env.PORT || 3005;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));
app.set("view engine", "ejs");

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/accounts", accountRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/transactions", transactionRoutes);

// Root health check
app.get("/", (req, res) => {
  res.send("Personal Finance Tracker API is running!");
});

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
