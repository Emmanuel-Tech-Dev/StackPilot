const db = require("../../shared/dbConfig/config");
const logger = require("../../shared/middleWare/logger");
const uploadService = require("./upload.service");

class UploadController {
  // Upload single file
  //   async uploadSingle(req, res) {
  //     try {
  //       const file = req.file;

  //       if (!file) {
  //         return res.status(400).json({
  //           success: false,
  //           error: "No file uploaded",
  //         });
  //       }

  //       const result = await uploadService.uploadSingleFile(file);

  //       res.json({
  //         success: true,
  //         message: "File uploaded successfully",
  //         data: result,
  //       });
  //     } catch (error) {
  //       console.error("Upload error:", error);
  //       res.status(500).json({
  //         success: false,
  //         error: error.message || "Upload failed",
  //       });
  //     }
  //   }

  async uploadSingle(req, res) {
    try {
      const file = req.file;
      const body = req.body;
      const convertBody = JSON.parse(body.body);

      // console.log(convertBody);
      // return;

      if (!file) {
        return res.status(400).json({
          success: false,
          error: "No file uploaded",
        });
      }

      const User = db.models.admin;
      const Goals = db.models.goals;

      const results = await uploadService.uploadSingleFile(file, "New Project");
      const { data } = results;
      const dataWithFile = {
        ...convertBody,
        file_path: data.url,
        file_type: data.resource_type,
        file_storage_id: data.public_id,
      };

      if (!results) return;
      await Goals.create(dataWithFile);

      res.status(results?.statusCode).json({
        ...results,
      });
    } catch (error) {
      console.error("Upload error:", error);
      const response = {
        success: false,
        status: "error",
        statusCode: 500,
        message: "Operation failed!",
        errorMessage: error.message,
      };

      logger.error({ ...response, errorDetails: error });

      res.status(response?.statusCode).json({
        ...response,
      });
    }
  }

  // Upload multiple files
  async uploadMultiple(req, res) {
    try {
      const files = req.files;
      const { folder } = req.body;

      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          error: "No files uploaded",
        });
      }

      const uploadFolder = folder || "test";
      const results = await uploadService.uploadMultipleFiles(
        files,
        uploadFolder
      );

      res.status(results?.statusCode).json({
        ...results,
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Upload failed",
      });
    }
  }

  // Upload to specific folder
  async uploadToFolder(req, res) {
    try {
      const file = req.file;
      const { folder } = req.body;

      if (!file) {
        return res.status(400).json({
          success: false,
          error: "No file uploaded",
        });
      }

      const uploadFolder = folder || "home/Test";
      const result = await uploadService.uploadSingleFile(file, uploadFolder);

      res.status(result?.statusCode).json({
        ...result,
        folder: uploadFolder,
      });
    } catch (error) {
      console.error("Upload error:", error);

      const response = {
        success: false,
        status: "error",
        statusCode: 500,
        message: "Operation failed!",
        errorMessage: error.message,
      };

      logger.error({ ...response, errorDetails: error });

      res.status(response?.statusCode).json({
        ...response,
      });
    }
  }

  async updateFile(req, res) {
    try {
      const file = req.file;
      const { publicId } = req.params;
      const { folder } = req.body;

      if (!file) {
        return res.status(400).json({
          success: false,
          error: "No file uploaded",
        });
      }

      if (!publicId) {
        return res.status(400).json({
          success: false,
          error: "Public ID is required",
        });
      }

      const uploadFolder = folder || "home/Test";
      const result = await uploadService.updateFile(
        file,
        publicId,
        uploadFolder
      );

      res.status(result?.statusCode).json({
        ...result,
        folder: uploadFolder,
      });
    } catch (error) {
      console.error("Update error:", error);

      const response = {
        success: false,
        status: "error",
        statusCode: 500,
        message: "Operation failed!",
        errorMessage: error.message,
      };

      logger.error({ ...response, errorDetails: error });

      res.status(response?.statusCode).json({
        ...response,
      });
    }
  }

  // Replace file (delete old, upload new)
  async replaceFile(req, res) {
    try {
      const file = req.file;
      const { oldPublicId } = req.params;
      const { folder } = req.body;

      if (!file) {
        res.status(400).json({
          success: false,
          error: "No file uploaded",
        });
        logger.error({
          success: false,
          error: "No file uploaded",
        });
        return;
      }

      if (!oldPublicId) {
        res.status(400).json({
          success: false,
          error: "Old Public ID is required",
        });

        logger.error({
          success: false,
          error: "Old Public File ID is required",
        });

        return;
      }

      const uploadFolder = folder || "home/Test";
      const result = await uploadService.replaceFile(
        file,
        oldPublicId,
        uploadFolder
      );

      res.status(result?.statusCode).json({
        ...result,
      });
    } catch (error) {
      console.error("Replace error:", error);
      const response = {
        success: false,
        status: "error",
        statusCode: 500,
        message: "Operation failed!",
        errorMessage: error.message,
      };

      logger.error({ ...response, errorDetails: error });

      res.status(response?.statusCode).json({
        ...response,
      });
    }
  }

  // Delete file
  async deleteFile(req, res) {
    try {
      const { publicId } = req.params;

      if (!publicId) {
        return res.status(400).json({
          success: false,
          error: "Public ID is required",
        });
      }

      const result = await uploadService.deleteFile(publicId);

      res.status(result?.statusCode).json({
        ...result,
      });
    } catch (error) {
      const response = {
        success: false,
        status: "error",
        statusCode: 500,
        message: "Operation failed!",
        errorMessage: error.message,
      };

      logger.error({ ...response, errorDetails: error });

      res.status(response?.statusCode).json({
        ...response,
      });
    }
  }
}

module.exports = new UploadController();
