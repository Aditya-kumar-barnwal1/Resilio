import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Reconstruct __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage Strategy
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // Save to server/uploads
  },
  filename: function (req, file, cb) {
    // Naming: emergency-TIMESTAMP.jpg
    cb(null, `emergency-${Date.now()}${path.extname(file.originalname)}`);
  }
});

// File Filter (Images Only)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only images are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

export default upload;