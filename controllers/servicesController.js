const Service = require("../models/Service");
const User = require("../models/User");
const Vehicle = require("../models/Vehicle");
const Item = require("../models/Item");
const St = require("../models/St");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const io = require("socket.io-client");

// @desc Get all services
// @route GET /services
// @access Private

const socket = io("https://tg3vhf-3500.csb.app", {
  transports: ["websocket", "polling", "flashsocket"],
});

const getAllServices = async (req, res) => {
  console.log(`getAllServices: ${req.params}`);
  // console.log(req.params);
  console.log(`getAllServices: ${req.params}`);
  // Get all services from MongoDB
  // console.log(req.params);
  // console.log("req.params.id");
  const services = await Service.find({
    garage: req.params.id,
    date: `${req.params.day}/${req.params.month}/${req.params.year}`,
  })
    .sort("hour")
    .sort("minute")
    .populate("user")
    .lean();

  // If no services

  if (services?.length <= 0) {
    return res.status(200).json({ message: "No services found" });
  }

  console.log(`getAllServices2`);
  // Add username to each service before sending the response
  // See Promise.all with map() here: https://youtu.be/4lqJBBEpjRE
  // You could also do this with a for...of loop
  const servicesWithUser = await Promise.all(
    services.map(async (service) => {
      const user = await User.findById(service.user).lean().exec();
      let item = null;
      if (service.item) {
        item = await Item.findById(service.item).lean().exec();
      }
      let s = [];
      if (service.st?.length > 0) {
        s = await Promise.all(
          service.st?.length &&
            service.st?.map(async (sts) => {
              const ss = await St.findById(sts).lean().exec();
              if (ss != null) {
                return {
                  ...sts,
                  _id: ss._id,
                  name: ss.name,
                  vat: ss.vat,
                  price: ss.price,
                  items: ss.items,
                };
              }
            }),
        );
      }
      const vehicle = await Vehicle.findById(service.vehicle).lean().exec();
      // console.log(user);
      // console.log(`services`);
      if (vehicle) vehicle.user = user;
      // console.log(vehicle);
      return {
        ...service,
        vehicle: vehicle,
        sts: s,
        item: item,
        username: user.username,
        phone: user.phone,
        email: user.email,
      };
    }),
  );
  console.log(`getAllServices3`);
  res.json(servicesWithUser);
};

const getServicesByVehicleId = async (req, res) => {
  console.log(
    `getServicesByVehicleId: ${req.params.vehicleId}, ${req.params.gid}`,
  );
  const services = await Service.find({
    garage: req.params.gid,
    vehicle: req.params.vehicleId,
  })
    .sort("date")
    .lean();

  // const stservices = await Promise.all(
  //   services.map(async (service) => {
  //     let s = [];
  //     if (service.st?.length > 0) {
  //       s = await Promise.all(
  //         service.st?.length &&
  //           service.st?.map(async (sts) => {
  //             const ss = await St.findById(sts).lean().exec();
  //             if (ss != null) {
  //               return {
  //                 ...sts,
  //                 _id: ss._id,
  //                 name: ss.name,
  //                 vat: ss.vat,
  //                 price: ss.price,
  //                 items: ss.items,
  //               };
  //             }
  //           }),
  //       );
  //     }
  //     return { ...service, st: s };
  //   }),
  // );

  res.json(services);
};

// @desc Create new service
// @route POST /services
// @access Private
const createNewService = async (req, res) => {
  console.log("createNewService");
  console.log(res.locals.newStId);

  const preSt = res.locals.newStId.filter((sid) => sid !== undefined);
  const preItem = res.locals.newItemId.filter((iid) => iid !== undefined);
  // const preSt = res.locals.newStId.map((stId) => mongoose.Types.ObjectId(stId));
  // console.log(req.body);
  console.log(`preItem`);
  console.log(preItem);
  console.log(preSt);
  const {
    garage,
    st,
    user,
    item,
    date,
    vehicle,
    hour,
    minute,
    title,
    text,
    uwagi,
    author,
    authorname,
  } = req.body;
  const service = await Service.create({
    garage,
    user,
    items: preItem,
    st: preSt,
    garage,
    date,
    vehicle,
    hour,
    uwagi,
    minute,
    author,
    authorname,
  });
  // const service = null;
  if (service) {
    // Created
    return res
      .status(201)
      .json({ message: "New service created", handledServivceId: service._id });
  } else {
    return res.status(400).json({ message: "Invalid service data received" });
  }
};

