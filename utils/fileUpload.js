// utils/fileUpload.js
const multer = require("multer");
const path = require("path");
const fs = require("fs").promises;

/**
 * Creates a dynamic file upload configuration.
 * @param {Object} config - Configuration options
 * @param {string} [config.uploadDir='uploads'] - Directory for file uploads
 * @param {Object} [config.fileTypes] - Allowed file types and their corresponding MIME types
 * @param {number} [config.maxFileSize=5 * 1024 * 1024] - Maximum file size in bytes (default: 5MB)
 * @returns {Object} Multer middleware and utility functions
 */
const createFileUploadConfig = (config = {}) => {
  const {
    uploadDir = "uploads",
    fileTypes = {
      image: /jpeg|jpg|png/,
      document: /pdf/,
    },
    maxFileSize = 5 * 1024 * 1024,
  } = config;

  const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
      try {
        await fs.mkdir(uploadDir, { recursive: true });
        cb(null, uploadDir);
      } catch (error) {
        cb(error);
      }
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(
        null,
        `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`
      );
    },
  });

  const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase().slice(1);
    const isAllowedType = Object.values(fileTypes).some((regex) =>
      regex.test(ext)
    );

    if (isAllowedType) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `Invalid file type. Allowed types: ${Object.keys(fileTypes).join(
            ", "
          )}`
        )
      );
    }
  };

  const upload = multer({
    storage,
    limits: { fileSize: maxFileSize },
    fileFilter,
  });

  /**
   * Removes uploaded files in case of an error
   * @param {string[]} filePaths - Array of file paths to delete
   */
  const cleanupOnError = async (filePaths) => {
    const deletePromises = filePaths.map((filePath) =>
      fs
        .unlink(filePath)
        .catch((err) => console.error(`Error deleting file ${filePath}:`, err))
    );
    await Promise.all(deletePromises);
  };

  /**
   * Handles file upload for specified fields and returns file paths
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {string|string[]} fields - Field name(s) for file upload
   * @returns {Promise<Object>} Object containing file paths for each field
   */
  const uploadFiles = (req, res, fields) => {
    return new Promise((resolve, reject) => {
      const uploadFields = Array.isArray(fields) ? fields : [fields];
      const multerUpload = upload.fields(
        uploadFields.map((field) => ({ name: field, maxCount: 1 }))
      );

      multerUpload(req, res, async (err) => {
        if (err) {
          reject(err);
        } else {
          const result = {};
          const uploadedPaths = [];

          if (req.files) {
            for (const [fieldName, files] of Object.entries(req.files)) {
              if (files && files.length > 0) {
                result[fieldName] = files[0].path;
                uploadedPaths.push(files[0].path);
              }
            }
          }

          if (Object.keys(result).length === 0) {
            await cleanupOnError(uploadedPaths);
            reject(new Error("No files were uploaded"));
          } else {
            resolve(result);
          }
        }
      });
    });
  };

  return {
    uploadFiles,
    cleanupOnError,
    uploadDir,
  };
};

module.exports = createFileUploadConfig;
