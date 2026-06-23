import { Request } from "express";

declare global {
  namespace Express {
    interface Request {
        /** Multer file uploaded via single('profileImage') */
        file?: Express.Multer.File;
        /** Multer multiple files */
        files?: Express.Multer.File[];
        /** Authenticated user payload added by auth middleware */
        user?: { userId: string; email: string };
    }
  }
}

export {};