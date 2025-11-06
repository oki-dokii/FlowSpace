import { RequestHandler } from "express";
import { Board } from "../models/Board";

export function requireRole(
  minRole: "viewer" | "editor" | "owner",
): RequestHandler {
  return async (req, res, next) => {
    const anyReq: any = req;
    const userId = anyReq.userId;
    const boardId = req.params.id || req.params.boardId;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    const board = await Board.findById(boardId);
    if (!board) return res.status(404).json({ message: "Board not found" });
    if (board.ownerId.toString() === userId) return next();
    const member = board.members.find(
      (m) => m.userId.toString() === userId.toString(),
    );
    if (!member) return res.status(403).json({ message: "Not a member" });
    const rank = { viewer: 1, editor: 2, owner: 3 } as Record<string, number>;
    if (rank[member.role] < rank[minRole])
      return res.status(403).json({ message: "Insufficient role" });
    next();
  };
}
