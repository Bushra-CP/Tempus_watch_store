import { request } from 'express';
import mongoose, { Schema as _Schema, model } from 'mongoose';
const { Schema } = mongoose;

const orderDetailsSchema = new Schema({
  orderNumber: { type: String, required: true, unique: true },
  status: {
    type: String,
    enum: [
      'pending',
      'confirmed',
      'shipped',
      'delivered',
      'cancelled',
      'returned',
      'cancelled/returned',
      'failed',
      'failed*',
    ],
    default: 'pending',
  },
  orderDate: { type: Date, default: Date.now },
  deliveryDate: {
    type: Date,
    default: function () {
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    },
  },

  shippingAddress: {
    country: String,
    name: String,
    phoneNo: String,
    addressLine: String,
    landmark: String,
    townCity: String,
    state: String,
    pincode: String,
    addressType: String,
  },

  paymentMethod: {
    type: String,
    enum: [
      'COD',
      'ONLINE',
      'WALLET_ONLY',
      'WALLET_PLUS_COD',
      'WALLET_PLUS_ONLINE',
    ],
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'success', 'failed', 'refunded'],
    default: 'pending',
  },
  transactionId: { type: String },

  orderItems: [
    {
      productId: {
        type: _Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      variantId: { type: Schema.Types.ObjectId, required: true },
      productName: String,
      brand: String,

      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
      total: { type: Number, required: true },
      discount: { type: Number },
      finalDiscountedPrice: { type: Number },
      variantDetails: {
        strapMaterial: String,
        strapColor: String,
        dialColor: String,
        caseSize: Number,
        movementType: String,
        caseMaterial: String,
        variantImages: [String],
      },

      // 🔹 Item-level cancellation
      cancellation: {
        isCancelled: { type: Boolean, default: false },
        cancelStatus: {
          type: String,
          enum: ['requested', 'approved', 'rejected', 'cancelled', null],
          default: null,
        },
        cancelReason: String,
        additionalNotes: String,
        requestedAt: Date,
        processedAt: Date,
        refundAmount: { type: Number, default: 0 },
        requestReviewedDetails: { type: Object },
      },

      // 🔹 Item-level return
      return: {
        isReturned: { type: Boolean, default: false },
        returnStatus: {
          type: String,
          enum: ['requested', 'approved', 'rejected', null],
          default: null,
        },
        returnReason: String,
        additionalNotes: String,
        requestedAt: Date,
        processedAt: Date,
        refundAmount: { type: Number, default: 0 },
        requestReviewedDetails: { type: Object },
      },
    },
  ],

  totalProducts: {
    type: Number,
  },

  couponApplied: {
    isApplied: {
      type: Boolean,
      default: false,
    },
    couponId: {
      type: Schema.Types.ObjectId,
    },
    couponCode: {
      type: String,
    },
    couponType: {
      type: String,
    },
    couponAmount: {
      type: Number,
    },
    minPurchaseAmount: {
      type: Number,
    },
  },

  subTotal: { type: Number, required: true },
  shippingCharge: { type: Number, default: 20 },
  discount: { type: Number, default: 0 },
  orderTotal: { type: Number, required: true },
  orderTotalAfterProductReturn: { type: Number },
  couponAmountDeducted: { type: Boolean, default: false },

  trackingNumber: String,
  courierService: String,

  statusHistory: [
    {
      status: String,
      date: { type: Date, default: Date.now },
    },
  ],

  notes: String,
  gift: { type: Boolean, default: false },

  // 🔹 Order-level cancellation
  cancellation: {
    isCancelled: { type: Boolean, default: false },
    cancelStatus: {
      type: String,
      enum: ['requested', 'approved', 'rejected', 'cancelled', null],
      default: null,
    },
    cancelReason: String,
    additionalNotes: String,
    requestedAt: Date,
    processedAt: Date,
    refundAmount: { type: Number, default: 0 },
  },

  // 🔹 Order-level return
  return: {
    isReturned: { type: Boolean, default: false },
    returnStatus: {
      type: String,
      enum: ['requested', 'approved', 'rejected', null],
      default: null,
    },
    returnReason: String,
    additionalNotes: String,
    requestedAt: Date,
    processedAt: Date,
    refundAmount: { type: Number, default: 0 },
  },
  razorpayDetails: {
    razorpay_order_id: String,
    razorpay_payment_id: String,
    razorpay_signature: String,
  },
  refundTransactions: {
    type: [Object],
    default: [],
  },
});

const OrderSchema = new Schema(
  {
    userId: {
      type: _Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userName: {
      type: String,
    },
    email: {
      type: String,
    },
    phoneNo: {
      type: String,
    },
    orderDetails: [orderDetailsSchema],
  },
  { timestamps: true },
);

export default model('Order', OrderSchema);
