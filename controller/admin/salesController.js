import logger from '../../utils/logger.js';
import salesServices from '../../services/admin/salesServices.js';
import reportExport from '../../utils/reportExport.js';
import mongoose from 'mongoose';
import messages from '../../config/messages.js';
import moment from 'moment';

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

export default { salesPage };
