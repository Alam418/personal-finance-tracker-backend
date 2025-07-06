import pg from "pg";
import env from "dotenv";

env.config();

const connectionString = process.env.DATABASE_URL;

const db = new pg.Client({ connectionString: connectionString });
db.connect()
  .then(() => console.log("Connected to PostgreSQL"))
  .catch((err) => console.error("DB connection error:", err));

export default db;