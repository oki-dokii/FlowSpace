import mongoose, { Schema, Document, Types } from "mongoose";

export interface INote extends Document {
  boardId: Types.ObjectId;
  content: string;
  updatedBy?: Types.ObjectId;
  updatedAt: Date;
  createdAt: Date;
}

const NoteSchema = new Schema<INote>(
  {
    boardId: {
      type: Schema.Types.ObjectId,
      ref: "Board",
      required: true,
      unique: true,
    },
    content: { type: String, default: "" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

export const Note =
  mongoose.models.Note || mongoose.model<INote>("Note", NoteSchema);
