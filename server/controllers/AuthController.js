import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export class AuthController {
  constructor(db) {
    this.db = db;
    this.jwtSecret = process.env.JWT_SECRET || 'dreamers-secret-key';
    this.jwtExpiry = process.env.JWT_EXPIRY || '24h';
  }

  async login(req, res) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: 'Username and password are required'
        });
      }

      // Find user
      const user = await this.db.db.get(
        'SELECT * FROM users WHERE username = ? AND is_active = 1',
        [username]
      );

      if (!user) {
        await this.db.logAudit(null, 'LOGIN_FAILED', 'users', username, null, null, req.ip);
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        await this.db.logAudit(user.id, 'LOGIN_FAILED', 'users', user.id, null, null, req.ip);
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: user.id,
          username: user.username,
          role: user.role
        },
        this.jwtSecret,
        { expiresIn: this.jwtExpiry }
      );

      // Log successful login
      await this.db.logAudit(user.id, 'LOGIN_SUCCESS', 'users', user.id, null, null, req.ip);

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
          }
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  async refreshToken(req, res) {
    try {
      const user = req.user;

      // Generate new token
      const token = jwt.sign(
        {
          userId: user.userId,
          username: user.username,
          role: user.role
        },
        this.jwtSecret,
        { expiresIn: this.jwtExpiry }
      );

      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: { token }
      });
    } catch (error) {
      console.error('Token refresh error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  async logout(req, res) {
    try {
      const user = req.user;
      
      // Log logout
      await this.db.logAudit(user.userId, 'LOGOUT', 'users', user.userId, null, null, req.ip);

      res.json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}