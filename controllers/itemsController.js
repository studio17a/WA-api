const Item = require("../models/Item");
const User = require("../models/User");
const Vehicle = require("../models/Vehicle");
const Service = require("../models/Service");

const getAllItems = async (req, res) => {
  console.log(`getAllItems`);
  console.log(req.params);
  const items = await Item.find().select().lean();

  if (!items?.length) {
    return res.status(400).json({ message: "No i found" });
  }

  res.json(items);
};

const getItemsByUserId = async (req, res) => {
  const { userId } = req.body;

  const items = await Item.find({ user: userId });
  res.json(items);
};
const getItemsNoUser = async (req, res) => {
  console.log("GETITEMSNOUSER");
  const { gid } = req.params;

  const items = await Item.find({ garage: gid, user: null });
  res.json(items);
};

const getItemsByUserIdAndService = async (req, res) => {
  console.log(`getItemsByUserIdAndService`);
  const { userId } = req.body;

  const services = await Service.find({ user: userId });

  // const allItems = await Promise.all(
  //   services?.map(async (service) =>
  //     service.items?.map(
  //       async (item) => await Item.findById(item).lean().exec(),
  //     ),
  //   ),
  // );

  const itemsArray = services.map((s) => {
    let vehicle = null;
    let item = null;
    if (s.vehicle) {
      vehicle = s.vehicle;
    }
    if (s.items) {
      item = s.items;
    }
    return { service: s._id, item, vehicle };
  });

  // const items = await Item.find({ user: userId }).select().lean();

  const concatItems = [].concat(...itemsArray);

  const items = await Promise.all(
    concatItems?.map(async (sItem) => {
      const itemService = await Service.findById(sItem.service).lean().exec();
      const itemVehicle = await Vehicle.findById(sItem.vehicle).lean().exec();
      // garage
      // name
      // storage
      // ean
      // size
      // washing
      // brand
      // model
      // height
      // description
      // quantity
      // notes
      // author
      // authorname
      // timestamps

      const itemObj = await Promise.all(
        await sItem.item?.map(async (i) => {
          const item = i;
          let returnItem = {};
          returnItem = {
            _id: item._id,
            name: item.name,
            ean: item.ean,
            description: item.description,
            user: item.user,
            model: item.model,
            storage: item.storage,
            quantity: item.quantity,
            notes: item.notes,
            service: itemService,
            vehicle: itemVehicle,
          };
          return returnItem;
        }),
      ); // get service

      // const itemObj = {...i, vehicle: itemVehicle };

      // const itemObj = await Promise.all(
      //   await sItem.item?.map(async (i) => {
      //     const item = await Item.findById(i).lean().exec();
      //     let returnItem = {};
      //     if (item) {
      //       returnItem = {
      //         _id: item._id,
      //         name: item.name,
      //         ean: item.ean,
      //         description: item.description,
      //         user: item.user,
      //         model: item.model,
      //         storage: item.storage,
      //         quantity: item.quantity,
      //         notes: item.notes,
      //         service: itemService,
      //         vehicle: itemVehicle,
      //       };
      //     }
      //     return returnItem;
      //   }),
      // ); // get service
      return itemObj;
    }),
  ).then((data) => {
    const c = [].concat(...data);
    // console.log(c);
    res.json(c);
  });

  // const items = await Promise.all(
  //   concatItems?.map(async (item) => await Item.findById(item).lean().exec()),
  // );

  // if (!items?.length) {
  //   return res.status(400).json({ message: "No i found" });
  // }
};

