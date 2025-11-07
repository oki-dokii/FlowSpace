import { RequestHandler } from "express";
import { Card } from "../models/Card";
import { Activity } from "../models/Activity";
import mongoose from "mongoose";

export const listCards: RequestHandler = async (req, res, next) => {
  try {
    const { boardId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(boardId))
      return res.status(400).json({ message: "Invalid boardId" });
    const cards = await Card.find({ boardId })
      .populate('createdBy', 'name email avatarUrl')
      .populate('updatedBy', 'name email avatarUrl')
      .sort({ order: 1 });
    res.json({ cards });
  } catch (err) {
    next(err);
  }
};

export const createCard: RequestHandler = async (req, res, next) => {
  try {
    const { boardId } = req.params; // Get boardId from URL params
    const { columnId, title, description, assigneeId, dueDate, tags } = req.body;
    const userId = (req as any).userId;
    
    const card = await Card.create({
      boardId,
      columnId,
      title,
      description,
      assigneeId,
      createdBy: userId,
      updatedBy: userId,
      dueDate,
      tags: tags || [],
      order: Date.now(),
      history: [],
    });

    // Populate user data before broadcasting
    const populatedCard = await Card.findById(card._id)
      .populate('createdBy', 'name email avatarUrl')
      .populate('updatedBy', 'name email avatarUrl');

    // Broadcast card creation to all clients
    const io = (req as any).app.get('io');
    if (io) {
      io.emit('card:create', populatedCard);
    }

    // Log activity
    try {
      const activity = await Activity.create({
        userId,
        boardId,
        action: `created card "${title}"`,
        entityType: 'card',
        entityId: card._id,
      });
      
      // Populate user data before emitting
      const populated = await Activity.findById(activity._id).populate('userId', 'name email avatarUrl');
      
      // Emit real-time activity update
      if (io) {
        io.emit('activity:new', populated);
      }
    } catch (activityErr) {
      console.error('Failed to log activity:', activityErr);
    }

    res.status(201).json({ card: populatedCard || card });
  } catch (err) {
    next(err);
  }
};

export const updateCard: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;
    
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid id" });
    
    const oldCard = await Card.findById(id);
    const updateData = { ...req.body, updatedBy: userId };
    const card = await Card.findByIdAndUpdate(id, updateData, { new: true });

    // Populate user data before broadcasting
    const populatedCard = await Card.findById(id)
      .populate('createdBy', 'name email avatarUrl')
      .populate('updatedBy', 'name email avatarUrl');

    // Broadcast card update to all clients
    const io = (req as any).app.get('io');
    if (io && populatedCard) {
      io.emit('card:update', populatedCard);
    }

    // Log activity
    if (card && oldCard) {
      try {
        const activity = await Activity.create({
          userId,
          boardId: card.boardId,
          action: `updated card "${card.title}"`,
          entityType: 'card',
          entityId: card._id,
        });
        
        // Populate user data before emitting
        const populated = await Activity.findById(activity._id).populate('userId', 'name email');
        
        // Emit real-time activity update
        if (io) {
          io.emit('activity:new', populated);
        }
      } catch (activityErr) {
        console.error('Failed to log activity:', activityErr);
      }
    }

    res.json({ card });
  } catch (err) {
    next(err);
  }
};

export const deleteCard: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;
    
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid id" });
    
    const card = await Card.findById(id);
    await Card.findByIdAndDelete(id);

    // Broadcast card deletion to all clients
    const io = (req as any).app.get('io');
    if (io && card) {
      io.emit('card:delete', { id: card._id });
    }

    // Log activity
    if (card) {
      try {
        const activity = await Activity.create({
          userId,
          boardId: card.boardId,
          action: `deleted card "${card.title}"`,
          entityType: 'card',
          entityId: card._id,
        });
        
        // Populate user data before emitting
        const populated = await Activity.findById(activity._id).populate('userId', 'name email');
        
        // Emit real-time activity update
        if (io) {
          io.emit('activity:new', populated);
        }
      } catch (activityErr) {
        console.error('Failed to log activity:', activityErr);
      }
    }

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};
