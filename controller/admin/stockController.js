import productSchema from '../../models/productSchema.js';
import logger from '../../utils/logger.js';
import stockServices from '../../services/admin/stockServices.js';
import mongoose from 'mongoose';
import fs from 'fs';
import messages from '../../config/messages.js';
import statusCode from '../../config/statusCodes.js';

const inventoryPage = async (req, res) => {
  try {
    const search = req.query.search || '';
    const page = req.query.page || 1;
    const filter = req.query.filter || '';
    //console.log(filter);
    const limit = 5;

    const { productList, totalPages } = await stockServices.productsFetch(
      search,
      page,
      limit,
      filter,
    );
    const categoryNames = await stockServices.categoryNames();
    return res.render('stockManagement', {
      productList,
      search,
      page,
      filter,
      totalPages,
      categoryNames,
    });
  } catch (error) {
    logger.error('page not found', error);
    return res.redirect('/admin/pageNotFound');
  }
};

const editStock = async (req, res) => {
  try {
    //console.log(req.body);
    let { productId, variantId, stockQuantity } = req.body;
    productId = new mongoose.Types.ObjectId(String(productId));
    variantId = new mongoose.Types.ObjectId(String(variantId));

    await stockServices.editStock(productId, variantId, stockQuantity);

    req.flash('success_msg', messages.STOCK_QUANTITY_EDITED);
    return res.redirect('/admin/inventory');
  } catch (error) {
    logger.error('page not found', error);
    return res.redirect('/admin/pageNotFound');
  }
};

export default {
  inventoryPage,
  editStock,
};
