import mongoose, { model } from 'mongoose';
const { Schema } = mongoose;

const categorySchema = new Schema({
  categoryName: {
    type:String,
    required:true,
    unique:true
  },
  description:{
    type:String,
    required:true
  },
  image:{
    type:String,
    required:true
  },
  isActive:{
    type:Boolean,
    default:true
  },
  categoryOffer:{
    type:Number,
    default:0
  },
},
{ timestamps: true }
);

export default model('Category', categorySchema);
