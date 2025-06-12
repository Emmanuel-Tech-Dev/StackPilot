const express = require("express");
const {
  getAllRecords,
  getAuthUserRecords,
  getARecord,
  createARecord,
  updateARecord,
  deleteARecord,
} = require("../controller/goalController");

const router = express.Router();

router.get("/goals", getAllRecords);
router.get("/user/goals", getAuthUserRecords);
router.get("/goal/:id", getARecord);
router.post("/goal", createARecord);
router.put("/goal/:id", updateARecord);
router.delete("/goal/:id", deleteARecord);

module.exports = router;
