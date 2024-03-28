require("dotenv").config();
require("express-async-errors");
const express = require("express");
const passport = require("passport");
require("./config/passport.js");
const app = express();
const path = require("path");
const { logger, logEvents } = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const cookieSession = require("cookie-session");
const corsOptions = require("./config/corsOptions");
const connectDB = require("./config/dbConn");
const mongoose = require("mongoose");
const PORT = process.env.PORT || 3500;

console.log(process.env.NODE_ENV);

connectDB();

app.use(
  cookieSession({
    name: "google-auth-session",
    keys: ["key1", "key2"],
  }),
);

app.use(passport.initialize());
app.use(passport.session());

app.use(logger);

// app.use(cors());
app.use(cors(corsOptions));

app.use(express.json());

app.use(cookieParser());

app.get("/auth/failed", (error, req, res, next) => {
  res.send("Failed");
});
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["email", "profile"] }),
);
app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/auth/failed",
  }),
  function (req, res) {
    res.redirect("/auth/success");
  },
);

app.use("/", express.static(path.join(__dirname, "public")));

app.use("/", require("./routes/root"));
app.use("/auth/success", require("./routes/googleAuthRoutes"));
app.use("/auth", require("./routes/authRoutes"));
app.use("/users", require("./routes/userRoutes"));
app.use("/vehicles", require("./routes/vehicleRoutes"));
app.use("/items", require("./routes/itemRoutes"));
app.use("/garages", require("./routes/garageRoutes"));
app.use("/mail", require("./routes/mailRoutes"));
app.use("/sts", require("./routes/stRoutes"));
app.use("/services", require("./routes/serviceRoutes"));

app.all("*", (req, res) => {
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404.html"));
  } else if (req.accepts("json")) {
    res.json({ message: "404 Not Found" });
  } else {
    res.type("txt").send("404 Not Found");
  }
});

app.use(errorHandler);

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
});

const server = app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`),
);
const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "https://warszt.app/",
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("Connected to socket.io");

  socket.on("setup", (userData) => {
    socket.join(userData?._id);
    console.log(`userData?._id: ${userData?._id}`);
    socket.emit("connected");
  });

  socket.on("controllerSaysHello", (admins) => {
    console.log(admins);
    admins.forEach((admin) => {
      socket.in(admin._id).emit("xxx", "zzzz");
      console.log(`admin._id: ${admin._id}`);
    });
  });

  socket.on("join room", (room) => {
    socket.join(room);
    console.log("User joined room: " + room);
  });
});

mongoose.connection.on("error", (err) => {
  console.log(err);
  logEvents(
    `${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`,
    "mongoErrLog.log",
  );
});