const createNewAppointment = async (req, res) => {
  console.log("createNewAppointment");
  const { token } = req.body;
  const foundService = await Service.findOne({ from: token }).exec();

  if (foundService) return res.status(401).json({ message: "DUPLICATE" });

  // const preSt = res.locals.newStId.map((stId) => mongoose.Types.ObjectId(stId));
  // console.log(req.body);

  const allow = await jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET,
    async (err, decoded) => {
      if (err) return res.status(403).json({ message: "Forbidden" });
      const {
        garageId,
        email,
        date,
        hour,
        minute,
        user,
        uwagi,
        author,
        authorname,
      } = decoded.AppointmentInfo;
      const foundUser = await User.findById(user).exec();

      if (!foundUser) return res.status(401).json({ message: "Unauthorized" });
      // if (foundUser) {
      // } else {
      //   console.log("no such user");
      // }
      //   res.json({ accessToken });

      return {
        garageId,
        email,
        date,
        hour,
        minute,
        user,
        uwagi,
        author,
        authorname,
      };
    },
  );

  //==
  if (allow) {
    const admins = await User.find({
      garage: allow.garageId,
      roles: "Admin",
    })
      .lean()
      .exec()
      .then((data) => {
        // console.log(`data`);
        // console.log(data);
        // console.log(`req.params.id: ${req.params.id}`);
        return data;
      });

    console.log(`admins`);
    console.log(allow);
    const appointment = await Service.create({
      garage: allow.garageId,
      user: allow.user,
      st: [],
      date: allow.date,
      hour: allow.hour,
      minute: allow.minute,
      completed: "suggested",
      from: token,
      uwagi: allow.uwagi,
      author: allow.author,
      authorname: allow.authorname,
    }).then((data) => {
      // console.log(data);
      console.log("newappointment");
      socket.emit("setup", { _id: allow.user });
      socket.on("connected", () => {
        console.log("connected from controller");
      });
      socket.emit("join room", "updates");
      socket.emit("controllerSaysHello", admins);
      if (data) {
        // Created
        return res.status(201).json({
          message: `Potwierdzono wizytę w dniu ${allow.date} o godzinie ${allow.hour}:${allow.minute}`,
          handledServivceId: data._id,
        });
      } else {
        return res
          .status(400)
          .json({ message: "Invalid service data received" });
      }
    });
  }
};

// @desc Update a service
// @route PATCH /services
// @access Private
const updateService = async (req, res) => {
  console.log("updatingservice");
  // console.log(req.body);
  sId: req.params.id;
  const {
    id,
    user,
    vehicle,
    date,
    hour,
    st,
    minute,
    items,
    title,
    notes,
    text,
    completed,
  } = req.body;
  let stIds;
  if (res.locals.newStId)
    stIds = res.locals.newStId.filter((sid) => sid !== null);
  else stIds = st;
  let iIds;
  if (res.locals.newItemId)
    iIds = res.locals.newItemId.filter((iid) => iid !== null);
  else iIds = items;
  console.log("updatingservice");
  //res.locals.newStId.map((stId) => mongoose.Types.ObjectId(stId));
  // console.log(res.locals.newItemId);
  // Confirm data
  // if (!id || !user || !vehicle || !date || !hour || !minute) {
  //   return res.status(400).json({ message: "All fields are required" });
  // }

  // Confirm service exists to update
  const service = await Service.findById(sId).exec();
  if (!service) {
    return res.status(400).json({ message: "Service not found" });
  }
  let newcompleted = completed;
  if (!completed || completed === null) newcompleted = service.completed;
  // Check for duplicate title
  // const duplicate = await Service.findOne({ title })
  //   .collation({ locale: "en", strength: 2 })
  //   .lean()
  //   .exec();

  // Allow renaming of the original service
  // if (duplicate && duplicate?._id.toString() !== id) {
  //   return res.status(409).json({ message: "Duplicate service title" });
  // }

  service.user = user;
  service.vehicle = vehicle;
  service.date = date;
  service.hour = hour;
  service.st = stIds;
  service.minute = minute;
  service.items = iIds;
  service.uwagi = notes;
  service.title = title;
  service.text = text;
  service.completed = newcompleted;

  const updatedService = await service.save();

  res.json({
    message: `'${updatedService.title}' updated`,
    handledServivceId: sId,
  });
};

// @desc Delete a service
// @route DELETE /services
// @access Private
const deleteService = async (req, res) => {
  console.log(`++++++deleteService`);
  const { id } = req.body;

  // Confirm data
  if (!id) {
    return res.status(400).json({ message: "Service ID required" });
  }

  // Confirm service exists to delete
  const service = await Service.findById(id).exec();

  if (!service) {
    return res.status(400).json({ message: "Service not found" });
  }

  const result = await service.deleteOne();

  const reply = `Service '${result.title}' with ID ${result._id} deleted`;

  console.log(`deleteService2`);
  res.json(reply);
};

module.exports = {
  getAllServices,
  getServicesByVehicleId,
  createNewService,
  createNewAppointment,
  updateService,
  deleteService,
};
