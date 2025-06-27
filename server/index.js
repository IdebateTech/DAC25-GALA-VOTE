import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import { DatabaseManager } from './database/DatabaseManager.js';
import { AuthController } from './controllers/AuthController.js';
import { CategoryController } from './controllers/CategoryController.js';
import { VotingController } from './controllers/VotingController.js';
import { AdminController } from './controllers/AdminController.js';
import { FileUploadController } from './controllers/FileUploadController.js';
import { authenticateToken, requireAdmin } from './middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? false : "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Initialize database
const db = new DatabaseManager();
await db.initialize();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'", "ws:", "wss:"]
    }
  }
}));

app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? false : "http://localhost:5173",
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many authentication attempts, please try again later.'
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Initialize controllers
const authController = new AuthController(db);
const categoryController = new CategoryController(db, io);
const votingController = new VotingController(db, io);
const adminController = new AdminController(db, io);
const fileUploadController = new FileUploadController(db, io);

// Auth routes
app.post('/api/auth/login', authLimiter, authController.login.bind(authController));
app.post('/api/auth/refresh', authenticateToken, authController.refreshToken.bind(authController));
app.post('/api/auth/logout', authenticateToken, authController.logout.bind(authController));

// Category routes
app.get('/api/categories', categoryController.getCategories.bind(categoryController));
app.post('/api/categories', authenticateToken, requireAdmin, categoryController.createCategory.bind(categoryController));
app.put('/api/categories/:id', authenticateToken, requireAdmin, categoryController.updateCategory.bind(categoryController));
app.delete('/api/categories/:id', authenticateToken, requireAdmin, categoryController.deleteCategory.bind(categoryController));

// Nominee routes
app.post('/api/categories/:id/nominees', authenticateToken, requireAdmin, categoryController.addNominee.bind(categoryController));
app.put('/api/categories/:categoryId/nominees/:nomineeId', authenticateToken, requireAdmin, categoryController.updateNominee.bind(categoryController));
app.delete('/api/categories/:categoryId/nominees/:nomineeId', authenticateToken, requireAdmin, categoryController.deleteNominee.bind(categoryController));

// Voting routes
app.post('/api/vote', votingController.castVote.bind(votingController));
app.get('/api/votes/stats', votingController.getVoteStats.bind(votingController));
app.get('/api/votes/user/:sessionId', votingController.getUserVotes.bind(votingController));

// File upload routes
app.post('/api/upload/nominee-photo', authenticateToken, requireAdmin, fileUploadController.uploadNomineePhoto.bind(fileUploadController));
app.delete('/api/upload/nominee-photo/:filename', authenticateToken, requireAdmin, fileUploadController.deleteNomineePhoto.bind(fileUploadController));

// Admin routes
app.get('/api/admin/users', authenticateToken, requireAdmin, adminController.getUsers.bind(adminController));
app.post('/api/admin/users', authenticateToken, requireAdmin, adminController.createUser.bind(adminController));
app.put('/api/admin/users/:id', authenticateToken, requireAdmin, adminController.updateUser.bind(adminController));
app.delete('/api/admin/users/:id', authenticateToken, requireAdmin, adminController.deleteUser.bind(adminController));
app.get('/api/admin/system-stats', authenticateToken, requireAdmin, adminController.getSystemStats.bind(adminController));
app.post('/api/admin/backup', authenticateToken, requireAdmin, adminController.createBackup.bind(adminController));

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('join-admin', (token) => {
    // Verify admin token and join admin room for real-time updates
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dreamers-secret-key');
      if (decoded.role === 'admin') {
        socket.join('admin-room');
        console.log('Admin joined room:', socket.id);
      }
    } catch (error) {
      console.error('Invalid admin token for socket:', error);
    }
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Database initialized successfully`);
  console.log(`🔒 Security middleware enabled`);
  console.log(`⚡ Real-time updates enabled`);
});

export { io };