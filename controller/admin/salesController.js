const logger = require('../../utils/logger');
const salesServices = require('../../services/admin/salesServices');
const reportExport = require('../../utils/reportExport');
const mongoose = require('mongoose');
const messages = require('../../config/messages');
const moment = require('moment');


const salesPage = async (req, res) => {
  try {
    const { type, startDate, endDate, format } = req.query;

    const { orders, summary } = await salesServices.getSalesReport(
      type,
      startDate,
      endDate,
    );

    //console.log(orders);

    if (format === 'pdf') {
      return reportExport.generatePDF(orders, summary, res);
    }

    if (format === 'excel') {
      return reportExport.generateExcel(orders, summary, res);
    }

    res.render('salesReport', {
      orders,
      summary,
      filter: { type, startDate, endDate },
    });
  } catch (error) {
    logger.error('page not found', error);
    return res.redirect('/admin/pageNotFound');
  }
};

module.exports = { salesPage };
