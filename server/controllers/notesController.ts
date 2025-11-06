import { RequestHandler } from "express";
import { Note } from "../models/Note";
import mongoose from "mongoose";

export const getNote: RequestHandler = async (req, res, next) => {
  try {
    const { boardId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(boardId)) return res.status(400).json({ message: "Invalid id" });
    const note = await Note.findOne({ boardId });
    if (!note) return res.status(404).json({ message: "Note not found" });
    res.json({ note });
  } catch (err) {
    next(err);
  }
};

export const updateNote: RequestHandler = async (req, res, next) => {
  try {
    const { boardId } = req.params;
    const { content } = req.body;
    if (!mongoose.Types.ObjectId.isValid(boardId)) return res.status(400).json({ message: "Invalid id" });
    const note = await Note.findOneAndUpdate({ boardId }, { content, updatedAt: new Date() }, { new: true, upsert: true });
    res.json({ note });
  } catch (err) {
    next(err);
  }
};
