const express = require("express");
const uploadController = require("./upload.controller");
const {
  uploadSingle,
  uploadMultiple,
} = require("../../shared/dbConfig/multer");

const router = express.Router();

router.post(
  "/upload-file",
  uploadSingle.single("file"),
  uploadController.uploadSingle
);
router.post(
  "/upload-files",
  uploadMultiple.array("files", 5),
  uploadController.uploadMultiple
);
router.patch(
  "/replace-file/:oldPublicId",
  uploadSingle.single("file"),
  uploadController.replaceFile
);
router.delete(
  "/delete-file/:publicId",
  //   uploadSingle.single("file"),
  uploadController.deleteFile
);
router.put(
  "/update-file/:publicId",
  uploadSingle.single("file"),
  uploadController.updateFile
);
// router.get("/get-file", uploadCo);

module.exports = router;
