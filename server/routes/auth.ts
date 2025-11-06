import express from "express";
import {
  register,
  login,
  me,
  refresh,
  logout,
} from "../controllers/authController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authMiddleware, me);
router.post("/refresh", refresh);
router.post("/logout", logout);

export default router;