const getItemsByUserName = async (req, res) => {
  // console.log("itemsbyusername...");
  const users = await User.find({
    username: { $regex: req.body.username.toUpperCase() },
  }).lean();
  const usersIds = users.map((u) => u._id.toString());
  // console.log(usersIds);
  // usersIds.map(async (uid) => {
  //   const i = await Item.find({ user: uid });
  //   if (i) {
  //     items.push(i);
  //   }
  // });

  const itemsArray = await Item.find({
    user: { $in: usersIds },
  }).populate("user");
  // const items = itemsArray.map((i)=>{
  //   const user = User.find()
  //   return {...i, user: }
  // })
  //   Item.find({
  //     user: u,
  //   }),
  // );
  // console.log(items);
  // const { username } = req.body;

  // const items = await Promise.all(
  //   users.map(async (u) => {
  //     const i = await Item.find({ user: u._id }).select().lean();
  //     if (i) return i;
  //   }),
  // );
  // if (!items?.length) {
  //   return res.status(400).json({ message: "No i found" });
  // }
  // const itemsByUsername = items.map((items) => items.map((i) => i));
  // console.log(itemsByUsername);

  // poszukać Item where include([users])

  res.json(itemsArray);
};

const editItem = async (req, res) => {
  console.log("edit");
  console.log(req.body);
  const {
    id,
    name,
    mode,
    user,
    brand,
    selectedUserId,
    quantity,
    ean,
    storage,
    vehicleId = null,
    description = "",
    notes = "",
  } = req.body;
  // Confirm data
  if (!id && mode != "add" && mode != null) {
    return res
      .status(400)
      .json({ message: "All 3 fields except password are required" });
  }

  const item = await Item.findById(id).exec();
  // const user = await User.findById(selectedUserId).exec();
  let vehicle = "";
  if (vehicleId) vehicle = await Vehicle.findById(vehicleId).exec();

  if (!item) {
    return res.status(400).json({ message: "item not found" });
  }
  // if (!user) {
  //   return res.status(400).json({ message: "user not found" });
  // }

  item.name = name;
  item.user = user;
  item.vehicle = vehicle;
  item.quantity = quantity;
  item.storage = storage;
  item.ean = ean;
  (item.brand = brand), (item.description = description);
  item.notes = notes;

  const updatedItem = await item.save();

  res.json({ message: `${updatedItem._id} updated`, item: updatedItem });
};

const addNewItem = async (req, res) => {
  console.log("addd new item");
  const {
    user,
    garage,
    selectedUserId,
    vehicleId,
    name,
    storage,
    quantity,
    description,
    ean,
    notes,
    author,
    brand,
    authorname,
  } = req.body;
  console.log(req.body);
  // Confirm data
  if (!name || !selectedUserId) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Check for duplicate username
  // const duplicate = await Item.findOne({ name })
  //   .collation({ locale: "en", strength: 2 })
  //   .lean()
  //   .exec();

  // if (duplicate) {
  //   return res.status(409).json({ message: "Duplicate name" });
  // }

  // Hash password

  let itemObject = {};
  if (user != null) {
    itemObject = {
      user: user,
      garage,
      name,
      brand,
      vehicleId,
      storage,
      quantity,
      description,
      ean,
      notes,
      author,
      authorname,
    };
  } else {
    itemObject = {
      garage,
      name,
      vehicleId,
      brand,
      storage,
      description,
      quantity,
      ean,
      notes,
      author,
      authorname,
    };
  }

  // Create and store new user
  const item = await Item.create(itemObject);

  if (item) {
    //created
    res.status(201).json({
      message: `New item ${item._id} created`,
      item: item,
    });
  } else {
    res.status(400).json({ message: "Invalid item data received" });
  }
};

const delItem = async (req, res) => {
  console.log("deleteItem");
  console.log(req.params);
  const { iid } = req.params;

  // Confirm data
  if (!iid) {
    return res.status(400).json({ message: " ID Required" });
  }

  console.log("tu2");
  // Does the user exist to delete?
  const item = await Item.findById(iid).exec();

  console.log("tu3");
  if (!item) {
    return res.status(400).json({ message: "item not found" });
  }

  console.log("tu4");
  const result = await item.deleteOne();

  console.log(result);
  const reply = `item ${result.name} with ID ${result._id} deleted`;

  res.json(reply);
};

module.exports = {
  getItemsByUserIdAndService,
  editItem,
  getItemsNoUser,
  getItemsByUserId,
  getAllItems,
  addNewItem,
  getItemsByUserName,
  delItem,
};
