const Service = require("../models/Service");
const St = require("../models/St");

const stPreparing = async (req, res, next) => {
  sId = req.params.id;
  console.log("prepering");
  const { st, id } = req.body;
  let finished = true;
  if (sId) {
    console.log("prepering1");
    if (st.length > 0) {
      if (st) {
        console.log("prepering2");
        const stAll = Promise.all(
          st.map(async (s) => {
            if (s?.toDo == "del") {
              const mongoSt = await St.findById(s._id).exec();
              if (mongoSt) await mongoSt.deleteOne();
              return null;
            }
            if (s?.toDo === "add") {
              const newSt = await St.create({
                garage: s.garageId,
                predefined: s.predefined,
                name: s.name,
                price: s.price,
                items: s.items,
                vat: s.vat,
                author: s.author,
                authorname: s.authorname,
              });
              if (newSt) {
                return newSt._id;
              } else {
              }
            } else {
              console.log("prepering4");
              const mongoSt = await St.findById(s._id).exec();
              mongoSt.items = s.items;
              mongoSt.price = s.price;
              mongoSt.vat = s.vat;
              mongoSt.save();
              return s?._id;
            }
          }),
        ).then((data) => {
          res.locals.newStId = data;
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
    console.log("no sIdy");
    const newIds = Promise.all(
      st?.map(async (s) => {
        if (s.toDo === "add") {
          // console.log(s);
          const newSt = await St.create({
            garage: s.garageId,
            predefined: s.predefined,
            name: s.name,
            price: s.price,
            items: s.items,
            vat: s.vat,
            author: req.body.author,
            authorname: req.body.authorname,
          });
          if (newSt) {
            return newSt._id;
          } else {
          }
        }
      }),
    ).then((data) => {
      res.locals.newStId = data;
      // res.locals.newStId = JSON.stringify(data);
      next();
    });
  }
};

module.exports = stPreparing;
