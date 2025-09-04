const logger = require('../../utils/logger');
const env = require('dotenv').config();
const productDetailsServices = require('../../services/user/productDetailsServices');

const productDetails = async (req, res) => {
  try {
    let productId = req.params.id;
    let variantId = req.query.variantId;

    const { product, variant } = await productDetailsServices.productDetails(
      productId,
      variantId,
    );

    const latestProducts=await productDetailsServices.latestProducts();

    // console.log(productId);
    res.render('productDetails',{product, variant,latestProducts});
  } catch (error) {
    logger.error('Error rendering product listing page: ', error);
    res.status(500).send('Error loading product listing page');
  }
};

module.exports = {
  productDetails,
};
