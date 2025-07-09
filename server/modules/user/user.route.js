const express = require("express");
const userController = require("./user.controller");
const authMiddleware = require("../../shared/middleWare/authMiddleware");

const router = express.Router();

router.get("/user", authMiddleware, (req, res) => {
  res.status(200).json({ message: "Your are authenticated!", user: req.user });
});

router.post("/register", userController.createUserAccount);
router.post("/login", userController.authenticate);
router.post("/refresh_token", userController.refreshAuthToken);
router.post("/logout", userController.logoutUser);
router.post("/forget_password", userController.forgetPassword);
router.post("/verify_password/:token", userController.verifyPasswordRestToken);

module.exports = router;
