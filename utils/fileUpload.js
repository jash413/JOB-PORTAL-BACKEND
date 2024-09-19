// utils/fileUpload.js
const multer = require("multer");
const path = require("path");

// Define the storage location and filename structure
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Save files to the 'uploads/' directory
  },
  filename: function (req, file, cb) {
    // Save files with a timestamp and the original filename
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// File filter to validate file types (for images and resumes)
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = /jpeg|jpg|png/;
  const allowedDocumentTypes = /pdf/;

  const extname = path.extname(file.originalname).toLowerCase();
  const isImage = allowedImageTypes.test(extname);
  const isDocument = allowedDocumentTypes.test(extname);

  if (isImage || isDocument) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid file type. Only JPEG, PNG, and PDF files are allowed.")
    );
  }
};

// Upload middleware configuration for multiple files
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5, // Limit file size to 5MB
  },
  fileFilter: fileFilter,
});

// Middleware to handle multiple files
const multipleUpload = upload.fields([
  { name: "profileImage", maxCount: 1 },
  { name: "resume", maxCount: 1 },
]);

module.exports = { multipleUpload };
