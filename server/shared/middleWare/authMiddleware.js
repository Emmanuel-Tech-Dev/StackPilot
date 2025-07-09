const jwt = require("jsonwebtoken");
const Utilities = require("../helpers/functions");

const verifyToken = (token) =>
  new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
      if (error) {
        reject(error);
      } else {
        resolve(decoded);
      }
    });
  });
// Middleware to authenticate the user based on the token
const authMiddleware = async (req, res, next) => {
  let token = req.headers.authorization; // Assuming Bearer token format

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Handle "Bearer <token>" format
  if (token.startsWith("Bearer ")) {
    token = token.slice(7).trim();
  }

  const blackList = Utilities.blackList();

  if (blackList.has(token)) {
    return res
      .status(401)
      .json({ message: "Unauthorized: Token is blacklisted" });
  }
  try {
    const user = await Utilities.verifyToken(token);
    // console.log(user);
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

module.exports = authMiddleware;
