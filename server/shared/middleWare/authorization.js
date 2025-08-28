const {
  getUserRole,
  getPermission,
  getResources,
} = require("./authMiddleware");

function authorization() {
  return [getUserRole, getPermission, getResources];
}

module.exports = authorization;
