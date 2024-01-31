const express = require("express");
const router = express.Router();
const vehicleController = require("../controllers/vehicleController");

router
  .get("/", vehicleController.getAllVehicles)
  .post("/", vehicleController.getVehiclesByUserId)
  .patch("/", vehicleController.updateVehicle)
  .put("/", vehicleController.addNewVehicle)
  .delete("/:vid", vehicleController.delVehicle);

module.exports = router;
