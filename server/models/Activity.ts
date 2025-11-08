import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IActivity extends Document {
  boardId?: Types.ObjectId;
  userId: Types.ObjectId;
  userName?: string;
  userAvatar?: string;
  action: string;
  entityType: 'card' | 'board' | 'note' | 'user' | 'team';
  entityId?: string;
  entityTitle?: string;
  description?: string;
  timestamp?: Date;
  metadata?: any;
  createdAt: Date;
}

const ActivitySchema = new Schema<IActivity>(
  {
    boardId: { type: Schema.Types.ObjectId, ref: 'Board' },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String },
    userAvatar: { type: String },
    action: { type: String, required: true },
    entityType: {
      type: String,
      enum: ['card', 'board', 'note', 'user', 'team'],
      required: true,
    },
    entityId: { type: String },
    entityTitle: { type: String },
    description: { type: String },
    timestamp: { type: Date, default: Date.now },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const Activity =
  mongoose.models.Activity ||
  mongoose.model<IActivity>('Activity', ActivitySchema);
