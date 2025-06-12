const express = require("express");
const {
  getAllRecords,
  getARecord,
  createARecord,
  updateARecord,
  deleteARecord,
} = require("../controller/dailyController");
const { getAuthUserRecords } = require("../controller/weeklyController");

const router = express.Router();

router.get("/daily_task", getAllRecords);
router.get("/daily_task/:id", getARecord);

router.get("/user/daily_tasks", getAuthUserRecords);
router.post("/daily_task", createARecord);
router.put("/daily_task/:id", updateARecord);
router.delete("/daily_task/:id", deleteARecord);

module.exports = router;
