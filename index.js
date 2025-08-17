const express = require("express");
const app = express();
const env = require("dotenv").config();
const session = require("express-session");
const logger = require("./utils/logger");
const connectDB = require("./config/db");
const path = require("path");
const fs=require('fs');
const multer=require('multer');
const userRouter = require("./routes/userRouter");
const adminRouter = require("./routes/adminRouter");
const passport = require("./config/passport");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.set("cache-control", "no-store");
  next();
});

app.use("/", userRouter);
app.use("/admin", adminRouter);

app.set("view engine", "ejs");
app.set("views", [
  path.join(__dirname, "views/user"),
  path.join(__dirname, "views/admin"),
]);

connectDB();
app.listen(process.env.PORT, () => {
  logger.info("Server listening");
});
