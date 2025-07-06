import db from "../../db.js";

// Get all accounts by user id
export const getAllBankAccount = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM accounts WHERE user_id = $1", [
      req.user.id,
    ]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("GET /accounts error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Add bank account
export const addBankAccount = async (req, res) => {
  const { name, balance = 0 } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Name is required" });
  }

  try {
    const result = await db.query(
      `INSERT INTO accounts (user_id, name, balance) VALUES ($1, $2, $3) RETURNING *`,
      [req.user.id, name, balance]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("POST /accounts error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get account detail by ID
export const bankAccountDetail = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      `SELECT * FROM accounts WHERE id = $1 AND user_id = $2`,
      [id, req.user.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: "Account not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("GET /accounts/:id error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Edit bank account
export const editBankAccount = async (req, res) => {
  const { id } = req.params;
  const { name, balance } = req.body;

  try {
    const result = await db.query(
      `UPDATE accounts
         SET name = COALESCE($1, name),
             balance = COALESCE($2, balance)
       WHERE id = $3 AND user_id = $4
       RETURNING *`,
      [name, balance, id, req.user.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: "Account not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("PATCH /accounts/:id error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete bank account
export const deleteBankAccount = async (req, res) => {
  const { id } = req.params;

  try {
    await db.query(`DELETE FROM accounts WHERE id = $1 AND user_id = $2`, [
      id,
      req.user.id,
    ]);
    res.status(204).send();
  } catch (error) {
    console.error("DELETE /accounts/:id error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
