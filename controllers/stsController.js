const St = require("../models/St");
const getAllSts = async (req, res) => {
  const sts = await St.find({
    garage: req.params.id,
    predefined: true,
  })
    .select()
    .lean();

  if (!sts?.length) {
    return res.status(400).json({ message: "No st found" });
  }

  res.json(sts);
};

const getAllStsByGarageId = async (req, res) => {
  const garageId = req.params.id;
  const sts = await St.find({ garage: req.params.id, predefined: true })
    .select()
    .lean();

  if (!sts?.length) {
    return res.status(400).json({ message: "No st found" });
  }

  res.json(sts);
};

const editSt = async (req, res) => {
  console.log(req.body);
  const { id, price = 0, items = 0, vat = 0 } = req.body;
  // Confirm data
  if (!id) {
    return res
      .status(400)
      .json({ message: "All fields except password are required" });
  }

  const st = await St.findById(id).exec();

  if (!st) {
    return res.status(400).json({ message: "St not found" });
  }

  st.price = price;
  st.items = items;
  st.vat = vat;

  const updatedSt = await st.save();

  res.json({ message: `${updatedSt._id} updated` });
};

const createNewSts = async (req, res) => {
  console.log(req.body);
  const {
    garage,
    price = 0,
    items = 1,
    vat = 23,
    predefined,
    name,
    toDo,
  } = req.body;

  if (req.body.toDo == "add") {
    const st = await St.create({
      garage,
      predefined,
      name,
      price,
      items,
      vat,
    });

    if (st) {
      // Created
      return res
        .status(201)
        .json({ message: "New service created", newSt: st });
    } else {
      return res.status(400).json({ message: "Invalid service data received" });
    }
  } else {
    return res.status(200).json({ message: "nothing to add", newSt: req.body });
  }
};
const deleteSt = async (req, res) => {
  const id = req.params.id;

  // Confirm data
  if (!id) {
    return res.status(400).json({ message: "St ID Required" });
  }

  // Does the user still have assigned services?

  // Does the user exist to delete?
  const st = await St.findById(id).exec();

  if (!st) {
    return res.status(400).json({ message: "St not found" });
  }

  const result = await st.deleteOne();

  const reply = `St ${result.name} with ID ${result._id} deleted`;

  res.json({ id: result._id, message: reply });
};

module.exports = {
  getAllStsByGarageId,
  getAllSts,
  createNewSts,
  deleteSt,
  editSt,
};
