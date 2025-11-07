import express from "express";
import {
  register,
  login,
  getMe,
  logout,
  refresh,
} from "../controllers/authController";
import { firebaseLogin } from "../controllers/authController-firebase";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/firebase-login", firebaseLogin);
router.get("/me", authMiddleware, getMe);
router.post("/refresh", refresh);
router.post("/logout", logout);

export default router;
