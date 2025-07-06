const express = require("express");
const db = require("../../shared/dbConfig/config.js");
const genericController = require("./base.controller.js");

const validateModel = require("../../shared/middleWare/validateModel.js");
// const validateSchema = require("../../shared/middleWare/validateSchema.js");
// const { Task, Goals, TwelveWeekYear, Week } = require("../model/index.js");
const {
  authMiddleware,
  authorizeRoles,
} = require("../../shared/middleWare/authMiddleware.js");

const router = express.Router();

// console.log("All database Model : ", db.models);

router
  .route("/:resources")
  .get(
    validateModel(db.models),
    // validateSchema()
    // authMiddleware,
    // authorizeRoles,
    genericController.getAll
  )
  .post(validateModel(db.models), genericController.create);

router
  .route("/:resources/:id")
  .get(validateModel(db.models), genericController.getOne)
  .put(validateModel(db.models), genericController.updateOne)
  .delete(validateModel(db.models), genericController.deleteOne);

module.exports = router;
