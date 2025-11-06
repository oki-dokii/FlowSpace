import { RequestHandler } from "express";
import { Board } from "../models/Board";
import { Note } from "../models/Note";
import mongoose from "mongoose";

export const createBoard: RequestHandler = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const anyReq: any = req;
    const ownerId = anyReq.userId;
    if (!ownerId) return res.status(401).json({ message: "Not authenticated" });
    const board = await Board.create({
      title,
      description,
      ownerId,
      members: [{ userId: ownerId, role: "owner" }],
      columns: [
        { title: "To Do", order: 0 },
        { title: "In Progress", order: 1 },
        { title: "Review", order: 2 },
        { title: "Done", order: 3 },
      ],
    });
    // create an empty note for the board
    await Note.create({ boardId: board._id, content: "" });
    res.status(201).json({ board });
  } catch (err) {
    next(err);
  }
};

export const listBoards: RequestHandler = async (req, res, next) => {
  try {
    const anyReq: any = req;
    const userId = anyReq.userId;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    const boards = await Board.find({
      $or: [{ ownerId: userId }, { "members.userId": userId }],
    });
    res.json({ boards });
  } catch (err) {
    next(err);
  }
};

export const getBoard: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid id" });
    const board = await Board.findById(id)
      .populate("members.userId", "name email")
      .lean();
    if (!board) return res.status(404).json({ message: "Board not found" });
    const note = await Note.findOne({ boardId: board._id });
    res.json({ board, note });
  } catch (err) {
    next(err);
  }
};

export const inviteMember: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params; // board id
    const { userId, role } = req.body; // allow invite by userId for now
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid id" });
    const board = await Board.findById(id);
    if (!board) return res.status(404).json({ message: "Board not found" });
    // add member
    board.members.push({ userId, role: role || "viewer" });
    await board.save();
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};
