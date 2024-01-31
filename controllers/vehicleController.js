const Vehicle = require("../models/Vehicle");
const User = require("../models/User");
const getAllVehicles = async (req, res) => {
  // const vehicles = await Vehicle.find().select().lean();var ObjectId = require('mongodb').ObjectId;
  // var userId = req.params.gonderi_id;

  const vehicles = await Vehicle.find().populate("user").select().lean();

  if (!vehicles?.length) {
    return res.status(400).json({ message: "No v found" });
  }
  // const vehiclesWithUser = await Promise.all(
  //   vehicles.map(async (vehicle) => {
  //     const user = await User.findById(vehicle.user).lean().exec();

  //     return {
  //       ...vehicle,
  //       user: user,
  //     };
  //   }),
  // );
  // console.log(vehicles);
  res.json(vehicles);
};

const updateVehicle = async (req, res) => {
  const { vehicleId, userId } = req.body;
  const vehicle = await Vehicle.findById(vehicleId).exec();
  const user = await User.findById(userId).exec();

  if (!vehicle) {
    return res.status(400).json({ message: "vehicle not found" });
  }

  vehicle.user = user;

  const updatedVehicle = await vehicle.save();

  res.json({
    message: `${updatedVehicle.reg} updated`,
    updatedVehicle: updatedVehicle,
  });
};

const getVehiclesByUserId = async (req, res) => {
  const { userId } = req.body;
  // const vehicles = await Vehicle.find().select().lean();var ObjectId = require('mongodb').ObjectId;
  // var userId = req.params.gonderi_id;

  const vehicles = await Vehicle.find({ user: userId }).select().lean();

  const vehiclesWithUser = await Promise.all(
    vehicles.map(async (vehicle) => {
      const user = await User.findById(vehicle.user).select("-password").exec();

      return {
        ...vehicle,
        user,
      };
    }),
  );

  if (!vehicles?.length) {
    return res.status(400).json({ message: "No v found" });
  }

  res.json(vehiclesWithUser);
};

const addNewVehicle = async (req, res) => {
  const {
    garage,
    vid = null,
    mode,
    selectedUserObj,
    reg,
    brand,
    engine,
    year,
    fuel,
    note,
    author,
    authorname,
  } = req.body;

  // Confirm data
  if (!reg || !selectedUserObj) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Check for duplicate username
  console.log(req.body);
  let duplicate;
  if (mode === "add") {
    console.log(`tu`);
    duplicate = await Vehicle.findOne({ reg }).exec();
  }
  if (mode === "edit" || mode === "forward") {
    console.log(`tu2`);
    duplicate = await Vehicle.findById(vid).exec();
  }

  if (duplicate && mode !== "edit" && mode !== "forward") {
    return res.status(409).json({ message: "Duplicate vehicle" });
  }

  console.log(duplicate);
  // Hash password

  // Create and store new user
  if (mode === "add" || mode === null) {
    const vehicleObject = {
      user: selectedUserObj,
      garage,
      reg,
      brand,
      engine,
      year,
      fuel,
      note,
      author,
      authorname,
    };
    const vehicle = await Vehicle.create(vehicleObject);
    if (vehicle) {
      //created
      res.status(201).json({
        message: `New vehicle ${vehicle._id} created`,
        vehicle: vehicle,
      });
    } else {
      res.status(400).json({ message: "Invalid vehicle data received" });
    }
  } else if (mode === "edit") {
    duplicate.reg = reg;
    duplicate.brand = brand;
    duplicate.engine = engine;
    duplicate.year = year;
    duplicate.fuel = fuel;
    duplicate.note = note;
    duplicate.author = author;
    duplicate.authorname = authorname;
    duplicate.save();
    res.status(201).json({
      message: ` vehicle ${vid} updated`,
      vehicle: duplicate,
    });
  } else if (mode === "forward") {
    console.log("tu3");
    duplicate.user = selectedUserObj;
    duplicate.reg = reg;
    duplicate.brand = brand;
    duplicate.engine = engine;
    duplicate.year = year;
    duplicate.fuel = fuel;
    duplicate.note = note;
    duplicate.author = author;
    duplicate.authorname = authorname;
    console.log(duplicate);
    duplicate.save();
    res.status(201).json({
      message: ` vehicle ${vid} updated`,
      vehicle: duplicate,
    });
  }
};

const delVehicle = async (req, res) => {
  const { vid } = req.params;

  // Confirm data
  if (!vid) {
    return res.status(400).json({ message: " ID Required" });
  }

  // Does the user still have assigned services?
  // Does the user exist to delete?
  const vehicle = await Vehicle.findById(vid).exec();

  if (!vehicle) {
    return res.status(400).json({ message: "V not found" });
  }

  const result = await vehicle.deleteOne();

  const reply = `V ${result.reg} with ID ${result._id} deleted`;

  res.status(200).json({ message: reply });
};

module.exports = {
  updateVehicle,
  getAllVehicles,
  getVehiclesByUserId,
  addNewVehicle,
  delVehicle,
};
