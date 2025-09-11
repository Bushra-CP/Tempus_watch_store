const logger = require('../../utils/logger');
const orderServices = require('../../services/admin/orderServices');
const mongoose = require('mongoose');

const orderManagementPage = async (req, res) => {
  try {
    let search = req.query.search || '';
    let status = req.query.status;
    let sort = req.query.sort;
    let page = req.query.page || 1;
    let limit=5;

    let orders=await orderServices.getOrders(search,status,sort,page,limit);

    console.log(orders);

    res.render('orderManagement',{orders});
  } catch (error) {
    logger.error('page not found', +error);
    return res.redirect('/admin/pageNotFound');
  }
};

module.exports = { orderManagementPage };
