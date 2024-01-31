const express = require("express");
const router = express.Router();
const mailController = require("../controllers/mailController");

router.route("/").post(mailController.sendEmail);
router.route("/").delete(mailController.sendDelEmail);

module.exports = router;
