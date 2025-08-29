const { query } = require('winston');
const User = require('../../models/userSchema');
const bcrypt = require('bcrypt');


const getUsers = async (search, page, limit, status) => {
  let query = { isAdmin: false };

  // Status filter
  if (status === 'blocked') {
    query.isBlocked = true;
  } else if (status === 'unblocked') {
    query.isBlocked = false;
  }

  // Search filter
  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;

  const users = await User.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await User.countDocuments(query);

  return { users, totalPages: Math.ceil(total / limit) };
};

const customerBlock = async (id) => {
  return await User.updateOne({ _id: id }, { $set: { isBlocked: true } });
};

const customerUnblock = async (id) => {
  return await User.updateOne({ _id: id }, { $set: { isBlocked: false } });
};

module.exports = {
  getUsers,
  customerBlock,
  customerUnblock,
};
