import mongoose, { model } from 'mongoose';
const { Schema } = mongoose;

const adminSchema = new Schema(
  {
    firstName: {
      type: String,
      required: false,
    },
    lastName: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phoneNo: {
      type: String,
      required: false,
      sparse: true,
      default: null,
    },
    password: {
      type: String,
      required: false,
    },
    image: {
      type: String,
      required: false,
    },
    isAdmin: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

export default model('Admin', adminSchema);
