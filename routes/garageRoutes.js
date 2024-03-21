const express = require("express");
const router = express.Router();
const garagesController = require("../controllers/garagesController");

router.get("/", garagesController.getAllGarages);
router.get("/:gid", garagesController.getAGarage);

module.exports = router;
