import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { Request } from "express";
import { Express } from "express-serve-static-core";

// Destination folder for uploads – create "uploads" at project root if it doesn't exist.
const uploadDir = path.resolve(__dirname, "../../uploads");

// Configure Multer storage with typed callbacks
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    cb(null, filename);
  },
});

export const uploads = multer({ storage });