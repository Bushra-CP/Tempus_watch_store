import User from '../../models/userSchema.js';
import Address from '../../models/addressSchema.js';
import Otp from '../../models/otpSchema.js';
import logger from '../../utils/logger.js';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

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

const getWallet = async (userId) => {
  return await User.aggregate([
    { $match: { _id: userId } },
    { $unwind: '$wallet.transactions' },
    { $sort: { 'wallet.transactions.createdAt': -1 } },
    {
      $group: {
        _id: '$_id',
        balance: { $first: '$wallet.balance' },
        transactions: { $push: '$wallet.transactions' },
      },
    },
  ]);
};

export default {
  getUser,
  updateProfile,
  getUserAddresses,
  confirmPassword,
  changePassword,
  changeEmail,
  getWallet,
};
