import jwt from "jsonwebtoken";
import env from "dotenv";

env.config();

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token not provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "rahasia");
    req.user = decoded;
    next();
  } catch (error) {
    console.error({ message: "Invalid token", error });
    res.status(401).json({ message: "Invalid token" });
  }
};

export default authMiddleware;
