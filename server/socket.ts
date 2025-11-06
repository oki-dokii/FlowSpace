import { Server as IOServer } from "socket.io";
import http from "http";
import { Card } from "./models/Card";
import { Note } from "./models/Note";

export function initSocket(server: http.Server) {
  const io = new IOServer(server, { cors: { origin: process.env.CORS_ORIGIN || "*", credentials: true } });

  io.on("connection", (socket) => {
    console.log("socket connected", socket.id);

    socket.on("joinBoard", (boardId: string) => {
      const room = `board:${boardId}`;
      socket.join(room);
      socket.to(room).emit("presence:update", { id: socket.id, event: "join" });
    });

    socket.on("leaveBoard", (boardId: string) => {
      const room = `board:${boardId}`;
      socket.leave(room);
      socket.to(room).emit("presence:update", { id: socket.id, event: "leave" });
    });

    socket.on("card:create", async (data) => {
      try {
        const card = await Card.create(data);
        const room = `board:${data.boardId}`;
        socket.to(room).emit("card:create", card);
        socket.emit("card:create:ok", card);
      } catch (err) {
        socket.emit("error", { message: "Failed to create card" });
      }
    });

    socket.on("card:update", async (data) => {
      try {
        const { id, updates } = data;
        const card = await Card.findByIdAndUpdate(id, updates, { new: true });
        const room = `board:${card?.boardId}`;
        if (room) socket.to(room).emit("card:update", card);
        socket.emit("card:update:ok", card);
      } catch (err) {
        socket.emit("error", { message: "Failed to update card" });
      }
    });

    socket.on("card:delete", async (data) => {
      try {
        const { id } = data;
        const card = await Card.findByIdAndDelete(id);
        const room = `board:${card?.boardId}`;
        if (room) socket.to(room).emit("card:delete", { id });
        socket.emit("card:delete:ok", { id });
      } catch (err) {
        socket.emit("error", { message: "Failed to delete card" });
      }
    });

    socket.on("note:update", async (data) => {
      try {
        const { boardId, content, updatedBy } = data;
        const note = await Note.findOneAndUpdate({ boardId }, { content, updatedBy, updatedAt: new Date() }, { upsert: true, new: true });
        const room = `board:${boardId}`;
        socket.to(room).emit("note:update", note);
        socket.emit("note:update:ok", note);
      } catch (err) {
        socket.emit("error", { message: "Failed to update note" });
      }
    });

    socket.on("disconnect", () => {
      console.log("socket disconnected", socket.id);
    });
  });

  return io;
}
