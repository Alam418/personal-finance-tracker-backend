import db from "../../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

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
      `INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email`,
      [username, email, password_hash]
    );

    const newUser = result.rows[0];

    // Add default account and categories
    await db.query(
      `INSERT INTO accounts (user_id, name, balance) VALUES ($1, $2, $3)`,
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
      await db.query(`INSERT INTO categories (user_id, name) VALUES ($1, $2)`, [
        newUser.id,
        cat,
      ]);
    }

    res.status(201).json({ message: "Register successful", user: newUser });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Register error", error: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await db.query(`SELECT * FROM users WHERE email = $1`, [
      email,
    ]);
    const user = result.rows[0];

    if (!user)
      return res.status(401).json({ message: "Invalid email or password" });

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid)
      return res.status(401).json({ message: "Invalid email or password" });

    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      process.env.JWT_SECRET || "rahasia",
      { expiresIn: "7d" }
    );

    res.json({ token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login error", error });
  }
};

export const logout = async (req, res) => {
  res.clearCookie("token");
  res.json({ message: `Goodbye, ${req.user.username}` });
};

export const getMe = async (req, res) => {
  res.json(req.user);
};
