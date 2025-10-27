import { Schema, model } from 'mongoose';

const couponSchema = new Schema({
  couponCode: { type: String, required: true, unique: true },
  description: { type: String },

  discountType: { type: String, enum: ['PERCENTAGE', 'FIXED'], required: true },
  discountValue: { type: Number, required: true },

  maxDiscountAmount: { type: Number },

  minPurchaseAmount: { type: Number, default: 0 },

  usageLimit: { type: Number, default: 1 },
  perUserLimit: { type: Number, default: 1 },

  validFrom: { type: Date, default: Date.now },
  validUntil: { type: Date },

  applicableCategories: [
    { type: Schema.Types.ObjectId, ref: 'Category' },
  ],
  applicableProducts: [
    { type: Schema.Types.ObjectId, ref: 'Products' },
  ],

  status: {
    type: String,
    enum: ['ACTIVE', 'EXPIRED', 'USEDUP', 'DISABLED'],
    default: 'ACTIVE',
  },

  usedBy: [
    {
      userId: { type: Schema.Types.ObjectId, ref: 'User' },
      usageCount: { type: Number, default: 0 },
      orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
    },
  ],

  createdAt: { type: Date, default: Date.now },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

couponSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

export default model('Coupons', couponSchema);
