import bcrypt from 'bcryptjs';

export class AdminController {
  constructor(db, io) {
    this.db = db;
    this.io = io;
  }

  async getUsers(req, res) {
    try {
      const users = await this.db.db.all(`
        SELECT id, username, email, role, is_active, created_at, updated_at
        FROM users
        ORDER BY created_at DESC
      `);

      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch users'
      });
    }
  }

  async createUser(req, res) {
    try {
      const { username, email, password, role = 'user' } = req.body;
      const adminUser = req.user;

      if (!username || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Username, email, and password are required'
        });
      }

      // Check if user already exists
      const existingUser = await this.db.db.get(
        'SELECT id FROM users WHERE username = ? OR email = ?',
        [username, email]
      );

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'User with this username or email already exists'
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      const result = await this.db.db.run(
        `INSERT INTO users (username, email, password_hash, role)
         VALUES (?, ?, ?, ?)`,
        [username, email, hashedPassword, role]
      );

      const userId = result.lastID;

      // Log audit
      await this.db.logAudit(
        adminUser.userId,
        'CREATE',
        'users',
        userId,
        null,
        { username, email, role },
        req.ip
      );

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: {
          id: userId,
          username,
          email,
          role
        }
      });
    } catch (error) {
      console.error('Create user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create user'
      });
    }
  }

  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { username, email, role, is_active } = req.body;
      const adminUser = req.user;

      // Get current user data
      const currentUser = await this.db.db.get('SELECT * FROM users WHERE id = ?', [id]);
      if (!currentUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const updateData = {};
      if (username !== undefined) updateData.username = username;
      if (email !== undefined) updateData.email = email;
      if (role !== undefined) updateData.role = role;
      if (is_active !== undefined) updateData.is_active = is_active ? 1 : 0;
      updateData.updated_at = new Date().toISOString();

      const setClause = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
      const values = [...Object.values(updateData), id];

      await this.db.db.run(
        `UPDATE users SET ${setClause} WHERE id = ?`,
        values
      );

      // Log audit
      await this.db.logAudit(
        adminUser.userId,
        'UPDATE',
        'users',
        id,
        currentUser,
        updateData,
        req.ip
      );

      res.json({
        success: true,
        message: 'User updated successfully'
      });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update user'
      });
    }
  }

  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      const adminUser = req.user;

      // Prevent self-deletion
      if (parseInt(id) === adminUser.userId) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete your own account'
        });
      }

      // Get current user data
      const currentUser = await this.db.db.get('SELECT * FROM users WHERE id = ?', [id]);
      if (!currentUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Soft delete
      await this.db.db.run(
        'UPDATE users SET is_active = 0, updated_at = ? WHERE id = ?',
        [new Date().toISOString(), id]
      );

      // Log audit
      await this.db.logAudit(
        adminUser.userId,
        'DELETE',
        'users',
        id,
        currentUser,
        null,
        req.ip
      );

      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete user'
      });
    }
  }

  async getSystemStats(req, res) {
    try {
      const stats = await Promise.all([
        this.db.db.get('SELECT COUNT(*) as count FROM users WHERE is_active = 1'),
        this.db.db.get('SELECT COUNT(*) as count FROM categories WHERE is_active = 1'),
        this.db.db.get('SELECT COUNT(*) as count FROM nominees WHERE is_active = 1'),
        this.db.db.get('SELECT COUNT(*) as count FROM votes'),
        this.db.db.get('SELECT COUNT(DISTINCT session_id) as count FROM votes'),
        this.db.db.all(`
          SELECT c.title, COUNT(v.id) as vote_count
          FROM categories c
          LEFT JOIN nominees n ON c.id = n.category_id
          LEFT JOIN votes v ON n.id = v.nominee_id
          WHERE c.is_active = 1 AND c.is_award = 0
          GROUP BY c.id, c.title
          ORDER BY vote_count DESC
          LIMIT 5
        `),
        this.db.db.all(`
          SELECT DATE(created_at) as date, COUNT(*) as count
          FROM votes
          WHERE created_at >= date('now', '-7 days')
          GROUP BY DATE(created_at)
          ORDER BY date DESC
        `)
      ]);

      res.json({
        success: true,
        data: {
          total_users: stats[0].count,
          total_categories: stats[1].count,
          total_nominees: stats[2].count,
          total_votes: stats[3].count,
          unique_voters: stats[4].count,
          top_categories: stats[5],
          daily_votes: stats[6]
        }
      });
    } catch (error) {
      console.error('Get system stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch system statistics'
      });
    }
  }

  async createBackup(req, res) {
    try {
      const adminUser = req.user;
      const timestamp = new Date().toISOString();

      // Get all data
      const backup = {
        timestamp,
        users: await this.db.db.all('SELECT * FROM users'),
        categories: await this.db.db.all('SELECT * FROM categories'),
        nominees: await this.db.db.all('SELECT * FROM nominees'),
        votes: await this.db.db.all('SELECT * FROM votes'),
        system_settings: await this.db.db.all('SELECT * FROM system_settings'),
        audit_log: await this.db.db.all('SELECT * FROM audit_log WHERE created_at >= date("now", "-30 days")')
      };

      // Log audit
      await this.db.logAudit(
        adminUser.userId,
        'BACKUP_CREATED',
        'system',
        'backup',
        null,
        { timestamp },
        req.ip
      );

      res.json({
        success: true,
        message: 'Backup created successfully',
        data: backup
      });
    } catch (error) {
      console.error('Create backup error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create backup'
      });
    }
  }
}