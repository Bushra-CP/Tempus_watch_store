const User = require("../models/user/userSchema");
const logger = require("../utils/logger");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");

const findByEmail = async (email) => {
  return await User.findOne({ email });
};

const passwordMatch = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};



const getUsers = async (search, page, limit) => {
  const query = { isAdmin: false };

  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: "i" } },
      { lastName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (page - 1) * limit;

  const users = await User.find(query).skip(skip).limit(limit);
  const total = await User.countDocuments(query);

  return { users, totalPages: Math.ceil(total / limit) };
};

const customerBlock=async (id) => {
  return await User.updateOne(
      { _id:id },
      { $set: { isBlocked: true } }
    );
}

const customerUnblock=async (id) => {
  return await User.updateOne(
      { _id:id },
      { $set: { isBlocked: false } }
    );
}

module.exports = {
  findByEmail,
  passwordMatch,
  getUsers,
  customerBlock,
  customerUnblock,
};
