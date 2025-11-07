import { RequestHandler } from "express";
import { Card } from "../models/Card";
import mongoose from "mongoose";

export const listCards: RequestHandler = async (req, res, next) => {
  try {
    const { boardId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(boardId))
      return res.status(400).json({ message: "Invalid boardId" });
    const cards = await Card.find({ boardId }).sort({ order: 1 });
    res.json({ cards });
  } catch (err) {
    next(err);
  }
};

export const createCard: RequestHandler = async (req, res, next) => {
  try {
    const { boardId } = req.params; // Get boardId from URL params
    const { columnId, title, description, assigneeId, dueDate, tags } = req.body;
    const card = await Card.create({
      boardId,
      columnId,
      title,
      description,
      assigneeId,
      dueDate,
      tags: tags || [],
      order: Date.now(),
      history: [],
    });
    res.status(201).json({ card });
  } catch (err) {
    next(err);
  }
};

export const updateCard: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid id" });
    const card = await Card.findByIdAndUpdate(id, updates, { new: true });
    if (!card) return res.status(404).json({ message: "Card not found" });
    res.json({ card });
  } catch (err) {
    next(err);
  }
};

export const deleteCard: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid id" });
    await Card.findByIdAndDelete(id);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};
