const express = require("express");
const {
  authLogin,
  getUsers,
  getRoles,
} = require("../controller/definedController/authController");
const {
  authMiddleware,
  authorizeRoles,
} = require("../middleWare/authMiddleware");

const router = express.Router();

router.post("/login", authLogin);
router.get("/users", authMiddleware, authorizeRoles, getUsers);
router.get("/roles", authMiddleware, authorizeRoles, getRoles);
// router.get("/users", authMiddleware, authorizeRoles , getUsers)
// router.get("/users", authMiddleware, authorizeRoles , getUsers)

router.get("/user/profile", authMiddleware, (req, res) => {
  res.status(200).json({ message: "Your are authenticated!", user: req.user });
});

router.get("/user/endpoints", authMiddleware, authorizeRoles, (req, res) => {
  res.status(200).json({
    message: "Successfully retrieved resources",
    user: req.user,
    resources: {
      public: req.resources.public,
      apiEndpoints: req.resources.apiEndpoints,
      browserRoutes: req.resources.browserRoutes,
    },
  });
});

module.exports = router;
