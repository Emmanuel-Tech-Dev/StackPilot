const express = require("express");
const db = require("../../shared/dbConfig/config.js");
const genericController = require("./base.controller.js");

const validateModel = require("../../shared/middleWare/validateModel.js");
const authMiddleware = require("../../shared/middleWare/authMiddleware.js");
const cachedMiddleware = require("../../shared/middleWare/cachedMiddleWare.js");
const { uploadSingle } = require("../../shared/dbConfig/multer.js");
const { asyncHandler } = require("../../shared/middleWare/errorHandler.js");
const CacheManager = require("../../shared/helpers/cacheManager.js");

const cache = new CacheManager({
  maxItems: 1000,
  ttl: 1000 * 60 * 15, // 15 minutes
  dormancyThreshold: 1000 * 60 * 60, // 1 hour dormancy
  cleanupInterval: 1000 * 60 * 10, // Cleanup every 10 minutes
});
const router = express.Router();

// console.log("All database Model : ", db.models);

router.get("/cache/analytics", (req, res) => {
  res.json(cache.getAnalytics());
});

router.get("/cache/patterns", (req, res) => {
  res.json(cache.findAccessPatterns());
});
router.get("/cache/dormantentries", (req, res) => {
  res.json(cache.getDormantEntries());
});

router.get("/cache/cleanup", (req, res) => {
  const cleaned = cache.cleanupDormantEntries();
  res.json({ message: `Cleaned up ${cleaned} dormant entries` });
});

router
  .route("/:resources")
  .get(
    validateModel(db.models),
    // validateSchema()
    // authMiddleware,
    // authorizeRoles,
    cachedMiddleware(cache),
    asyncHandler(genericController.getAll)
  )
  .post(validateModel(db.models), asyncHandler(genericController.create));

router
  .route("/:resources/:id")
  .get(validateModel(db.models), asyncHandler(genericController.getOne))
  .put(validateModel(db.models), asyncHandler(genericController.updateOne))
  .delete(validateModel(db.models), asyncHandler(genericController.deleteOne));

module.exports = router;
