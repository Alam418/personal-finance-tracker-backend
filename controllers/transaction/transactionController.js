import db from "../../db.js";

// GET all transactions
export const getAllTransaction = async (req, res) => {
  const userId = req.user.id;
  const {
    start_date,
    end_date,
    type,
    category_id,
    account_id,
    page = 1,
    limit = 10,
  } = req.query;

  try {
    let baseQuery = `FROM transactions WHERE user_id = $1`;
    const params = [userId];
    let paramIndex = 2;

    if (start_date) {
      baseQuery += ` AND transaction_date >= $${paramIndex}`;
      params.push(start_date);
      paramIndex++;
    }

    if (end_date) {
      baseQuery += ` AND transaction_date <= $${paramIndex}`;
      params.push(end_date);
      paramIndex++;
    }

    if (type) {
      baseQuery += ` AND type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    if (category_id) {
      baseQuery += ` AND category_id = $${paramIndex}`;
      params.push(category_id);
      paramIndex++;
    }

    if (account_id) {
      baseQuery += ` AND account_id = $${paramIndex}`;
      params.push(account_id);
      paramIndex++;
    }

    const offset = (page - 1) * limit;

    const dataQuery = `
      SELECT * 
      ${baseQuery}
      ORDER BY transaction_date DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const paginationParams = [...params, limit, offset];
    const result = await db.query(dataQuery, paginationParams);

    const countQuery = `SELECT COUNT(*) ${baseQuery}`;
    const countResult = await db.query(countQuery, params);
    const totalData = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalData / limit);

    res.status(200).json({
      page: Number(page),
      limit: Number(limit),
      totalData,
      totalPages,
      data: result.rows,
    });
  } catch (error) {
    console.error("GET /transactions error: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//GET by id transaction
export const getTransactionDetail = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      `SELECT * FROM transactions WHERE id = $1 AND user_id = $2`,
      [id, req.user.id]
    );
    if (!result.rows.length) {
      return res.status(404).json({ message: "Not found" });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("GET /transactions/:id error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// CREATE transaction
export const createTransaction = async (req, res) => {
  const {
    account_id,
    category_id,
    amount,
    description,
    transaction_date,
    type,
  } = req.body;

  if (!account_id || !category_id || !amount || !type) {
    return res.status(400).json({
      message: "account_id, category_id, amount, and type are required",
    });
  }

  const payload = {
    account_id: Number(account_id),
    category_id: Number(category_id),
    amount: Number(amount),
    description: description || "",
    transaction_date: transaction_date
      ? new Date(transaction_date)
      : new Date(),
    type,
  };

  const client = await db.connect();
  try {
    await client.query("BEGIN");

    const result = await client.query(
      `INSERT INTO transactions 
        (user_id, account_id, category_id, amount, transaction_date, description, type)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        req.user.id,
        payload.account_id,
        payload.category_id,
        payload.amount,
        payload.transaction_date,
        payload.description,
        payload.type,
      ]
    );

    const balanceUpdate = payload.type === "income" ? payload.amount : -payload.amount;

    await client.query(
      `UPDATE accounts
       SET balance = balance + $1
       WHERE id = $2 AND user_id = $3`,
      [balanceUpdate, payload.account_id, req.user.id]
    );

    await client.query("COMMIT");
    res.status(201).json(result.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("POST /transaction error: ", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    client.release();
  }
};


//UPDATE transaction
export const updateTransaction = async (req, res) => {
  const { id } = req.params;
  const {
    account_id,
    category_id,
    amount,
    description,
    transaction_date,
    type,
  } = req.body;

  const client = await db.connect();
  try {
    await client.query("BEGIN");

    const oldRes = await client.query(
      `SELECT * FROM transactions WHERE id = $1 AND user_id = $2`,
      [id, req.user.id]
    );

    if (!oldRes.rows.length) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Not found" });
    }

    const old = oldRes.rows[0];

    // reveert the balance
    const revertAmount = old.type === "income" ? -old.amount : old.amount;
    await client.query(
      `UPDATE accounts
       SET balance = balance + $1
       WHERE id = $2 AND user_id = $3`,
      [revertAmount, old.account_id, req.user.id]
    );

    // the actual update transaction
    const result = await client.query(
      `UPDATE transactions
       SET account_id = COALESCE($1, account_id),
           category_id = COALESCE($2, category_id),
           amount = COALESCE($3, amount),
           description = COALESCE($4, description),
           transaction_date = COALESCE($5, transaction_date),
           type = COALESCE($6, type)
       WHERE id = $7 AND user_id = $8
       RETURNING *`,
      [
        account_id,
        category_id,
        amount,
        description,
        transaction_date,
        type,
        id,
        req.user.id,
      ]
    );

    const updated = result.rows[0];

    // apply the new balance
    const newAmount = updated.type === "income" ? updated.amount : -updated.amount;
    await client.query(
      `UPDATE accounts
       SET balance = balance + $1
       WHERE id = $2 AND user_id = $3`,
      [newAmount, updated.account_id, req.user.id]
    );

    await client.query("COMMIT");
    res.status(200).json(updated);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("PATCH /transactions/:id error:", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    client.release();
  }
};


//DELETE transaction
export const deleteTransaction = async (req, res) => {
  const { id } = req.params;

  const client = await db.connect();
  try {
    await client.query("BEGIN");

    const trxRes = await client.query(
      `SELECT * FROM transactions WHERE id = $1 AND user_id = $2`,
      [id, req.user.id]
    );

    if (!trxRes.rows.length) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Not found" });
    }

    const trx = trxRes.rows[0];
    const revertAmount = trx.type === "income" ? -trx.amount : trx.amount;

    await client.query(
      `UPDATE accounts
       SET balance = balance + $1
       WHERE id = $2 AND user_id = $3`,
      [revertAmount, trx.account_id, req.user.id]
    );

    await client.query(
      `DELETE FROM transactions WHERE id = $1 AND user_id = $2`,
      [id, req.user.id]
    );

    await client.query("COMMIT");
    res.status(204).send();
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("DELETE /transactions/:id error:", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    client.release();
  }
};


// GET transaction summary
export const getTransactionSummary = async (req, res) => {
  const userId = req.user.id;
  const { start_date, end_date, type, account_id, category_id } = req.query;

  try {
    let baseQuery = `FROM transactions WHERE user_id = $1`;
    const params = [userId];
    let paramIndex = 2;

    if (start_date) {
      baseQuery += ` AND transaction_date >= $${paramIndex}`;
      params.push(start_date);
      paramIndex++;
    }

    if (end_date) {
      baseQuery += ` AND transaction_date <= $${paramIndex}`;
      params.push(end_date);
      paramIndex++;
    }

    if (type) {
      baseQuery += ` AND type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    if (account_id) {
      baseQuery += ` AND account_id = $${paramIndex}`;
      params.push(account_id);
      paramIndex++;
    }

    if (category_id) {
      baseQuery += ` AND category_id = $${paramIndex}`;
      params.push(category_id);
      paramIndex++;
    }

    const summaryQuery = `
      SELECT 
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount END), 0) AS total_income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount END), 0) AS total_expense,
        COUNT(*) AS total_transactions
      ${baseQuery}
    `;

    const result = await db.query(summaryQuery, params);

    const { total_income, total_expense, total_transactions } = result.rows[0];
    const balance = total_income - total_expense;

    res.status(200).json({
      total_income,
      total_expense,
      balance,
      total_transactions,
    });
  } catch (error) {
    console.error("GET /transactions/summary error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
