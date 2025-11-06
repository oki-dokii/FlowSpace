import mongoose, { Schema, Document, Types } from "mongoose";

export type Role = "owner" | "editor" | "viewer";

export interface IColumn {
  _id: Types.ObjectId;
  title: string;
  order: number;
}

export interface IMember {
  userId: Types.ObjectId;
  role: Role;
}

export interface IBoard extends Document {
  title: string;
  description?: string;
  ownerId: Types.ObjectId;
  members: IMember[];
  columns: IColumn[];
  createdAt: Date;
  updatedAt: Date;
}

const ColumnSchema = new Schema<IColumn>({
  title: { type: String, required: true },
  order: { type: Number, default: 0 },
});

const MemberSchema = new Schema<IMember>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  role: { type: String, enum: ["owner", "editor", "viewer"], default: "viewer" },
});

const BoardSchema = new Schema<IBoard>(
  {
    title: { type: String, required: true },
    description: { type: String },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    members: { type: [MemberSchema], default: [] },
    columns: { type: [ColumnSchema], default: [] },
  },
  { timestamps: true }
);

export const Board = mongoose.models.Board || mongoose.model<IBoard>("Board", BoardSchema);
