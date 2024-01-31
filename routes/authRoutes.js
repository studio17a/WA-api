const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const loginLimiter = require("../middleware/loginLimiter");

router.route("/auth").post(authController.login);
router.route("/auth").get(authController.login);
router.route("/").post(authController.login);
router.route("/").get(authController.login);

router.route("/refresh").get(authController.refresh);

router.route("/logout").post(authController.logout);

module.exports = router;
