// const express = require("express");
// const genericController = require("../controller/genericController");
// const validateModel = require("../middleWare/validateModel");
// const { Goals, TwelveWeekYear } = require("../model");
// const User = require("../model/UserModel");

// const router = express.Router();

// const models = {
//   // user: User,
//   goals: Goals,
//   twelveweekyear: TwelveWeekYear,
// };

// router.get("/:resources", validateModel(models), genericController.getAll);
// router.get("/:resources/:id", validateModel(models), genericController.getOne);
// router.get(
//   "/:resources/user",
//   validateModel(models),
//   genericController.getByUser
// );
// //
// module.exports = router;
