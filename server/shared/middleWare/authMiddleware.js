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

const getUserRole = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user || !user.custom_id) {
      return res
        .status(401)
        .json({ message: "User not authenticated or missing custom_id" });
    }

    const Role = db.models.admin_user_roles;
    const userRole = await Role.findOne({
      where: { user_id: user.custom_id },
      attributes: ["role_id"],
      raw: true,
    });

    if (!userRole) {
      return res.status(403).json({ message: "No role assigned to this user" });
    }

    console.log("User Role:", userRole.role_id);
    req.role = userRole; // { role_id: <value> }
    next();
  } catch (error) {
    console.error("Error in getUserRole:", error);
    return res.status(401).json({ message: "Failed to retrieve user role" });
  }
};

const getPermission = async (req, res, next) => {
  try {
    const role = req.role;
    if (!role || !role.role_id) {
      return res.status(403).json({ message: "Role not found" });
    }

    const Permission = db.models.admin_role_permissions;
    const permissions = await Permission.findAll({
      where: { role_id: role.role_id },
      attributes: ["permission"],
      raw: true,
    });

    if (!permissions || permissions.length === 0) {
      return res
        .status(403)
        .json({ message: "No permissions assigned to this role" });
    }

    console.log("Permissions:", permissions);
    req.permission = permissions; // Array of permission objects
    next();
  } catch (error) {
    console.error("Error in get look:", error);
    return res.status(401).json({ message: "Failed to retrieve permissions" });
  }
};

const getResources = async (req, res, next) => {
  try {
    const permissions = req.permission;
    if (!permissions || permissions.length === 0) {
      return res.status(403).json({ message: "No permissions available" });
    }

    const permissionValues = permissions.map((p) => p.permission);
    const ResPerm = db.models.admin_permission_resources;
    const resources = await ResPerm.findAll({
      where: {
        permission: {
          [db.Sequelize.Op.in]: permissionValues,
        },
      },
      attributes: ["resource"],
      raw: true,
    });

    if (!resources || resources.length === 0) {
      return res
        .status(403)
        .json({ message: "No resources assigned to these permissions" });
    }

    const resourceNames = resources.map((r) => r.resource);
    const Resource = db.models.admin_resources;
    const resourceList = await Resource.findAll({
      where: {
        resource_name: {
          [db.Sequelize.Op.in]: resourceNames,
        },
      },
      raw: true,
    });

    console.log("Resources List:", resourceList);
    req.resource = resourceList; // Array of resource objects
    next();
  } catch (error) {
    console.error("Error in getResources:", error);
    return res.status(401).json({ message: "Failed to retrieve resources" });
  }
};

// Simple in-memory cache for user access
const getUserAccess = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user || !user.custom_id) {
      return res
        .status(401)
        .json({ message: "User not authenticated or missing custom_id" });
    }

    // Fresh map per request
    const resourceMap = new Map();

    // ✅ Fetch fresh from DB every time
    const query = `
      SELECT DISTINCT aur.role_id, ar.resource_name, ar.resource_path, ar.http_method, ar.resource_type
      FROM admin_user_roles aur
      LEFT JOIN admin_role_permissions arp ON aur.role_id = arp.role_id
      LEFT JOIN admin_permission_resources apr ON arp.permission = apr.permission
      LEFT JOIN admin_resources ar ON apr.resource = ar.resource_name
      WHERE aur.user_id = :user_id
        AND ar.resource_name IS NOT NULL
    `;

    const results = await db.query(query, {
      replacements: { user_id: user.custom_id },
      type: db.QueryTypes.SELECT,
    });

    if (!results || results.length === 0) {
      return res
        .status(403)
        .json({ message: "No role or resources assigned to this user" });
    }

    const role_id = results[0].role_id;

    results.forEach((r) => {
      if (!r) return;
      const key = `${r.resource_path}:${r.http_method}`;
      resourceMap.set(key, r);

      if (r.http_method === "ALL") {
        resourceMap.set(`${r.resource_path}:*`, r);
      }
    });

    const accessData = { role_id, resources: resourceMap };
    req.access = accessData;
    next();
  } catch (error) {
    console.error("Error in getUserAccess:", error);
    return res.status(401).json({ message: "Failed to retrieve user access" });
  }
};

module.exports = {
  authMiddleware,
  authenticateSocket,
  getUserRole,
  getPermission,
  getResources,
  getUserAccess,
};
