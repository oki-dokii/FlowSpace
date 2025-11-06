import express from "express";
import { createBoard, listBoards, getBoard, inviteMember } from "../controllers/boardsController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/", authMiddleware, createBoard);
router.get("/", authMiddleware, listBoards);
router.get("/:id", authMiddleware, getBoard);
router.post("/:id/invite", authMiddleware, inviteMember);

export default router;
