
# 💸 Personal Finance Tracker API

A simple and secure REST API for managing your personal income and expense data, including categorized transactions, accounts, and summaries.  
Built for private use — no admin, no multi-user, just you and your money.

---

## 🚀 Features

- ✅ Authentication (Register, Login, JWT)
- ✅ Manage Accounts (e.g., "Dompet", "BCA", etc.)
- ✅ Manage Categories (e.g., "Gaji", "Makanan", "Transportasi")
- ✅ CRUD Transactions
- ✅ Transaction Filtering (date, type, category, account)
- ✅ Pagination support
- ✅ Summary: Total Income, Expense, and Balance
- ✅ Swagger Docs (`/docs`)
- ✅ Postman Collection included
- 🔐 Private use only (no multi-user, no email, no admin)

---

## 🔧 Stack

- **Node.js** + **Express**
- **PostgreSQL** with `pg`
- **JWT** for authentication
- **bcrypt** for password hashing
- **Swagger UI** for documentation

---

## 📂 Folder Structure

```
📁 controllers/
📁 routes/
📁 middleware/
📁 db.js
📄 index.js
```

---

## 🧪 API Testing

- ✅ All endpoints tested via **Postman**
- Collection included in `/docs` or exported `.json`
- Body examples also available for convenience

---

## 🛠️ Setup

```bash
# Clone this repo
git clone https://github.com/your-username/personal-finance-tracker-api.git
cd personal-finance-tracker-api

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Fill in your PostgreSQL credentials and JWT_SECRET

# Run the server
npm start
```

---

## 🔐 Environment Variables (`.env`)

```
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_postgres_user
DB_PASSWORD=your_postgres_password
DB_NAME=your_database_name
JWT_SECRET=your_jwt_secret
```

---

## 📘 API Docs

Swagger UI available at:  
[http://localhost:3000/docs](http://localhost:3000/docs)

---

## 🔒 Authentication

All endpoints except /auth/register and /auth/login require a valid JWT in the Authorization header:

Authorization: Bearer <token>

---

## 🧹 To Do (Optional Enhancements)

Add unit/integration tests (e.g., with Jest)

Add admin role or management panel

Deploy to production

Add caching or rate limiting

---

## 🧠 Notes

- All transactions are scoped to the logged-in user.
- Default categories and a "Dompet" account are created when registering.
- Dates are stored as ISO strings (`YYYY-MM-DD`).
- API is designed to be **lightweight** and for **manual input**, not automation.

---

## 🧑‍💻 Author

- Built with 🤕 by Fachry Syah Alam

---

## 📦 License

MIT — Use, fork, modify. But remember, this project was built for personal learning and productivity.
