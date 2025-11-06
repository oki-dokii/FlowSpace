import { RequestHandler } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/User";

const ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES || "15m";
const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES || "7d";
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "secret";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refresh_secret";

function signAccess(userId: string) {
  return jwt.sign({ sub: userId }, ACCESS_SECRET, {
    expiresIn: ACCESS_EXPIRES,
  });
}
function signRefresh(userId: string) {
  return jwt.sign({ sub: userId }, REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRES,
  });
}

export const register: RequestHandler = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "Missing fields" });
    const existing = await User.findOne({ email });
    if (existing)
      return res.status(409).json({ message: "Email already in use" });
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hash });
    const access = signAccess(user._id.toString());
    const refresh = signRefresh(user._id.toString());
    res.cookie("refreshToken", refresh, { httpOnly: true, sameSite: "lax" });
    res.json({
      access,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    next(err);
  }
};

export const login: RequestHandler = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Missing fields" });
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });
    const access = signAccess(user._id.toString());
    const refresh = signRefresh(user._id.toString());
    res.cookie("refreshToken", refresh, { httpOnly: true, sameSite: "lax" });
    res.json({
      access,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    next(err);
  }
};

export const me: RequestHandler = async (req, res) => {
  // authMiddleware attaches req.userId
  const anyReq = req as any;
  if (!anyReq.userId)
    return res.status(401).json({ message: "Not authenticated" });
  const user = await User.findById(anyReq.userId).select("-password");
  res.json({ user });
};

export const refresh: RequestHandler = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) return res.status(401).json({ message: "No refresh token" });
    const payload: any = jwt.verify(token, REFRESH_SECRET);
    const userId = payload.sub;
    const access = signAccess(userId);
    const refresh = signRefresh(userId);
    res.cookie("refreshToken", refresh, { httpOnly: true, sameSite: "lax" });
    res.json({ access });
  } catch (err) {
    next(err);
  }
};

export const logout: RequestHandler = async (req, res) => {
  res.clearCookie("refreshToken");
  res.json({ ok: true });
};
