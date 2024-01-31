const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");
const verifyJWT = require("../middleware/verifyJWT");

// router.use(verifyJWT);

router
  .get("/:gid", verifyJWT, usersController.getAllUsers)
  .post("/", usersController.createNewUser)
  .patch("/", verifyJWT, usersController.updateUser)
  .delete("/", verifyJWT, usersController.deleteUser);

router.route("/userswithvehicles/:gid").post(usersController.getUserByVehicle);
router.route("/userswithitems/:gid").post(usersController.getUserByItem);

module.exports = router;
