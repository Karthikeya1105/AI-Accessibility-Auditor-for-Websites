import { AuthService } from '../services/auth.service.js';

export class AuthController {
  static async register(req, res) {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    try {
      const result = await AuthService.register({ name, email, password });
      return res.status(201).json({
        success: true,
        data: result
      });
    } catch (err) {
      return res.status(400).json({ error: err.message || 'Registration failed.' });
    }
  }

  static async login(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    try {
      const result = await AuthService.login({ email, password });
      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      return res.status(401).json({ error: err.message || 'Login failed.' });
    }
  }

  static async me(req, res) {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated.' });
    }
    try {
      const profile = await AuthService.getProfile(req.user.id);
      return res.status(200).json({
        success: true,
        user: profile || req.user
      });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to retrieve profile.' });
    }
  }
}
