const mongoose = require('mongoose');
const { Schema } = mongoose;

const productSchema=new Schema({
    productName:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    brand:{
        type:String,
        required:true
    },
    category:{
        type:Schema.Types.ObjectId,
        ref:'Category',
        required:true
    },
    regularPrice:{
        type:Number,
        required:true
    },
    salePrice:{
        type:Number,
        required:true
    },
    caseSize:{
        type:Number,
        required:true
    },
    movement:{
        type:String,
        required:true
    },
    stockQuantity:{
        type:Number,
        required:true
    },
    color:{
        type:String,
        required:true
    },
    skuCode:{
        type:String,
        required:true
    },
    productImage:{
        type:[String],
        required:true
    },
    isBlocked:{
        type:Boolean,
        default:false
    },
    status:{
        type:String,
        enum:['Available','Out of Stock','Discontinued'],
        default:'Available',
        required:true
    },
},
{ timestamps: true }
);

module.exports = mongoose.model('Products', productSchema);