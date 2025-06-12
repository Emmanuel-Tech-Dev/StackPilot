const jwt = require("jsonwebtoken");

const { Op } = require("sequelize");
const db = require("../dbConfig/config");
const User = db.models.users;
const loadModels = db.models;
const { handleErrorResponse } = require("../middleware/errorHandler");

// Middleware to authenticate the user based on the token
const authMiddleware = async (req, res, next) => {
  const token = req.cookies.accessToken; // Assuming Bearer token format

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const user = await utils.verifyToken(token);
    // Attach the decoded user information to the request object
    req.user = user;
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

// Optional: Middleware for role-based access control
const authorizeRoles = async (req, res, next) => {
  try {
    const { Resources, UserRoles, RolePermissions } = await loadModels();
    const userId = req.user.id;
    const method = req.method;
    const path = req.path;

    // First, check if the requested resource is public
    const publicResource = await Resources.findOne({
      where: {
        is_public: 1,
        resource_path: path,
        [Op.or]: [{ http_method: "ALL" }, { http_method: method }],
      },
    });

    // If it's a public resource, allow access
    if (publicResource) {
      console.log(`Public resource access: ${method} ${path}`);
      return next();
    }

    // Get user info
    const user = await User.findOne({
      where: { id: userId },
      attributes: ["id", "custom_id"],
    });

    if (!user) {
      return handleErrorResponse(res, 404, "User not found", "error");
    }

    // Get user's roles
    const userRoles = await UserRoles.findAll({
      where: { user_id: user.custom_id },
      attributes: ["role_id"],
    });

    // If user has no roles, deny access to non-public resources
    if (userRoles.length === 0) {
      return handleErrorResponse(
        res,
        403,
        "You don't have permission to access this resource",
        "error"
      );
    }

    // Get role IDs
    const roleIds = userRoles.map((ur) => ur.role_id);

    // Get permissions for these roles
    const rolePermissions = await RolePermissions.findAll({
      where: { role_id: { [Op.in]: roleIds } },
      attributes: ["permission"],
    });

    // If no permissions found, deny access
    if (rolePermissions.length === 0) {
      return handleErrorResponse(
        res,
        403,
        "No permissions assigned to your roles",
        "error"
      );
    }

    // Extract permission IDs
    const permissionIds = rolePermissions.map((rp) => rp.permission);

    // Query to check if user has permission to access this specific resource
    const query = `
      SELECT r.*
      FROM resources r
      JOIN permission_resources pr ON r.resource_name = pr.resource
      WHERE 
        pr.permission IN (:permissionIds)
        AND r.resource_path = :path
        AND (r.http_method = :method OR r.http_method = 'ALL')
    `;

    const permittedResources = await db.query(query, {
      replacements: { permissionIds, method, path },
      type: db.QueryTypes.SELECT,
    });

    // If the user doesn't have permission for this resource, deny access
    if (permittedResources.length === 0) {
      return handleErrorResponse(
        res,
        403,
        "You don't have permission to access this resource",
        "error"
      );
    }

    // User has permission, proceed
    console.log(`Authorized access: ${method} ${path}`);

    // Attach resource info to request for potential later use
    req.resources = {
      apiEndpoints: permittedResources.filter(
        (r) => r.resource_type === "API_ENDPOINT"
      ),
      browserRoutes: permittedResources.filter(
        (r) => r.resource_type === "BROWSER_ROUTE"
      ),
    };

    next();
  } catch (error) {
    console.error("Authorization error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { authMiddleware, authorizeRoles };
