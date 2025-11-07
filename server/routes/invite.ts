import express from 'express';
import { sendInvite, acceptInvite, listInvites } from '../controllers/inviteController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Send invite
router.post('/', authMiddleware, sendInvite);

// Accept invite
router.post('/:token/accept', authMiddleware, acceptInvite);

// List invites for a board
router.get('/board/:boardId', authMiddleware, listInvites);

export default router;
