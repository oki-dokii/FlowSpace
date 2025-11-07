import { RequestHandler } from 'express';
import { Activity } from '../models/Activity';

export const listActivities: RequestHandler = async (req, res, next) => {
  try {
    const anyReq: any = req;
    const userId = anyReq.userId;
    if (!userId) return res.status(401).json({ message: 'Not authenticated' });

    const limit = parseInt(req.query.limit as string) || 50;
    const activities = await Activity.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('userId', 'name email avatarUrl')
      .lean();

    res.json({ activities });
  } catch (err) {
    next(err);
  }
};

export const createActivity: RequestHandler = async (req, res, next) => {
  try {
    const anyReq: any = req;
    const userId = anyReq.userId;
    if (!userId) return res.status(401).json({ message: 'Not authenticated' });

    const { action, entityType, entityId, boardId, metadata } = req.body;
    const activity = await Activity.create({
      userId,
      action,
      entityType,
      entityId,
      boardId,
      metadata,
    });

    const populated = await Activity.findById(activity._id).populate(
      'userId',
      'name email avatarUrl'
    );
    res.status(201).json({ activity: populated });
  } catch (err) {
    next(err);
  }
};
