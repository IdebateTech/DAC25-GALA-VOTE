import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/nominees');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'nominee-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

export class FileUploadController {
  constructor(db, io) {
    this.db = db;
    this.io = io;
    this.upload = upload.single('photo');
  }

  async uploadNomineePhoto(req, res) {
    this.upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }

      try {
        const { nomineeId } = req.body;
        const user = req.user;

        if (!req.file) {
          return res.status(400).json({
            success: false,
            message: 'No file uploaded'
          });
        }

        if (!nomineeId) {
          // Clean up uploaded file
          await fs.unlink(req.file.path);
          return res.status(400).json({
            success: false,
            message: 'Nominee ID is required'
          });
        }

        // Verify nominee exists
        const nominee = await this.db.db.get(
          'SELECT * FROM nominees WHERE id = ? AND is_active = 1',
          [nomineeId]
        );

        if (!nominee) {
          // Clean up uploaded file
          await fs.unlink(req.file.path);
          return res.status(404).json({
            success: false,
            message: 'Nominee not found'
          });
        }

        // Delete old photo if exists
        if (nominee.photo_url) {
          const oldPhotoPath = path.join(__dirname, '../uploads/nominees', path.basename(nominee.photo_url));
          try {
            await fs.unlink(oldPhotoPath);
          } catch (error) {
            // Ignore error if file doesn't exist
          }
        }

        // Update nominee with new photo URL
        const photoUrl = `/uploads/nominees/${req.file.filename}`;
        await this.db.db.run(
          'UPDATE nominees SET photo_url = ?, updated_at = ? WHERE id = ?',
          [photoUrl, new Date().toISOString(), nomineeId]
        );

        // Log audit
        await this.db.logAudit(
          user.userId,
          'PHOTO_UPLOAD',
          'nominees',
          nomineeId,
          { photo_url: nominee.photo_url },
          { photo_url: photoUrl },
          req.ip
        );

        // Emit real-time update
        this.io.emit('nominee-photo-updated', {
          nominee_id: nomineeId,
          photo_url: photoUrl
        });

        res.json({
          success: true,
          message: 'Photo uploaded successfully',
          data: {
            photo_url: photoUrl
          }
        });
      } catch (error) {
        console.error('Upload nominee photo error:', error);
        
        // Clean up uploaded file on error
        if (req.file) {
          try {
            await fs.unlink(req.file.path);
          } catch (unlinkError) {
            console.error('Failed to clean up uploaded file:', unlinkError);
          }
        }

        res.status(500).json({
          success: false,
          message: 'Failed to upload photo'
        });
      }
    });
  }

  async deleteNomineePhoto(req, res) {
    try {
      const { filename } = req.params;
      const user = req.user;

      // Find nominee with this photo
      const nominee = await this.db.db.get(
        'SELECT * FROM nominees WHERE photo_url LIKE ? AND is_active = 1',
        [`%${filename}`]
      );

      if (!nominee) {
        return res.status(404).json({
          success: false,
          message: 'Photo not found'
        });
      }

      // Delete file
      const filePath = path.join(__dirname, '../uploads/nominees', filename);
      try {
        await fs.unlink(filePath);
      } catch (error) {
        console.error('Failed to delete file:', error);
      }

      // Update nominee to remove photo URL
      await this.db.db.run(
        'UPDATE nominees SET photo_url = NULL, updated_at = ? WHERE id = ?',
        [new Date().toISOString(), nominee.id]
      );

      // Log audit
      await this.db.logAudit(
        user.userId,
        'PHOTO_DELETE',
        'nominees',
        nominee.id,
        { photo_url: nominee.photo_url },
        { photo_url: null },
        req.ip
      );

      // Emit real-time update
      this.io.emit('nominee-photo-deleted', {
        nominee_id: nominee.id
      });

      res.json({
        success: true,
        message: 'Photo deleted successfully'
      });
    } catch (error) {
      console.error('Delete nominee photo error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete photo'
      });
    }
  }
}