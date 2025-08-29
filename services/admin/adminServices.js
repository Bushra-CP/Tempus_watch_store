const Admin = require('../../models/adminSchema');
const bcrypt = require('bcrypt');

const profile = async (firstName, lastName, email, phoneNo, hashedPassword) => {
  const saveProfile = new Admin({
    firstName,
    lastName,
    email,
    phoneNo,
    password: hashedPassword,
  });
  return await saveProfile.save();
};

const findByEmail = async (email) => {
  return await Admin.findOne({ email });
};

const passwordMatch = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

module.exports = {
  profile,
  findByEmail,
  passwordMatch,
};
