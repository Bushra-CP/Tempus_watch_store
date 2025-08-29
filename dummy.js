const fs = require('fs');
const mongoose = require('mongoose');
const Product = require('./models/productSchema'); // your product model
const env=require('dotenv').config();

// Read JSON file
const productsData = JSON.parse(fs.readFileSync('mens_watches_mongoimport.json', 'utf-8'));

// Insert into MongoDB using Mongoose
async function seedProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    // Insert data
    await Product.insertMany(productsData);

    console.log('Products inserted successfully!');
    mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

seedProducts();
