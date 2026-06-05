import multer from "multer";
import { FILE_TYPE_NOT_ALLOWED } from "../constants/messages.js";
import { MIME_JPEG, MIME_PDF, MIME_PNG } from "../constants/labels.js";

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowed = [MIME_JPEG, MIME_PNG, MIME_PDF];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(FILE_TYPE_NOT_ALLOWED));
    }
  },
});
