import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "emergent_flowspace_access_secret_" + Date.now();
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "emergent_flowspace_refresh_secret_" + Date.now();

/**
 * Firebase Login/Register endpoint
 * Accepts Firebase UID and email, creates/finds user, returns JWT tokens
 */
export const firebaseLogin: RequestHandler = async (req, res, next) => {
  try {
    const { uid, email, name, photoURL } = req.body;
    
    if (!uid || !email) {
      return res.status(400).json({ message: "Missing uid or email" });
    }

    // Find or create user with Firebase UID
    let user = await User.findOne({ firebaseUid: uid });
    
    if (!user) {
      // Create new user
      user = await User.create({
        firebaseUid: uid,
        name: name || email.split('@')[0],
        email,
        avatarUrl: photoURL,
      });
    } else {
      // Update user info if changed
      if (photoURL && user.avatarUrl !== photoURL) {
        user.avatarUrl = photoURL;
        await user.save();
      }
    }

    // Generate JWT tokens
    const accessToken = jwt.sign({ sub: user._id }, ACCESS_SECRET, { expiresIn: "7d" });
    const refreshToken = jwt.sign({ sub: user._id }, REFRESH_SECRET, { expiresIn: "30d" });

    // Set refresh token as httpOnly cookie
    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    res.json({
      access: accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (err) {
    next(err);
  }
};
