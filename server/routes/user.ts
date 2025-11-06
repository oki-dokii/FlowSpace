import express from 'express';
import { updateProfile, deleteAccount, exportData, uploadAvatar } from '../controllers/userController';
import { authMiddleware } from '../middleware/authMiddleware';
import { upload } from '../middleware/upload';

const router = express.Router();

router.put('/profile', authMiddleware, updateProfile);
router.post('/avatar', authMiddleware, upload.single('avatar'), uploadAvatar);
router.delete('/account', authMiddleware, deleteAccount);
router.get('/export', authMiddleware, exportData);

export default router;
