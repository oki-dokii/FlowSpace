import express from "express";
import {
  createCard,
  updateCard,
  deleteCard,
} from "../controllers/cardsController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/:boardId/cards", authMiddleware, createCard);
router.put("/:id", authMiddleware, updateCard);
router.delete("/:id", authMiddleware, deleteCard);

export default router;
