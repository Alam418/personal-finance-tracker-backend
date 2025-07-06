import db from "../../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

//get all users
export const getUsers = async (req, res) => {
  try {
    const response = await db.query(`SELECT id, username, email FROM users`);
    res.status(200).json(response.rows);
  } catch (error) {
    console.error("GET /users error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//Register user and automatically add default e-cash/bank account and default categories
export const register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await db.query(
      `SELECT * FROM users WHERE email = $1`,
      [email]
    );
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const result = await db.query(
      `INSERT INTO users (username, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, username, email`,
      [username, email, password_hash]
    );

    const newUser = result.rows[0];

    await db.query(
      `INSERT INTO accounts (user_id, name, balance)
       VALUES ($1, $2, $3)`,
      [newUser.id, "Dompet", 0]
    );

    const defaultCategories = [
      "Makanan",
      "Transportasi",
      "Gaji",
      "Hiburan",
      "Lainnya",
    ];
    for (const cat of defaultCategories) {
      await db.query(
        `INSERT INTO categories (user_id, name)
         VALUES ($1, $2)`,
        [newUser.id, cat]
      );
    }

    res.status(201).json({
      message: "Register successful",
      user: newUser,
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Register error", error: error.message });
  }
};

//edit user
export const editUser = async (req, res) => {
  const { username, email } = req.body;
  const userId = req.user.id;

  try {
    const result = await db.query(
      `UPDATE users
       SET username = $1, email = $2
       WHERE id = $3
       RETURNING id, username, email`,
      [username, email, userId]
    );

    if (!result.rowCount) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("PATCH /users error:", error);
    res.status(500).json({ message: "Failed to update user" });
  }
};

//get user info by login
export const getMe = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await db.query(
      `SELECT id, username, email FROM users WHERE id = $1`,
      [userId]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("GET /me error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//get all transaction by user id (currently using params)
export const getMyTransactions = async (req, res) => {
  const userId = req.user.id;

  try {
    const response = await db.query(
      `SELECT id, amount, transaction_date, description, type, account_id, category_id
       FROM transactions
       WHERE user_id = $1
       ORDER BY transaction_date ASC`,
      [userId]
    );
    res.status(200).json(response.rows);
  } catch (error) {
    console.error("GET /transactions error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
