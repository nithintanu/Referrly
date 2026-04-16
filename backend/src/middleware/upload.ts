import fs from "fs";
import path from "path";
import multer from "multer";
import { AppError } from "../utils/helpers";

const uploadRoot = path.resolve(process.cwd(), process.env.UPLOAD_DIR || "uploads");
const resumeDirectory = path.join(uploadRoot, "resumes");

fs.mkdirSync(resumeDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, resumeDirectory);
  },
  filename: (_req, file, callback) => {
    const timestamp = Date.now();
    const safeBaseName = path
      .basename(file.originalname, path.extname(file.originalname))
      .replace(/[^a-zA-Z0-9_-]/g, "-")
      .slice(0, 60);

    callback(null, `${timestamp}-${safeBaseName}${path.extname(file.originalname)}`);
  },
});

const allowedMimeTypes = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

export const resumeUpload = multer({
  storage,
  limits: {
    fileSize: Number(process.env.MAX_FILE_SIZE || 5 * 1024 * 1024),
  },
  fileFilter: (_req, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      callback(new AppError(400, "Only PDF, DOC, and DOCX resume uploads are supported"));
      return;
    }

    callback(null, true);
  },
});

export const uploadDirectory = uploadRoot;
