const db = require("../../shared/dbConfig/config");
const CrudOperation = require("../base/base.services");

class TableModel extends CrudOperation {
  async getUsersData() {
    try {
      const res = await db.query(
        `
         SELECT 
         a.id,
    a.custom_id,
    a.name,
    a.email,
    a.phone_no,
    a.oauth_provider,
    a.oauth_id,
    a.avatar,
    a.status,
    a.last_login,
    a.last_logout,
    a.createdAt,
    a.updatedAt,
    r.role_name
FROM admin a
JOIN admin_user_roles ur ON a.custom_id = ur.user_id
JOIN admin_roles r ON ur.role_id = r.role_name;


              `,
        {
          type: db.QueryTypes.SELECT,
          //   plain: true,
        }
      );

      return res;
    } catch (error) {
      console.log(error);
    }
  }

  async getPermissions(req) {
    try {
      const { role_id } = req.body;
      const res = await db.query(
        `
         SELECT role_id,permission From admin_role_permissions WHERE role_id = :role_id
              `,
        {
          replacements: { role_id },
          type: db.QueryTypes.SELECT,
          //   plain: true,
        }
      );

      return res;
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = TableModel;
