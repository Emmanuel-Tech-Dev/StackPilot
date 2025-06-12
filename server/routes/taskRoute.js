const express = require("express");
const {
  getAllRecords,
  getARecord,
  getAuthUserRecords,
  createARecord,
  updateARecord,
  deleteARecord,
} = require("../controller/taskController");

const router = express.Router();

router.get("/tasks", getAllRecords);
router.get("/task/:id", getARecord);
router.get("/user/tasks", getAuthUserRecords);
router.post("/task", createARecord);
router.put("/task/:id", updateARecord);
router.delete("/task/:id", deleteARecord);

module.exports = router;
