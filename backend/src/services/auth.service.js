import { User } from '../models/User.js';
import { signToken } from '../utils/jwt.js';
import { isDatabaseConnected } from '../config/db.js';

// In-memory fallback users store if MongoDB is offline
const memoryUsers = new Map();

export class AuthService {
  static async register({ name, email, password }) {
    const cleanEmail = email.toLowerCase().trim();

    if (isDatabaseConnected()) {
      const existing = await User.findOne({ email: cleanEmail });
      if (existing) {
        throw new Error('User with this email already exists.');
      }
      const user = await User.create({ name, email: cleanEmail, password });
      const token = signToken({ id: user._id, email: user.email, name: user.name });
      return {
        user: { id: user._id, name: user.name, email: user.email },
        token
      };
    } else {
      // In-memory fallback
      if (memoryUsers.has(cleanEmail)) {
        throw new Error('User with this email already exists.');
      }
      const mockId = `user-${Date.now()}`;
      const userObj = { id: mockId, name, email: cleanEmail, password };
      memoryUsers.set(cleanEmail, userObj);
      const token = signToken({ id: mockId, email: cleanEmail, name });
      return {
        user: { id: mockId, name, email: cleanEmail },
        token
      };
    }
  }

  static async login({ email, password }) {
    const cleanEmail = email.toLowerCase().trim();

    if (isDatabaseConnected()) {
      const user = await User.findOne({ email: cleanEmail });
      if (!user) {
        throw new Error('Invalid email or password.');
      }
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        throw new Error('Invalid email or password.');
      }
      const token = signToken({ id: user._id, email: user.email, name: user.name });
      return {
        user: { id: user._id, name: user.name, email: user.email },
        token
      };
    } else {
      const userObj = memoryUsers.get(cleanEmail);
      if (!userObj || userObj.password !== password) {
        throw new Error('Invalid email or password.');
      }
      const token = signToken({ id: userObj.id, email: cleanEmail, name: userObj.name });
      return {
        user: { id: userObj.id, name: userObj.name, email: cleanEmail },
        token
      };
    }
  }

  static async getProfile(userId) {
    if (isDatabaseConnected()) {
      const user = await User.findById(userId).select('-password');
      return user ? { id: user._id, name: user.name, email: user.email } : null;
    }
    return null;
  }
}
