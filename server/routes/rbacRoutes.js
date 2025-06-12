const express = require("express");
const {
  authMiddleware,
  authorizeRoles,
} = require("../middleWare/authMiddleware");

const { handleErrorResponse } = require("../middleware/errorHandler");
const db = require("../dbConfig/config");
const loadModels = db.models;
const User = db.models.users;
const router = express.Router();

// Role Management (continued)
router.put(
  "/api/roles/:id",
  authMiddleware,
  authorizeRoles,
  async (req, res) => {
    try {
      const { Roles } = await loadModels();
      const { roleName, description, isSystemRole } = req.body;
      const roleId = req.params.id;

      const role = await Roles.findByPk(roleId);
      if (!role) {
        return res.status(404).json({ message: "Role not found" });
      }

      await role.update({
        role_name: roleName,
        description,
        is_system_role: isSystemRole || false,
      });

      res.json({ message: "Role updated successfully" });
    } catch (error) {
      console.error("Error updating role:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

router.delete(
  "/api/roles/:id",
  authMiddleware,
  authorizeRoles,
  async (req, res) => {
    try {
      const { Roles } = await loadModels();
      const roleId = req.params.id;
      const role = await Roles.findByPk(roleId);

      if (!role) {
        return res.status(404).json({ message: "Role not found" });
      }

      if (role.is_system_role) {
        return res
          .status(403)
          .json({ message: "System roles cannot be deleted" });
      }

      await role.destroy();
      res.json({ message: "Role deleted successfully" });
    } catch (error) {
      console.error("Error deleting role:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Permission Management
router.get("/permissions", authMiddleware, authorizeRoles, async (req, res) => {
  try {
    const { Permissions } = await loadModels();
    const permissions = await Permissions.findAll();
    res.json(permissions);
  } catch (error) {
    console.error("Error fetching permissions:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post(
  "/permissions",
  authMiddleware,
  authorizeRoles,
  async (req, res) => {
    try {
      const { Permissions } = await loadModels();
      const { permissionName, description } = req.body;

      const permission = await Permissions.create({
        permission_name: permissionName,
        description,
      });

      res.status(201).json({
        permissionId: permission.permission_id,
        message: "Permission created successfully",
      });
    } catch (error) {
      console.error("Error creating permission:", error);
      if (error.name === "SequelizeUniqueConstraintError") {
        return res
          .status(400)
          .json({ message: "Permission name already exists" });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

router.put(
  "permissions/:id",
  authMiddleware,
  authorizeRoles,
  async (req, res) => {
    try {
      const { Permissions } = await loadModels();
      const { permissionName, description } = req.body;
      const permissionId = req.params.id;

      const permission = await Permissions.findByPk(permissionId);
      if (!permission) {
        return res.status(404).json({ message: "Permission not found" });
      }

      await permission.update({
        permission_name: permissionName,
        description,
      });

      res.json({ message: "Permission updated successfully" });
    } catch (error) {
      console.error("Error updating permission:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

router.delete(
  "/permissions/:id",
  authMiddleware,
  authorizeRoles,
  async (req, res) => {
    try {
      const { Permissions } = await loadModels();
      const permissionId = req.params.id;
      const permission = await Permissions.findByPk(permissionId);

      if (!permission) {
        return res.status(404).json({ message: "Permission not found" });
      }

      await permission.destroy();
      res.json({ message: "Permission deleted successfully" });
    } catch (error) {
      console.error("Error deleting permission:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Resource Management
router.get("/resources", authMiddleware, authorizeRoles, async (req, res) => {
  try {
    const { Resources } = await loadModels();
    const resources = await Resources.findAll();
    res.status(201).json({
      message: "Operation Successsfull",
      status: "Ok",
      data: resources,
    });
  } catch (error) {
    console.error("Error fetching resources:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get(
  "/browser/resources",
  authMiddleware,
  authorizeRoles,
  async (req, res) => {
    try {
      console.log(req.apiResources, req.browserResources);
      const { Resources } = await loadModels();
      const resources = await Resources.findAll({
        where: { resource_type: "BROWSER_ROUTE" },
        attributes: ["resource_path", "description"],
      });
      if (!resources || resources.length === 0) {
        return res.status(404).json({ message: "Browser Resource not found" });
      }
      res.status(200).json({
        message: "Browser Resources fetched successfully",
        data: resources,
      });
    } catch (error) {
      console.error("Error fetching browser resources:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

router.post("/resources", authMiddleware, authorizeRoles, async (req, res) => {
  try {
    const { Resources } = await loadModels();
    const {
      resourceName,
      resourceType,
      resourcePath,
      httpMethod,
      description,
      isPublic,
    } = req.body;

    const resource = await Resources.create({
      resource_name: resourceName,
      resource_type: resourceType,
      resource_path: resourcePath,
      http_method: httpMethod || "ALL",
      description,
      is_public: isPublic || false,
    });

    res.status(201).json({
      resourceId: resource.id,
      message: "Resource created successfully",
    });
  } catch (error) {
    console.error("Error creating resource:", error);
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        message: "Resource with this path, method and type already exists",
      });
    }
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put(
  "/resources/:id",
  authMiddleware,
  authorizeRoles,
  async (req, res) => {
    try {
      const { Resources } = await loadModels();
      const {
        resourceName,
        resourceType,
        resourcePath,
        httpMethod,
        description,
        isPublic,
      } = req.body;
      const resourceId = req.params.id;

      const resource = await Resources.findByPk(resourceId);
      if (!resource) {
        return res.status(404).json({ message: "Resource not found" });
      }

      await resource.update({
        resource_name: resourceName,
        resource_type: resourceType,
        resource_path: resourcePath,
        http_method: httpMethod || "ALL",
        description,
        is_public: isPublic || false,
      });

      res.status(201).json({ message: "Resource updated successfully" });
    } catch (error) {
      console.error("Error updating resource:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

router.delete(
  "/resources/:id",
  authMiddleware,
  authorizeRoles,
  async (req, res) => {
    try {
      const { Resources } = await loadModels();
      const resourceId = req.params.id;
      const resource = await Resources.findByPk(resourceId);

      if (!resource) {
        return res.status(404).json({ message: "Resource not found" });
      }

      await resource.destroy();
      res.json({ message: "Resource deleted successfully" });
    } catch (error) {
      console.error("Error deleting resource:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// User-Role Management
// router.get(
//   "/users/:userId/roles",
//   authMiddleware,
//   authorizeRoles,
//   async (req, res) => {
//     try {
//       const userId = req.params.userId;

//       const user = await User.findByPk(userId);
//       if (!user) {
//         return res.status(404).json({ message: "User not found" });
//       }

//       const roles = await user.getRoles();
//       res.json(roles);
//     } catch (error) {
//       console.error("Error fetching user roles:", error);
//       res.status(500).json({ message: "Internal server error" });
//     }
//   }
// );

// router.post(
//   "/api/users/:userId/roles",
//   authMiddleware,
//   authorizeRoles,
//   async (req, res) => {
//     try {
//          const { Roles } = await loadModels();
//       const userId = req.params.userId;
//       const { roleIds } = req.body;

//       const user = await User.findByPk(userId);
//       if (!user) {
//         return res.status(404).json({ message: "User not found" });
//       }

//       // Check if all roles exist
//       const roles = await Roles.findAll({
//         where: {
//           role_id: {
//             [Op.in]: roleIds,
//           },
//         },
//       });

//       if (roles.length !== roleIds.length) {
//         return res.status(400).json({ message: "One or more roles not found" });
//       }

//       // Assign roles to user
//       await user.setRoles(roles);

//       res.json({ message: "Roles assigned to user successfully" });
//     } catch (error) {
//       console.error("Error assigning roles to user:", error);
//       res.status(500).json({ message: "Internal server error" });
//     }
//   }
// );

// Role-Permission Management
// router.get(
//   "/roles/:roleId/permissions",
//   authMiddleware,
//   authorizeRoles,
//   async (req, res) => {

//     try {
//          const { Roles, Permissions } = await loadModels();
//       const roleId = req.params.roleId;

//       const role = await Roles.findByPk(roleId);
//       if (!role) {
//         return res.status(404).json({ message: "Role not found" });
//       }

//       const permissions = await role.getPermissions();
//       res.json(permissions);
//     } catch (error) {
//       console.error("Error fetching role permissions:", error);
//       res.status(500).json({ message: "Internal server error" });
//     }
//   }
// );

// router.post(
//   "/roles/:roleId/permissions",
//   authMiddleware,
//   authorizeRoles,
//   async (req, res) => {
//     try {
//       const roleId = req.params.roleId;
//       const { permissionIds } = req.body;

//       const role = await Role.findByPk(roleId);
//       if (!role) {
//         return res.status(404).json({ message: "Role not found" });
//       }

//       // Check if all permissions exist
//       const permissions = await Permission.findAll({
//         where: {
//           permission_id: {
//             [Op.in]: permissionIds,
//           },
//         },
//       });

//       if (permissions.length !== permissionIds.length) {
//         return res
//           .status(400)
//           .json({ message: "One or more permissions not found" });
//       }

//       // Assign permissions to role
//       await role.setPermissions(permissions);

//       res.json({ message: "Permissions assigned to role successfully" });
//     } catch (error) {
//       console.error("Error assigning permissions to role:", error);
//       res.status(500).json({ message: "Internal server error" });
//     }
//   }
// );

// // Permission-Resource Management
// router.get(
//   "/permissions/:permissionId/resources",
//   authMiddleware,
//   authorizeRoles,
//   async (req, res) => {
//     try {
//       const permissionId = req.params.permissionId;

//       const permission = await Permission.findByPk(permissionId);
//       if (!permission) {
//         return res.status(404).json({ message: "Permission not found" });
//       }

//       const resources = await permission.getResources();
//       res.json(resources);
//     } catch (error) {
//       console.error("Error fetching permission resources:", error);
//       res.status(500).json({ message: "Internal server error" });
//     }
//   }
// );

// router.post(
//   "/permissions/:permissionId/resources",
//   authMiddleware,
//   authorizeRoles,
//   async (req, res) => {
//     try {
//       const permissionId = req.params.permissionId;
//       const { resourceIds } = req.body;

//       const permission = await Permission.findByPk(permissionId);
//       if (!permission) {
//         return res.status(404).json({ message: "Permission not found" });
//       }

//       // Check if all resources exist
//       const resources = await Resource.findAll({
//         where: {
//           resource_id: {
//             [Op.in]: resourceIds,
//           },
//         },
//       });

//       if (resources.length !== resourceIds.length) {
//         return res
//           .status(400)
//           .json({ message: "One or more resources not found" });
//       }

//       // Assign resources to permission
//       await permission.setResources(resources);

//       res.json({ message: "Resources assigned to permission successfully" });
//     } catch (error) {
//       console.error("Error assigning resources to permission:", error);
//       res.status(500).json({ message: "Internal server error" });
//     }
//   }
// );

// Admin Settings Management
// router.get("/api/settings",   authMiddleware,
//   authorizeRoles, async (req, res) => {
//   try {
//     const settings = await AdminSetting.findAll({
//       attributes: [
//         "setting_id",
//         "setting_name",
//         "setting_value",
//         "is_encrypted",
//         "description",
//         "created_at",
//         "updated_at",
//       ],
//       include: [
//         {
//           model: User,
//           attributes: ["username"],
//         },
//       ],
//     });

//     res.json(settings);
//   } catch (error) {
//     console.error("Error fetching settings:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

// router.post("/api/settings",   authMiddleware,
//   authorizeRoles, async (req, res) => {
//   try {
//     const { settingName, settingValue, isEncrypted, description } = req.body;

//     let valueToStore = settingValue;

//     // Encrypt value if needed (you'd need to implement actual encryption)
//     if (isEncrypted) {
//       // This is a placeholder. In a real router, implement secure encryption
//       valueToStore = `encrypted_${settingValue}`;
//     }

//     const setting = await AdminSetting.create({
//       setting_name: settingName,
//       setting_value: valueToStore,
//       is_encrypted: isEncrypted || false,
//       description,
//       updated_by: req.user.user_id,
//     });

//     res.status(201).json({
//       settingId: setting.setting_id,
//       message: "Admin setting created successfully",
//     });
//   } catch (error) {
//     console.error("Error creating admin setting:", error);
//     if (error.name === "SequelizeUniqueConstraintError") {
//       return res.status(400).json({ message: "Setting name already exists" });
//     }
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

// router.put("/api/settings/:id",   authMiddleware,
//   authorizeRoles, async (req, res) => {
//   try {
//     const { settingName, settingValue, isEncrypted, description } = req.body;
//     const settingId = req.params.id;

//     const setting = await AdminSetting.findByPk(settingId);
//     if (!setting) {
//       return res.status(404).json({ message: "Setting not found" });
//     }

//     let valueToStore = settingValue;

//     // Encrypt value if needed
//     if (isEncrypted) {
//       // This is a placeholder. In a real router, implement secure encryption
//       valueToStore = `encrypted_${settingValue}`;
//     }

//     await setting.update({
//       setting_name: settingName,
//       setting_value: valueToStore,
//       is_encrypted: isEncrypted || false,
//       description,
//       updated_by: req.user.user_id,
//     });

//     res.json({ message: "Admin setting updated successfully" });
//   } catch (error) {
//     console.error("Error updating admin setting:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

// router.delete('/api/settings/:id',   authMiddleware,
//   authorizeRoles, async (req, res) => {
//   try {
//     const settingId = req.params.id;
//     const setting = await AdminSetting.findByPk(settingId);

//     if (!setting) {
//       return res.status(404).json({ message: 'Setting not found' });
//     }

module.exports = router;
