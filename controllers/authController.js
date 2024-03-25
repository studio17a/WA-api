const User = require("../models/User");
const Garage = require("../models/Garage");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
var imaps = require("imap-simple");
const ObjectId = require("mongodb").ObjectId;
// @desc Login
// @route POST /auth
// @access Public
// bixa ucqx wjxs lsue
const login = async (req, res) => {
  console.log("trytologin");
  const { username, password } = req.body;
  // return res
  //   .status(400)
  //   .json({ message: `All fields are required${garageId}` });

  if (!username || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const foundUser = await User.findOne({ username }).exec();

  if (!foundUser) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const isadmin = await Garage.find({
    "stuff.admins": ObjectId(foundUser._id),
  })
    .select("_id")
    .lean();
  const isemployee = await Garage.find({
    "stuff.employees": ObjectId(foundUser._id),
  })
    .select("_id")
    .lean();

  const roles = { isadmin, isemployee };
  const match = await bcrypt.compare(password, foundUser.password);
  if (!match) return res.status(401).json({ message: "Unauthorized" });

  const accessToken = jwt.sign(
    {
      UserInfo: {
        _id: foundUser._id,
        username: foundUser.username,
        roles: roles,
        email: foundUser.email,
        phone: foundUser.phone,
        garages: foundUser.garages,
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" },
  );

  const refreshToken = jwt.sign(
    {
      _id: foundUser._id,
      username: foundUser.username,
      roles: roles,
      email: foundUser.email,
      phone: foundUser.phone,
      garge: foundUser.garages,
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

// @desc Refresh
// @route GET /auth/refresh
// @access Public - because access token has expired
const refresh = (req, res) => {
  const cookies = req.cookies;

  if (!cookies?.jwt) return res.status(401).json({ message: "Unauthorized" });

  const refreshToken = cookies.jwt;

  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    async (err, decoded) => {
      if (err) return res.status(403).json({ message: "Forbidden" });

      const foundUser = await User.findOne({
        username: decoded.username,
      }).exec();

      if (!foundUser) return res.status(401).json({ message: "Unauthorized" });

      const isadmin = await Garage.find({
        "stuff.admins": ObjectId(foundUser._id),
      })
        .select("_id")
        .lean();
      const isemployee = await Garage.find({
        "stuff.employees": ObjectId(foundUser._id),
      })
        .select("_id")
        .lean();

      const roles = { isadmin, isemployee };
      const accessToken = jwt.sign(
        {
          UserInfo: {
            _id: foundUser._id,
            username: foundUser.username,
            roles: roles,
            email: foundUser.email,
            phone: foundUser.phone,
            garages: foundUser.garages,
          },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" },
      );

      res.json({ accessToken });
    },
  );
};

// @desc Logout
// @route POST /auth/logout
// @access Public - just to clear cookie if exists
const logout = (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(204); //No content
  res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
  res.json({ message: "Cookie cleared" });
};

module.exports = {
  login,
  refresh,
  logout,
};
