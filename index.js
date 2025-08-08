const express = require("express");
const app = express();
const env = require("dotenv").config();
const logger = require("./utils/logger");
const connectDB = require("./config/db");
const path = require("path");
const userRouter = require("./routes/userRouter");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/", userRouter);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views/user"));



connectDB();
app.listen(process.env.PORT, () => {
  logger.info("Server listening");
});
