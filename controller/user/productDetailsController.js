const logger = require('../../utils/logger');
const env = require('dotenv').config();
const productDetailsServices = require('../../services/user/productDetailsServices');
const mongoose=require('mongoose');

const productDetails = async (req, res) => {
  try {
    let productId = req.params.id;
    let variantId = req.query.variantId;
    // console.log(productId);
    // console.log(variantId);
    productId = new mongoose.Types.ObjectId(productId);
    variantId = new mongoose.Types.ObjectId(variantId);
    const { product, variant, checkQuantity } =
      await productDetailsServices.productDetails(productId, variantId);

    const latestProducts = await productDetailsServices.latestProducts();
    req.session.cartUrl = req.url;

    //console.log(checkQuantity);
    res.render('productDetails', {
      product,
      variant,
      checkQuantity,
      latestProducts,
    });
  } catch (error) {
    logger.error('Error rendering product listing page: ', error);
    res.status(500).send('Error loading product listing page');
  }
};

module.exports = {
  productDetails,
};
