const express = require("express");
const router = express.Router();
const stsController = require("../controllers/stsController");

router
  .get("/:id", stsController.getAllStsByGarageId)
  .post("/:id", stsController.editSt)
  .put("/", stsController.createNewSts)
  .delete("/:id", stsController.deleteSt);

module.exports = router;
