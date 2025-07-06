import db from "../../db.js";

//get all categories
export const getAllCategories = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM categories WHERE user_id = $1`,
      [req.user.id]
    );

    if (!result.rows.length) {
      res.status(404).json({ message: "Not Found" });
    }

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("GET /categories error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//add categories
export const addCategories = async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: "Name is required" });

  try {
    const existingCategories = await db.query(
      `SELECT * FROM categories WHERE name = $1 AND user_id = $2`,
      [name, req.user.id]
    );

    if (existingCategories.rows.length > 0) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const result = await db.query(
      `INSERT INTO categories (user_id, name) VALUES ($1, $2) RETURNING *`,
      [req.user.id, name]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("POST /categories error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//edit categories
export const editCategories = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const result = await db.query(
      `UPDATE categories SET name = $1 WHERE id = $2 AND user_id = $3`,
      [name, id, req.user.id]
    );

    if (!result.rowCount) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json({ message: "Category updated" });
  } catch (error) {
    console.error("PATCH /categories error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//delete categories
export const deleteCategories = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query(`DELETE FROM categories WHERE id = $1 AND user_id = $2`, [
      id,
      req.user.id,
    ]);
    res.status(204).send();
  } catch (error) {
    console.error("DELETE /categories error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};