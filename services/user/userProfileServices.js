const User = require('../../models/userSchema');
const Address = require('../../models/addressSchema');
const Otp = require('../../models/otpSchema');
const logger = require('../../utils/logger');
const bcrypt = require('bcrypt');
const mongoose=require('mongoose');

const getUser = async (userId) => {
  return await User.findById({ _id: userId });
};

const updateProfile = async (userId, updateProfile) => {
  return await User.findByIdAndUpdate({ _id: userId }, { $set: updateProfile });
};

const getUserAddresses = async (userId) => {
  return await Address.findOne({ userId });
};

const confirmPassword = async (userId, currentPswd) => {
  const user = await User.findOne({ _id: new mongoose.Types.ObjectId(userId) });
  return await bcrypt.compare(currentPswd, user.password);
};

const changePassword = async (userId, hashedNewPassword) => {
  return await User.updateOne(
    { _id: userId },
    { $set: { password: hashedNewPassword } },
  );
};

const changeEmail = async (userId, newEmail) => {
  return await User.updateOne({ _id: userId }, { $set: { email: newEmail } });
};

module.exports = {
  getUser,
  updateProfile,
  getUserAddresses,
  confirmPassword,
  changePassword,
  changeEmail,
};
