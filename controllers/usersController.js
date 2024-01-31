const User = require("../models/User");
const Service = require("../models/Service");
const Vehicle = require("../models/Vehicle");
const Item = require("../models/Item");
const bcrypt = require("bcrypt");
const generator = require("generate-password");
const ObjectId = require("mongodb").ObjectId;

// @desc Get all users
// @route GET /users
// @access Private
const getAllUsers = async (req, res) => {
  // Get all users from MongoDB
  const { gid } = req.params;
  console.log(req.params);
  console.log(`getAllUsers`);
  if (gid === "undefined") {
    return res.status(404).json({ message: "Specify a garage" });
  }
  const users = await User.find({ garages: { $elemMatch: { garage: gid } } })
    .select("-password")
    .lean();

  // console.log(users);
  // If no users
  if (!users?.length) {
    return res.status(400).json({ message: "No users found" });
  }

  res.json(users);
};

const getUserByVehicle = async (req, res) => {
  console.log(`getUserByVehicle`);
  const vehicles = await Vehicle.find({
    reg: { $regex: req.body.reg.toUpperCase() },
  }).lean();
  const users = await Promise.all(
    vehicles.map(async (v) => await User.findById(v.user).lean()),
  );
  res.json(users);
};

const getUserByItem = async (req, res) => {
  console.log(`getUserByItem`);

  // console.log(req.body);
  const items = await Item.find({
    name: { $regex: req.body.item.toUpperCase() },
  }).lean();

  console.log(items.length);
  const services = await Promise.all(
    items.map(
      async (item) =>
        await Service.find({ "items._id": ObjectId(item._id) }).lean(),
    ),
  );

  console.log(services);
  const concatServices = [].concat(...services);

  const users = await Promise.all(
    concatServices.map(async (s) => await User.findById(s.user).lean().exec()),
  );
  console.log(users);
  res.json(users);
};

// @desc Create new user
// @route POST /users
// @access Private
const createNewUser = async (req, res) => {
  console.log(req.body);
  const {
    _id,
    username,
    phone,
    garage,
    email,
    street,
    streetNr,
    postal,
    author = null,
    authorname = "",
  } = req.body;
  let { password, roles } = req.body;
  const { mode } = req.body;

  if (!username || !phone) {
    return res.status(400).json({ message: "All the fields are required" });
  }
  if (mode != "edit") {
    // if (!password) {
    //   password = generator.generate({
    //     length: 10,
    //     numbers: true,
    //     symbols: true,
    //   });
    // }

    // 'uEyMTw32v9'
    // const hashedPwd = await bcrypt.hash(password, 10); // salt rounds
    const hashedPwd = await bcrypt.hash(password, 10);
    // return res.status(400).json({ message: "All the fields are required" });

    const duplicate = await User.findOne({ phone })
      .collation({ locale: "en", strength: 2 })
      .lean()
      .exec();

    if (duplicate) {
      return res.status(409).json({ message: "Duplicate username" });
    }

    if (!Array.isArray(roles) || !roles.length) {
      roles = "Client";
    }
    let garages = [];
    console.log(garage);
    console.log(`garage`);
    garages.push({ garage: garage, permission: false });
    const userObject = {
      username,
      password: hashedPwd,
      roles,
      garages,
      phone,
      email,
      active: false,
      street,
      streetNr,
      postal,
      author,
      authorname,
    };

    console.log(password);
    console.log(hashedPwd);
    // // Create and store new user
    const user = await User.create(userObject);

    if (user) {
      //created
      res
        .status(201)
        .json({ message: `New user ${user._id} created`, user: user });
    } else {
      res.status(400).json({ message: "Invalid user data received" });
    }
  } else {
    const update = await User.findById({ _id: req.body._id }).exec();

    if (!update) {
      return res.status(409).json({ message: "no such user" });
    }
    (update.username = req.body.username),
      (update.email = req.body.email),
      (update.NIP = req.body.NIP),
      (update.REGON = req.body.REGON),
      (update.phone = req.body.phone);
    if (req.body.roles) update.roles = req.body.roles;

    const updatedUser = await update.save();
    console.log(`updating user`);
    console.log(req.body);
    res.status(200).json({ message: `${updatedUser.username} updated` });
  }
};

// @desc Update a user
// @route PATCH /users
// @access Private
const updateUser = async (req, res) => {
  const { id, username, roles, active, password } = req.body;

  // Confirm data
  if (
    !id ||
    !username ||
    !Array.isArray(roles) ||
    !roles.length ||
    typeof active !== "boolean"
  ) {
    return res
      .status(400)
      .json({ message: "All . fields except password are required" });
  }

  // Does the user exist to update?
  const user = await User.findById(id).exec();

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  // Check for duplicate
  const duplicate = await User.findOne({ username })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();

  // Allow updates to the original user
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Duplicate username" });
  }

  user.username = username;
  user.roles = roles;
  user.active = active;

  if (password) {
    // Hash password
    user.password = await bcrypt.hash(password, 10); // salt rounds
  }

  const updatedUser = await user.save();

  res.json({ message: `${updatedUser.username} updated` });
};

// @desc Delete a user
// @route DELETE /users
// @access Private
const deleteUser = async (req, res) => {
  console.log("deleteUser");
  console.log(req.body);
  console.log(req.params);
  const { id } = req.body;

  // Confirm data
  if (!id) {
    return res.status(400).json({ message: "User ID Required" });
  }

  // Does the user still have assigned services?
  const service = await Service.findOne({ user: id }).lean().exec();
  // if (service) {
  //   console.log("tu1");
  //   return res.status(400).json({ message: "User has assigned services" });
  // }

  console.log("tu2");
  // Does the user exist to delete?
  const user = await User.findById(id).exec();

  console.log("tu3");
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  console.log("tu4");
  const result = await user.deleteOne();

  console.log("tu5");
  const reply = `Username ${result.username} with ID ${result._id} deleted`;

  res.json(reply);
};

module.exports = {
  getUserByVehicle,
  getUserByItem,
  getAllUsers,
  createNewUser,
  updateUser,
  deleteUser,
};
