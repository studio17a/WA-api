const express = require("express");
const router = express.Router();
const servicesController = require("../controllers/servicesController");
const verifyJWT = require("../middleware/verifyJWT");
const stPreparing = require("../middleware/stPreparing");
const itemPreparing = require("../middleware/itemPreparing");

// router.use(verifyJWT);
router
  .get("/:id/:day/:month/:year", servicesController.getAllServices)
  .post(
    "/",
    verifyJWT,
    stPreparing,
    itemPreparing,
    servicesController.createNewService,
  )
  .post("/appointments", servicesController.createNewAppointment)
  .patch(
    "/:id",
    verifyJWT,
    stPreparing,
    itemPreparing,
    servicesController.updateService,
  )
  .delete("/:id", verifyJWT, stPreparing, servicesController.deleteService);

router.get(
  "/details/:gid/:vehicleId",
  servicesController.getServicesByVehicleId,
);

module.exports = router;
