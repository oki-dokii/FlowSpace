import { RequestHandler } from "express";
import jwt from "jsonwebtoken";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "secret";

export const authMiddleware: RequestHandler = (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (!auth)
      return res.status(401).json({ message: "Missing authorization" });
    const parts = auth.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer")
      return res.status(401).json({ message: "Invalid authorization format" });
    const token = parts[1];
    const payload: any = jwt.verify(token, ACCESS_SECRET);
    (req as any).userId = payload.sub;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
