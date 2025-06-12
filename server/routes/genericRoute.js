const express = require("express");
const db = require("../dbConfig/config");
const genericController = require("../controller/genericController");

const validateModel = require("../middleWare/validateModel");
// const { Task, Goals, TwelveWeekYear, Week } = require("../model/index.js");
const {
  authMiddleware,
  authorizeRoles,
} = require("../middleWare/authMiddleware.js");

const router = express.Router();

console.log("All database Model : ", db.models);

router
  .route("/:resources")
  .get(
    validateModel(db.models),
    // authMiddleware,
    // authorizeRoles,
    genericController.getAll
  )
  .post(validateModel(db.models), genericController.create);

router
  .route("/:resources/:id")
  .get(validateModel(db.models), genericController.getOne)
  .put(validateModel(db.models), genericController.updateOne);

module.exports = router;
