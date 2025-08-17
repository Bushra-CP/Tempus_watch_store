const Category = require("../../models/categorySchema");
const Product = require("../../models/productSchema");

// const categoryFetch = async (limit, skip) => {
//   const categories= await Category.find({})
//     .sort({ createdAt: -1 })
//     .skip(skip)
//     .limit(limit);

//     const totalCategories=await Category.countDocuments();
//     const totalPages=Math.ceil(totalCategories/limit);
//     return {categories,totalCategories,totalPages};
// };

// module.exports = {
//   categoryFetch,
// };
