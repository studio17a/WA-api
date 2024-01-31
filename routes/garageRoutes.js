const express = require("express");
const router = express.Router();
const garagesController = require("../controllers/garagesController");

router.route("/").get(garagesController.getAllGarages);

module.exports = router;
