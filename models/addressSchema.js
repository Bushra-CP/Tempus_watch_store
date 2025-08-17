const mongoose = require('mongoose');
const { Schema } = mongoose;

const addressSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  address: [
    {
      country: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      PhoneNo: {
        type: String,
        required: true,
      },
      pincode: {
        type: Number,
        required: true,
      },
      line1: {
        type: String,
        required: true,
      },
      line2: {
        type: String,
        required: true,
      },
      landmark: {
        type: String,
        required: false,
      },
      townCity: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      addressType: {
        type: String,
        enum: ['home', 'work', 'other'],
        default: 'home',
      },
    },
  ],
},
{ timestamps: true }
);

module.exports=mongoose.model('Address',addressSchema);