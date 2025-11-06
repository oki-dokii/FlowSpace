import { RequestHandler } from 'express';
import { User } from '../models/User';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

export const updateProfile: RequestHandler = async (req, res, next) => {
  try {
    const anyReq: any = req;
    const userId = anyReq.userId;
    if (!userId) return res.status(401).json({ message: 'Not authenticated' });

    const { name, email, avatar } = req.body;
    const updates: any = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (avatar) updates.avatar = avatar;

    const user = await User.findByIdAndUpdate(userId, updates, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ user });
  } catch (err) {
    next(err);
  }
};

export const deleteAccount: RequestHandler = async (req, res, next) => {
  try {
    const anyReq: any = req;
    const userId = anyReq.userId;
    if (!userId) return res.status(401).json({ message: 'Not authenticated' });

    await User.findByIdAndDelete(userId);
    res.clearCookie('refreshToken');
    res.json({ success: true, message: 'Account deleted' });
  } catch (err) {
    next(err);
  }
};

export const uploadAvatar: RequestHandler = async (req, res, next) => {
  try {
    const anyReq: any = req;
    const userId = anyReq.userId;
    if (!userId) return res.status(401).json({ message: 'Not authenticated' });

    const file = req.file;
    if (!file) return res.status(400).json({ message: 'No file uploaded' });

    const avatarUrl = `/uploads/avatars/${file.filename}`;
    const user = await User.findByIdAndUpdate(
      userId,
      { avatar: avatarUrl },
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ user, avatarUrl });
  } catch (err) {
    next(err);
  }
};

export const exportData: RequestHandler = async (req, res, next) => {
  try {
    const anyReq: any = req;
    const userId = anyReq.userId;
    if (!userId) return res.status(401).json({ message: 'Not authenticated' });

    const user = await User.findById(userId).select('-password');
    // In a real app, you'd gather all user data from all collections
    const exportData = {
      user,
      exportedAt: new Date().toISOString(),
      // Add boards, cards, notes, teams, etc.
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="flowspace-data.json"');
    res.json(exportData);
  } catch (err) {
    next(err);
  }
};
