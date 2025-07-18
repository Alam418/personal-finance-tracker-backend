import jwt from "jsonwebtoken";
import env from "dotenv";

env.config();

const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "rahasia");
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token expired or invalid" });
  }
};

export default authMiddleware;
