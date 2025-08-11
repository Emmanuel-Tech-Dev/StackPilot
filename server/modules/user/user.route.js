const express = require("express");
const userController = require("./user.controller");
const { authMiddleware } = require("../../shared/middleWare/authMiddleware");
const {
  errorHandler,
  asyncHandler,
} = require("../../shared/middleWare/errorHandler");
const PaymentManager = require("../../shared/helpers/paymentManager");
const transaction = require("../tansactions/tansact.controller");

const payment = new PaymentManager();

const router = express.Router();

router.get("/user", authMiddleware, (req, res) => {
  const user = req.user;
  const data = {
    user_id: user?.custom_id,
    email: user?.email,
  };
  res.status(200).json({ message: "Your are authenticated!", user: data });
});

router.post("/register", asyncHandler(userController.createUserAccount));
router.post("/login", asyncHandler(userController.authenticate));
router.post("/refresh_token", asyncHandler(userController.refreshAuthToken));
router.post("/logout", asyncHandler(userController.logoutUser));
router.post("/forget_password", asyncHandler(userController.forgetPassword));
router.post(
  "/verify_password/:token",
  asyncHandler(userController.verifyPasswordRestToken)
);
router.post("/otp", asyncHandler(userController.passwordLessAuth));
router.post(
  "/verify_otp",
  asyncHandler(userController.verifyPasswordLessToken)
);
router.post(
  "/reset_password",
  authMiddleware,
  asyncHandler(userController.changePassword)
);

router.post("/create_dva", asyncHandler(transaction.initPayment));
// router.use(errorHandler);
module.exports = router;
