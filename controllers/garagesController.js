const Garage = require("../models/Garage");

const getAllGarages = async (req, res) => {
  res.header(
    "Access-Control-Expose-Headers",
    "Origin, X-Requested-With, Content-Type, Accept",
  );
  res.header("Access-Control-Allow-Origin", "https://tg3vhf-3000.csb.app");
  res.header("Access-Control-Allow-Credentials", true);
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept",
  );
  const garages = await Garage.find().lean();
  if (!garages?.length) {
    return res.status(400).json({ message: "No garages found" });
  }

  res.json(garages);
};

const getAGarage = async (req, res) => {
  const garage = await Garage.findById(req.params.gid).lean();
  res.json(garage);
};

module.exports = { getAllGarages, getAGarage };
