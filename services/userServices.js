const User = require("../models/user/userSchema");
const logger=require('../utils/logger')
const nodemailer=require('nodemailer');

const findUserByEmail = async (email) => {
  return await User.findOne({ email });
};

const createUser = async (
  firstName,
  lastName,
  email,
  phoneNo,
  hashedPassword
) => {
  const newUser = new User({
    firstName,
    lastName,
    email,
    phoneNo,
    password: hashedPassword,
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
      service: "gmail",
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
      subject: "Verify your account",
      text: `Your OTP is ${otp}`,
      html: `<b>Your OTP ${otp}</b>`,
    });
    return info.accepted.length > 0;
  } catch (error) {
    logger.error("Error sending Email", error);
    return false;
  }
}

module.exports = {
  findUserByEmail,
  createUser,
  generateOtp,
  sendVerificationEmail,
};
