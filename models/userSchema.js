import mongoose from 'mongoose';
const { Schema } = mongoose;

const userSchema = new Schema(
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
    dob: {
      type: String,
      required: false,
    },
    gender: {
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

    wallet: {
      balance: {
        type: Number,
        default: 0,
      },
      transactions: [
        {
          type: {
            type: String,
            enum: ['CREDIT', 'DEBIT'],
          },
          amount: { type: Number, default: 0 },
          description: { type: String },
          notes: { type: String },
          orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
          createdAt: { type: Date, default: Date.now },
        },
      ],
    },

    referralCoupons: [
      {
        couponCode: {
          type: String,
        },
        couponAmount: {
          type: Number,
        },
        minPurchaseAmount: {
          type: Number,
        },
        earnedFrom: {
          type: String,
        },
        buddyEmail: { type: String },
        issuedOn: {
          type: Date,
        },
        expiresOn: {
          type: Date,
          default: function () {
            const date = new Date();
            date.setMonth(date.getMonth() + 6); // adds 6 months expiry
            return date;
          },
        },
        status: {
          type: String,
          enum: ['active', 'used', 'expired', 'Not Eligible'],
          default: 'active',
        },
      },
    ],
    refferalCode: {
      type: String,
      default: function () {
        const date = new Date().toISOString().slice(0, 4).replace(/-/g, '');
        const shortUUID = crypto.randomUUID().split('-')[0];
        return `TEMPUS-REF-${date}-${shortUUID}`;
      },
      unique: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model('User', userSchema);
