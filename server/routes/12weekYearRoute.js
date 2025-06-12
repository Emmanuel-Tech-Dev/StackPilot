const {
  create12WeekYear,
  getAllRecords,
  getARecord,
  getAuthUserRecords,
  updateARecord,
  deleteARecord,
} = require("../controller/12weekYearContorller");

const express = require("express");

const router = express.Router();

router.get("/twelveweekyears", getAllRecords);
router.get("/twelveweekyear/:id", getARecord);
router.get("/user/twelveweekyear", getAuthUserRecords);
router.post("/twelveweekyear", create12WeekYear);
router.put("/twelveweekyear/:id", updateARecord);
router.delete("/twelveweekyear/:id", deleteARecord);

module.exports = router;
