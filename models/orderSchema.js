const mongoose = require('mongoose');
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
      'partially_returned',
      'partially_cancelled',
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
    enum: ['COD', 'Credit Card', 'UPI', 'Net Banking'],
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending',
  },
  transactionId: { type: String },

  orderItems: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      variantId: { type: Schema.Types.ObjectId, required: true },
      productName: String,
      brand: String,
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
      total: { type: Number, required: true },
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
          enum: ['requested', 'approved', 'rejected', null],
          default: null,
        },
        cancelReason: String,
        additionalNotes: String,
        requestedAt: Date,
        processedAt: Date,
        refundAmount: { type: Number, default: 0 },
      },

      // 🔹 Item-level return
      return: {
        isReturned: { type: Boolean, default: false },
        returnStatus: {
          type: String,
          enum: ['requested', 'approved', 'rejected', 'completed', null],
          default: null,
        },
        returnReason: String,
        additionalNotes: String,
        requestedAt: Date,
        processedAt: Date,
        refundAmount: { type: Number, default: 0 },
      },
    },
  ],

  subTotal: { type: Number, required: true },
  shippingCharge: { type: Number, default: 20 },
  discount: { type: Number, default: 0 },
  orderTotal: { type: Number, required: true },

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
      enum: ['requested', 'approved', 'rejected', null],
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
});

const OrderSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    orderDetails: [orderDetailsSchema],
  },
  { timestamps: true },
);

module.exports = mongoose.model('Order', OrderSchema);
