const { handleErrorResponse } = require("../middleware/errorHandler");

const { Op } = require("sequelize");
const db = require("../dbConfig/config");
const loadModels = db.models;
const getUserPermissions = async (userId) => {
  try {
    const { Resources, UserRoles, RolePermissions } = await loadModels();
    const { User } = db.models.users;

    // Get user info
    const user = await User.findOne({
      where: { id: userId },
      attributes: ["id", "custom_id"],
    });

    if (!user) {
      return { error: "User not found" };
    }

    // Get user's roles
    const userRoles = await UserRoles.findAll({
      where: { user_id: user.custom_id },
      attributes: ["role_id"],
    });

    // If user has no roles, return empty permissions
    if (userRoles.length === 0) {
      return {
        apiEndpoints: [],
        browserRoutes: [],
      };
    }

    // Get role IDs
    const roleIds = userRoles.map((ur) => ur.role_id);

    // Get permissions for these roles
    const rolePermissions = await RolePermissions.findAll({
      where: { role_id: { [Op.in]: roleIds } },
      attributes: ["permission"],
    });

    // If no permissions found, return empty permissions
    if (rolePermissions.length === 0) {
      return {
        apiEndpoints: [],
        browserRoutes: [],
      };
    }

    // Extract permission IDs
    const permissionIds = rolePermissions.map((rp) => rp.permission);

    // Query to get all resources the user has permission to access
    const query = `
      SELECT r.*
      FROM resources r
      JOIN permission_resources pr ON r.resource_name = pr.resource
      WHERE pr.permission IN (:permissionIds)
    `;

    const permittedResources = await db.query(query, {
      replacements: { permissionIds },
      type: db.QueryTypes.SELECT,
    });

    // Return the permitted resources grouped by type
    return {
      apiEndpoints: permittedResources.filter(
        (r) => r.resource_type === "API_ENDPOINT"
      ),
      browserRoutes: permittedResources.filter(
        (r) => r.resource_type === "BROWSER_ROUTE"
      ),
    };
  } catch (error) {
    console.error("Error getting user permissions:", error);
    return { error: "Failed to retrieve user permissions" };
  }
};

module.exports = getUserPermissions;
