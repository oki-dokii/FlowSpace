import express from 'express';
import { sendInvite, acceptInvite, listInvites } from '../controllers/inviteController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Test endpoint
router.get('/', (req, res) => {
  res.json({ 
    message: 'Invite API is working',
    endpoints: {
      'POST /api/invite': 'Send invite (requires auth)',
      'POST /api/invite/:token/accept': 'Accept invite (requires auth)',
      'GET /api/invite/board/:boardId': 'List invites for a board (requires auth)'
    }
  });
});

// Send invite
router.post('/', authMiddleware, sendInvite);

// Accept invite
router.post('/:token/accept', authMiddleware, acceptInvite);

// List invites for a board
router.get('/board/:boardId', authMiddleware, listInvites);

export default router;
