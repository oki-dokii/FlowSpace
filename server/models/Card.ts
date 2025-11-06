import mongoose, { Schema, Document, Types } from "mongoose";

export interface IHistoryEntry {
  by: Types.ObjectId;
  action: string;
  when: Date;
  data?: any;
}

export interface ICard extends Document {
  boardId: Types.ObjectId;
  columnId: Types.ObjectId;
  title: string;
  description?: string;
  assigneeId?: Types.ObjectId;
  dueDate?: Date;
  tags: string[];
  order: number;
  history: IHistoryEntry[];
  createdAt: Date;
  updatedAt: Date;
}

const HistorySchema = new Schema<IHistoryEntry>({
  by: { type: Schema.Types.ObjectId, ref: "User" },
  action: { type: String },
  when: { type: Date, default: Date.now },
  data: { type: Schema.Types.Mixed },
});

const CardSchema = new Schema<ICard>(
  {
    boardId: { type: Schema.Types.ObjectId, ref: "Board", required: true },
    columnId: { type: Schema.Types.ObjectId, ref: "Board.columns", required: true },
    title: { type: String, required: true },
    description: { type: String },
    assigneeId: { type: Schema.Types.ObjectId, ref: "User" },
    dueDate: { type: Date },
    tags: { type: [String], default: [] },
    order: { type: Number, default: 0 },
    history: { type: [HistorySchema], default: [] },
  },
  { timestamps: true }
);

export const Card = mongoose.models.Card || mongoose.model<ICard>("Card", CardSchema);
