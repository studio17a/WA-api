const User = require("../models/User");
const Garage = require("../models/Garage");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
var imaps = require("imap-simple");
const ObjectId = require("mongodb").ObjectId;
const success = async (req, res) => {
  const email = req.user.emails[0].value;
  const foundUser = await User.findOne({ email: email }).exec();
  const user = () => {
    if (foundUser) {
      return foundUser;
    } else {
      return req.user;
    }
  };
  let isAdmin = [];
  let isEmployee = [];
  let uid = req.user.id;
  let name = req.user.displayName;
  let phone = req.user.phone;
  let garages = [];

  if (foundUser) {
    uid = foundUser._id;
    name = foundUser.username;
    phone = foundUser.phone;
    email = foundUser.email;
    garages = foundUser.garages;
    isadmin = await Garage.find({
      "stuff.admins": ObjectId(foundUser._id),
    })
      .select("_id")
      .lean();
    isemployee = await Garage.find({
      "stuff.employees": ObjectId(foundUser._id),
    })
      .select("_id")
      .lean();
  }

  const roles = { isadmin, isemployee };

  const accessToken = jwt.sign(
    {
      UserInfo: {
        _id: uid,
        username: name,
        roles: roles,
        email: email,
        phone: phone,
        garages: garages,
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" },
  );

  const refreshToken = jwt.sign(
    {
      _id: uid,
      username: name,
      roles: roles,
      email: email,
      phone: phone,
      garages: garages,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" },
  );

  // Create secure cookie with refresh token
  res.cookie("jwt", refreshToken, {
    httpOnly: true, //accessible only by web server
    secure: true, //https
    sameSite: "None", //cross-site cookie
    maxAge: 7 * 24 * 60 * 60 * 1000, //cookie expiry: set to match rT
  });

  // Send accessToken containing username and roles
  res.json({ accessToken });
};

module.exports = { success };
