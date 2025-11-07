import { RequestHandler } from 'express';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { Invite } from '../models/Invite';
import { Board } from '../models/Board';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Generate unique invite token
function generateInviteToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Send invite with email
export const sendInvite: RequestHandler = async (req, res, next) => {
  try {
    const anyReq: any = req;
    const userId = anyReq.userId;
    if (!userId) return res.status(401).json({ message: 'Not authenticated' });

    const { email, boardId, role = 'editor' } = req.body;
    if (!email) return res.status(400).json({ message: 'Email required' });
    if (!boardId) return res.status(400).json({ message: 'Board ID required' });

    // Verify board exists and user has permission
    const board = await Board.findById(boardId);
    if (!board) return res.status(404).json({ message: 'Board not found' });
    
    const isOwner = board.ownerId.toString() === userId;
    const isMember = board.members.some(
      (m: any) => m.userId.toString() === userId && (m.role === 'owner' || m.role === 'editor')
    );
    
    if (!isOwner && !isMember) {
      return res.status(403).json({ message: 'No permission to invite' });
    }

    // Check if invite already exists
    let invite = await Invite.findOne({ boardId, email, status: 'pending' });
    
    if (!invite) {
      // Create new invite
      const token = generateInviteToken();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

      invite = await Invite.create({
        boardId,
        invitedBy: userId,
        email,
        token,
        role,
        status: 'pending',
        expiresAt,
      });
    }

    // Get the actual domain from the request headers (works in both dev and production)
    const protocol = (req as any).protocol || 'https';
    const host = (req as any).get('host') || 'localhost:3000';
    const baseUrl = `${protocol}://${host}`;
    const inviteLink = `${baseUrl}/invite/${invite.token}`;

    const mailOptions = {
      from: process.env.SMTP_EMAIL,
      to: email,
      subject: `You've been invited to collaborate on FlowSpace`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #6366f1;">You've been invited to FlowSpace!</h1>
          <p>You've been invited to collaborate on <strong>${board.title}</strong>.</p>
          <p>As a <strong>${role}</strong>, you'll be able to ${role === 'editor' ? 'view and edit cards' : 'view cards'}.</p>
          <a href="${inviteLink}" style="display: inline-block; padding: 12px 24px; background: linear-gradient(to right, #6366f1, #a855f7); color: white; text-decoration: none; border-radius: 8px; margin: 20px 0;">Accept Invitation</a>
          <p>Or copy this link: <a href="${inviteLink}">${inviteLink}</a></p>
          <p style="color: #888; font-size: 12px;">This invitation will expire in 7 days.</p>
          <p style="color: #888; font-size: 12px; margin-top: 40px;">FlowSpace - Collaborate visually, write freely.</p>
        </div>
      `,
    };

    // Try to send email, but don't fail if email service is not configured
    try {
      await transporter.sendMail(mailOptions);
      res.json({ 
        success: true, 
        message: 'Invite sent successfully',
        inviteLink, // Return link for easy sharing
        token: invite.token
      });
    } catch (emailErr) {
      console.error('Email sending failed:', emailErr);
      // Still return success with the invite link
      res.json({ 
        success: true, 
        message: 'Invite created (email not sent - check SMTP config)',
        inviteLink,
        token: invite.token,
        warning: 'Email service not configured. Share this link manually.'
      });
    }
  } catch (err) {
    console.error('Invite error:', err);
    next(err);
  }
};

// Accept invite
export const acceptInvite: RequestHandler = async (req, res, next) => {
  try {
    const anyReq: any = req;
    const userId = anyReq.userId;
    if (!userId) return res.status(401).json({ message: 'Not authenticated' });

    const { token } = req.params;
    if (!token) return res.status(400).json({ message: 'Token required' });

    // Find invite
    const invite = await Invite.findOne({ token });
    if (!invite) return res.status(404).json({ message: 'Invite not found' });

    // Check if expired
    if (new Date() > invite.expiresAt) {
      invite.status = 'expired';
      await invite.save();
      return res.status(400).json({ message: 'Invite has expired' });
    }

    // Check if already accepted
    if (invite.status === 'accepted') {
      return res.status(400).json({ message: 'Invite already accepted' });
    }

    // Add user to board members
    const board = await Board.findById(invite.boardId);
    if (!board) return res.status(404).json({ message: 'Board not found' });

    // Check if user is already a member
    const existingMember = board.members.find(
      (m: any) => m.userId.toString() === userId
    );

    if (!existingMember) {
      board.members.push({
        userId: userId as any,
        role: invite.role as any,
      });
      await board.save();
    }

    // Mark invite as accepted
    invite.status = 'accepted';
    await invite.save();

    // Emit socket event to notify board members
    const io = (req as any).app.get('io');
    if (io) {
      io.emit('board:member-joined', { boardId: board._id, userId });
    }

    res.json({ 
      success: true, 
      message: 'Invite accepted',
      board: {
        _id: board._id,
        title: board.title,
        description: board.description
      }
    });
  } catch (err) {
    console.error('Accept invite error:', err);
    next(err);
  }
};

// Get invites for a board
export const listInvites: RequestHandler = async (req, res, next) => {
  try {
    const anyReq: any = req;
    const userId = anyReq.userId;
    if (!userId) return res.status(401).json({ message: 'Not authenticated' });

    const { boardId } = req.params;
    
    // Verify user has permission
    const board = await Board.findById(boardId);
    if (!board) return res.status(404).json({ message: 'Board not found' });
    
    const isOwner = board.ownerId.toString() === userId;
    if (!isOwner) {
      return res.status(403).json({ message: 'Only board owner can view invites' });
    }

    const invites = await Invite.find({ boardId })
      .populate('invitedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ invites });
  } catch (err) {
    next(err);
  }
};
