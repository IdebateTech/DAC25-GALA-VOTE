import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class DatabaseManager {
  constructor() {
    this.db = null;
    this.dbPath = path.join(__dirname, '../data/dreamers_voting.db');
  }

  async initialize() {
    try {
      // Ensure data directory exists
      const dataDir = path.dirname(this.dbPath);
      await fs.mkdir(dataDir, { recursive: true });

      this.db = new sqlite3.Database(this.dbPath);
      
      // Promisify database methods
      this.db.run = promisify(this.db.run.bind(this.db));
      this.db.get = promisify(this.db.get.bind(this.db));
      this.db.all = promisify(this.db.all.bind(this.db));

      await this.createTables();
      await this.seedDefaultData();
      
      console.log('✅ Database initialized successfully');
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      throw error;
    }
  }

  async createTables() {
    const tables = [
      // Users table for admin authentication
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'user' CHECK(role IN ('admin', 'user')),
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Categories table
      `CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        icon TEXT NOT NULL,
        is_award BOOLEAN DEFAULT 0,
        display_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Nominees table
      `CREATE TABLE IF NOT EXISTS nominees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        photo_url TEXT,
        display_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE
      )`,

      // Votes table
      `CREATE TABLE IF NOT EXISTS votes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        category_id TEXT NOT NULL,
        nominee_id INTEGER NOT NULL,
        ip_address TEXT,
        user_agent TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE,
        FOREIGN KEY (nominee_id) REFERENCES nominees (id) ON DELETE CASCADE,
        UNIQUE(session_id, category_id)
      )`,

      // System settings table
      `CREATE TABLE IF NOT EXISTS system_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        description TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Audit log table
      `CREATE TABLE IF NOT EXISTS audit_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        action TEXT NOT NULL,
        table_name TEXT,
        record_id TEXT,
        old_values TEXT,
        new_values TEXT,
        ip_address TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`
    ];

    for (const table of tables) {
      await this.db.run(table);
    }

    // Create indexes for better performance
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_votes_session_category ON votes (session_id, category_id)',
      'CREATE INDEX IF NOT EXISTS idx_votes_category ON votes (category_id)',
      'CREATE INDEX IF NOT EXISTS idx_nominees_category ON nominees (category_id)',
      'CREATE INDEX IF NOT EXISTS idx_audit_log_user ON audit_log (user_id)',
      'CREATE INDEX IF NOT EXISTS idx_audit_log_created ON audit_log (created_at)'
    ];

    for (const index of indexes) {
      await this.db.run(index);
    }
  }

  async seedDefaultData() {
    // Check if admin user exists
    const adminExists = await this.db.get(
      'SELECT id FROM users WHERE role = ? LIMIT 1',
      ['admin']
    );

    if (!adminExists) {
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.hash('DAC2025_Gala_Admin!', 12);
      
      await this.db.run(
        `INSERT INTO users (username, email, password_hash, role) 
         VALUES (?, ?, ?, ?)`,
        ['dreamers_admin', 'admin@dreamersacademy.org', hashedPassword, 'admin']
      );
    }

    // Check if categories exist
    const categoriesExist = await this.db.get('SELECT id FROM categories LIMIT 1');
    
    if (!categoriesExist) {
      const defaultCategories = [
        {
          id: 'most-improved-debater',
          title: 'Most Improved Debater',
          description: 'Recognizing the debater who has shown the most significant improvement throughout their journey at Dreamers Academy Camp.',
          icon: '📈',
          is_award: 0,
          display_order: 1
        },
        {
          id: 'best-speaker',
          title: 'Best Speaker',
          description: 'Awarded to the most eloquent and persuasive speaker who consistently delivers outstanding performances.',
          icon: '🎤',
          is_award: 0,
          display_order: 2
        },
        {
          id: 'most-dedicated-camper',
          title: 'Most Dedicated Camper',
          description: 'For the camper who has shown unwavering commitment and dedication to the Dreamers Academy Camp community.',
          icon: '🏆',
          is_award: 0,
          display_order: 3
        },
        {
          id: 'leadership-excellence',
          title: 'Leadership Excellence Award',
          description: 'Recognizing outstanding leadership qualities and the ability to inspire and guide fellow campers.',
          icon: '👑',
          is_award: 0,
          display_order: 4
        },
        {
          id: 'lifetime-achievement',
          title: 'Lifetime Achievement Award',
          description: 'A special recognition for extraordinary contribution to Dreamers Academy Camp over the years.',
          icon: '🌟',
          is_award: 1,
          display_order: 5
        }
      ];

      for (const category of defaultCategories) {
        await this.db.run(
          `INSERT INTO categories (id, title, description, icon, is_award, display_order) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [category.id, category.title, category.description, category.icon, category.is_award, category.display_order]
        );
      }
    }

    // Insert default system settings
    const settings = [
      { key: 'voting_enabled', value: 'true', description: 'Enable/disable voting functionality' },
      { key: 'voting_end_date', value: '2025-07-10T23:59:59Z', description: 'Voting deadline' },
      { key: 'site_title', value: 'Dreamers Academy Camp - 10th Year Celebration Gala', description: 'Website title' },
      { key: 'max_votes_per_session', value: '1', description: 'Maximum votes per session per category' }
    ];

    for (const setting of settings) {
      const exists = await this.db.get('SELECT key FROM system_settings WHERE key = ?', [setting.key]);
      if (!exists) {
        await this.db.run(
          'INSERT INTO system_settings (key, value, description) VALUES (?, ?, ?)',
          [setting.key, setting.value, setting.description]
        );
      }
    }
  }

  async logAudit(userId, action, tableName, recordId, oldValues = null, newValues = null, ipAddress = null) {
    try {
      await this.db.run(
        `INSERT INTO audit_log (user_id, action, table_name, record_id, old_values, new_values, ip_address)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          action,
          tableName,
          recordId,
          oldValues ? JSON.stringify(oldValues) : null,
          newValues ? JSON.stringify(newValues) : null,
          ipAddress
        ]
      );
    } catch (error) {
      console.error('Failed to log audit:', error);
    }
  }

  async close() {
    if (this.db) {
      await new Promise((resolve, reject) => {
        this.db.close((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }
  }
}