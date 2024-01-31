const express = require("express");
const router = express.Router();
const verifyJWT = require("../middleware/verifyJWT");
const itemsController = require("../controllers/itemsController");

router
  .get("/:gid/", itemsController.getAllItems)
  .post("/:gid/", verifyJWT, itemsController.getItemsByUserId)
  .patch("/:gid", verifyJWT, itemsController.editItem)
  .put("/:gid/", verifyJWT, itemsController.addNewItem)
  .delete("/:iid/", verifyJWT, itemsController.delItem);
router
  .route("/:gid/itemsbyusername")
  .post(itemsController.getItemsByUserIdAndService);
router
  .route("/:gid/itemsbyuseridandservice/:uid")
  .post(itemsController.getItemsByUserIdAndService);

module.exports = router;
