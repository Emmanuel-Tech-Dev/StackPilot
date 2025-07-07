const {
  uploadFromBuffer,
  uploadFromPath,
  deleteFile,
} = require("./dbConfig/cloudinary");
const fs = require("fs");

class UploadService {
  // Upload single file to Cloudinary
  async uploadSingleFile(file, folder = "home/testing folder") {
    try {
      const isImage = file.mimetype.startsWith("image/");
      const isVideo = file.mimetype.startsWith("video/");

      if (!isImage && !isVideo) {
        throw new Error("Only image and video files are supported");
      }

      const options = {
        folder,
        resource_type: isImage ? "image" : "video",
        public_id: file.originalname.split(".")[0], // Use original filename without extension
      };

      let result;

      if (file.buffer) {
        // Memory storage - upload from buffer
        result = await uploadFromBuffer(file.buffer, options);
      } else if (file.path) {
        // Disk storage - upload from file path
        result = await uploadFromPath(file.path, options);
        // Clean up temporary file
        fs.unlinkSync(file.path);
      } else {
        throw new Error("No file buffer or path found");
      }

      return {
        url: result.secure_url,
        public_id: result.public_id,
        resource_type: result.resource_type,
        format: result.format,
        size: result.bytes,
      };
    } catch (error) {
      // Clean up temporary file on error
      if (file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      throw error;
    }
  }

  // Upload multiple files to Cloudinary
  async uploadMultipleFiles(files, folder = "home/testing folder") {
    try {
      const uploadPromises = files.map((file) =>
        this.uploadSingleFile(file, folder)
      );
      const results = await Promise.all(uploadPromises);
      return results;
    } catch (error) {
      throw error;
    }
  }

  // Delete file from Cloudinary
  async deleteFile(publicId) {
    try {
      const result = await deleteFile(publicId);
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Get file type from mimetype
  getFileType(mimetype) {
    if (mimetype.startsWith("image/")) return "image";
    if (mimetype.startsWith("video/")) return "video";
    return "unknown";
  }
}

module.exports = new UploadService();
