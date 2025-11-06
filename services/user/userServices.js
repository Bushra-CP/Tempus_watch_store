import User from '../../models/userSchema.js';
import Products from '../../models/productSchema.js';
import Contact from '../../models/contactSchema.js';
import Otp from '../../models/otpSchema.js';
import logger from '../../utils/logger.js';
import nodemailer from 'nodemailer';
import bcrypt from 'bcrypt';

const findUserByEmail = async (email) => {
  return await User.findOne({ email });
};

const findUserById = async (userId) => {
  return await User.findOne({ _id: userId });
};

const storeOTP = async (email, otpValue) => {
  const newOtp = new Otp({
    email,
    otp: otpValue,
  });
  return await newOtp.save();
};

const findByOTP = async (otpValue) => {
  return await Otp.findOne({ otp: otpValue });
};

const createUser = async (userData) => {
  const newUser = new User({
    firstName: userData.firstName,
    lastName: userData.lastName,
    email: userData.email,
    phoneNo: userData.phoneNo,
    password: userData.hashedPassword,
  });
  return await newUser.save();
};

//functions to generate OTP
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendVerificationEmail(email, otp) {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASSWORD,
      },
    });
    const info = await transporter.sendMail({
      from: process.env.NODEMAILER_EMAIL,
      to: email,
      subject: 'Verify your account',
      text: `Your OTP is ${otp}`,
      html: `<b>Your OTP ${otp}</b>`,
    });
    return info.accepted.length > 0;
  } catch (error) {
    logger.error('Error sending Email', error);
    return false;
  }
}

const validatePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

const changePassword = async (email, hashedPassword) => {
  return await User.updateOne(
    { email },
    { $set: { password: hashedPassword } },
  );
};

const brandNames = async () => {
  return await Products.aggregate([
    { $group: { _id: null, BrandNames: { $addToSet: '$brand' } } },
    { $project: { _id: 0, BrandNames: 1 } },
  ]);
};

const categories = async () => {
  return await Products.aggregate([
    {
      $group: {
        _id: null,
        CategoryIds: { $addToSet: '$category' },
      },
    },
    {
      $lookup: {
        from: 'categories',
        localField: 'CategoryIds',
        foreignField: '_id',
        as: 'categoryData',
      },
    },
    {
      $project: {
        _id: 0,
        categoryData: 1,
      },
    },
  ]);
};

const sendMessage = async (fname, lname, email, message) => {
  const newMessage = new Contact({
    fname,
    lname,
    email,
    message,
  });
  return await newMessage.save();
};

export default {
  findUserByEmail,
  findUserById,
  storeOTP,
  findByOTP,
  createUser,
  generateOtp,
  sendVerificationEmail,
  validatePassword,
  changePassword,
  brandNames,
  categories,
  sendMessage,
};
