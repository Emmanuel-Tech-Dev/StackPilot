const express = require("express");
const {
  getAllRecords,
  getARecord,
  getAuthUserRecords,
  createARecord,
  updateARecord,
  deleteARecord,
} = require("../controller/weeklyController");

const router = express.Router();

router.get("/weekly_tasks", getAllRecords);
router.get("/weekly_task/:id", getARecord);
router.get("/user/weekly_tasks", getAuthUserRecords);
router.post("/weekly_task", createARecord);
router.put("/weekly_task/:id", updateARecord);
router.delete("/weekly_task/:id", deleteARecord);

module.exports = router;
