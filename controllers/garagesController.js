const Garage = require("../models/Garage");

const getAllGarages = async (req, res) => {
  const garages = await Garage.find().lean();
  if (!garages?.length) {
    return res.status(400).json({ message: "No garages found" });
  }

  res.json(garages);
};

module.exports = { getAllGarages };
