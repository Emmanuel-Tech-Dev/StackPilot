const express = require("express");
const TableModel = require("./tablemodel");

const router = express.Router();

router.get("/admin", async (req, res) => {
  try {
    const model = new TableModel();
    const data = await model.getUsersData();
    // console.log(data);
    res.status(200).json({ message: "Data successfully fetched", data });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

router.post("/permission" , async (req , res) => {
  try {
    const model = new TableModel();
    const data = await model.getPermissions(req);
    // console.log(data);
    res.status(200).json({ message: "Data successfully fetched", data });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
})

module.exports = router;
