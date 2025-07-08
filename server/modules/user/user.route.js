const express = require("express");
const userController = require("./user.controller");

const router = express.Router();

router.post("/register", userController.createUserAccount);
router.post("/login", userController.authenticate);
router.post("/refresh_token", userController.refreshAuthToken);

module.exports = router;
