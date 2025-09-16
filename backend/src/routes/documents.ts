import express from 'express';
import multer from 'multer';
import { DocumentController } from '../controllers/DocumentController';

const router = express.Router();
const documentController = new DocumentController();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_DIR || 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760') // 10MB default
  },
  fileFilter: (req, file, cb) => {
    // Allow text files, PDFs, and markdown
    const allowedTypes = ['text/plain', 'application/pdf', 'text/markdown'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only TXT, PDF, and MD files are allowed.'));
    }
  }
});

// Upload document
router.post('/upload', upload.single('document'), documentController.uploadDocument.bind(documentController));

// Get all documents (with optional search, category, and tags filters)
router.get('/', documentController.getDocuments.bind(documentController));

// Get document categories
router.get('/categories', documentController.getCategories.bind(documentController));

// Get document tags
router.get('/tags', documentController.getTags.bind(documentController));

// Get specific document
router.get('/:id', documentController.getDocument.bind(documentController));

// Delete document
router.delete('/:id', documentController.deleteDocument.bind(documentController));

export default router;
