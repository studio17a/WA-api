const express = require("express");
const router = express.Router();
const googleAuthController = require("../controllers/googleAuthController");

router.get("/", googleAuthController.success);

module.exports = router;
