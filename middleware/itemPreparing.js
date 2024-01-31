const Service = require("../models/Service");
const Item = require("../models/Item");
const ObjectId = require("mongodb").ObjectId;

const itemPreparing = async (req, res, next) => {
  sId = req.params.id;
  // console.log(req.body);
  const { items, id, completed } = req.body;
  if (completed != "donez") {
    let finished = true;
    if (sId) {
      console.log("iprepering1");
      if (items?.length > 0) {
        if (items) {
          console.log("iprepering2");
          const itemsAll = Promise.all(
            items.map(async (i) => {
              if (i?.toDo == "del") {
                console.log(`dellll: ${req.body.id}, i: ${i._id}`);
                const mongoService = await Service.findById(req.body.id).exec();
                // const newitems = mongoService.map(())

                const resp = Service.updateOne(
                  {
                    _id: ObjectId("65b35c74fac5a2b05b691adf"),
                  },
                  {
                    $set: { items: [{}] },
                  },
                ).then((data) => {
                  console.log(data);
                  console.log("delllll=====");
                });

                return null;
              }
              if (i?.toDo === "add") {
                const newItem = {
                  garage: i.garageId,
                  user: i.user,
                  name: i.name,
                  storage: i.storage,
                  ean: i.ean,
                  size: i.size,
                  washing: i.washing,
                  brand: i.brand,
                  model: i.model,
                  height: i.height,
                  description: i.description,
                  quantity: 0,
                  notes: i.notes,
                  author: req.body.author,
                  authorname: req.body.authorname,
                };
                if (newItem) {
                  return newItem;
                  // return {
                  //   _id: ObjectId(newItem._id),
                  //   quantity: i.quantity,
                  //   author: req.body.author,
                  //   garage: i.garageId,
                  //   authorname: req.body.authorname,
                  //   user: i.user,
                  //   name: i.name,
                  // };
                } else {
                }
              } else {
                return i;
              }
            }),
          ).then((data) => {
            res.locals.newItemId = data;
            next();
          });
        }

        if (finished) {
          // next();
        }
      } else {
        next();
      }
    } else {
      console.log("ino sIdy");
      console.log(req.body.item);
      const newIds = Promise.all(
        items?.map(async (i) => {
          if (i.toDo === "add") {
            const newItem = {
              garage: i.garageId,
              user: i.user,
              name: i.name,
              storage: i.storage,
              ean: i.ean,
              _id: i._id,
              item: i._id,
              size: i.size,
              washing: i.washing,
              brand: i.brand,
              model: i.model,
              height: i.height,
              description: i.description,
              quantity: i.quantity,
              notes: i.notes,
              author: req.body.author,
              authorname: req.body.authorname,
            };
            if (newItem) {
              return newItem;
            } else {
            }
          }
        }),
      ).then((data) => {
        res.locals.newItemId = data;
        // res.locals.newStId = JSON.stringify(data);
        next();
      });
    }
  } else next();
};

module.exports = itemPreparing;
