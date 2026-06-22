import path from "path";
import multer from "multer";

// Destination folder for uploaded files (relative to project root)
const uploadDir = path.resolve(__dirname, "../../uploads");

// Configure storage engine
const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const safeName = file.fieldname.replace(/\s+/g, "_");
    cb(null, `${timestamp}-${safeName}${ext}`);
  },
});



// Optional: filter to accept only image files
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = /\.(jpeg|jpg|png|gif)$/i;
  if (allowed.test(file.originalname)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed") as any, false);
  }
};

export const uploads = multer({ storage, fileFilter });
