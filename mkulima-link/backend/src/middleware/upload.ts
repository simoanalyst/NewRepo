import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Request } from 'express';
import fs from 'fs';

const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';

// Ensure upload directories exist
const dirs = ['products', 'profiles', 'farms', 'warehouses', 'documents'].map(
  (d) => path.join(UPLOAD_DIR, d)
);
dirs.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const storage = (folder: string) =>
  multer.diskStorage({
    destination: (_req, _file, cb) => {
      const dest = path.join(UPLOAD_DIR, folder);
      cb(null, dest);
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${uuidv4()}${ext}`);
    },
  });

const imageFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG and WebP images are allowed'));
  }
};

const documentFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only images and PDF/DOC files are allowed'));
  }
};

export const uploadProductImages = multer({
  storage: storage('products'),
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 8 }, // 5MB, max 8 files
});

export const uploadProfilePhoto = multer({
  storage: storage('profiles'),
  fileFilter: imageFilter,
  limits: { fileSize: 3 * 1024 * 1024, files: 1 }, // 3MB, 1 file
});

export const uploadFarmPhotos = multer({
  storage: storage('farms'),
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 10 },
});

export const uploadDocuments = multer({
  storage: storage('documents'),
  fileFilter: documentFilter,
  limits: { fileSize: 10 * 1024 * 1024, files: 5 },
});
