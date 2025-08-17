const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
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
    sparse:true,
    default:null,
  },
  password: {
    type: String,
    required: false,
  },
  dob: {
    type: String,
    required: false,
  },
  gender: {
    type: String,
    required: false,
  },
  bio: {
    type: String,
    required: false,
  },
  image: {
    type: String,
    required: false,
  },
  googleId: {
    type: String,
  },
  isBlocked: {
    type: Boolean,
    default: false,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  cart: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Cart',
    },
  ],
  wallet: {
    type: Schema.Types.ObjectId,
    ref: 'Wallet',
  },
  wishlistId: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Wishlist',
    },
  ],
  orderHistory: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Orders',
    },
  ],
  searchHistory:[
    {
      category:{
        type:Schema.Types.ObjectId,
        ref:'Category'
      },
      brand:{
        type:String
      },
      searchOn:{
        type:Date,
        default:Date.now
      }
    }
  ],
},
{ timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
