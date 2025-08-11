const jwt = require("jsonwebtoken");
const Utilities = require("../helpers/functions");
const tokenBlacklist = require("../helpers/tokenBlacklist");
const db = require("../dbConfig/config");

// Middleware to authenticate the user based on the token
const authMiddleware = async (req, res, next) => {
  try {
    let token = req.headers.authorization; // Assuming Bearer token format
    let decoded;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Handle "Bearer <token>" format
    if (token.startsWith("Bearer ")) {
      token = token.slice(7).trim();
      decoded = await Utilities.verifyToken(token);
    }

    // console.log(decoded);
    // return;

    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized: invalid token " });
    }

    const blackList = Utilities.blackList();

    if (tokenBlacklist.isAccessTokenBlacklisted(decoded?.jti)) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Token is revoked" });
    }

    //  const user = await Utilities.verifyToken(token);
    // console.log(user);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

const authenticateSocket = async (socket, next) => {
  try {
    const User = db.models.admin;
    const token =
      socket.handshake.auth.token ||
      socket.handshake.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return next(new Error("Authentication token required"));
    }

    const decoded = Utilities.verifyToken(token);
    const user = await User.findById(decoded?.id);

    if (!user) {
      return next(new Error("Invalid token - user not found"));
    }

    socket.user = user;
    socket.userId = user?.id.toString();
    socket.userRole = user?.role || "user";

    console.log(
      `Socket authenticated for user: ${user.email || user.username} (${
        socket.userId
      })`
    );
    next();
  } catch (error) {
    console.error("Socket authentication error:", error.message);
    next(new Error("Invalid authentication token"));
  }
};

module.exports = { authMiddleware, authenticateSocket };
