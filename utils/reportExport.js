// utils/reportExport.js
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const moment = require('moment');

const mapOrdersForReport = (orders) => {
  return orders.map((o) => {
    const od = o.orderDetails;
    const totalAmount = od.orderTotal || 0;
    const discountAmount = od.discount || 0;
    const couponAmount = od.couponAmount || 0;
    const finalAmount = od.orderTotalAfterProductReturn || totalAmount;

    return {
      orderNumber: od.orderNumber,
      createdAt: od.orderDate,
      totalAmount,
      discountAmount,
      couponAmount,
      finalAmount,
    };
  });
};

exports.generatePDF = (orders, summary, res) => {
  const mappedOrders = mapOrdersForReport(orders);

  const doc = new PDFDocument();
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    'attachment; filename="sales-report.pdf"',
  );
  doc.pipe(res);

  doc.fontSize(18).text('Sales Report', { align: 'center' });
  doc.moveDown();

  doc.fontSize(12).text('Sales Summary:', { underline: true });
  doc.text(`Total Orders: ${summary.totalOrders}`);
  doc.text(`Gross Revenue: ₹${summary.grossRevenue}`);
  doc.text(`Post Offers Revenue: ₹${summary.postOffersRevenue}`);
  doc.text(`Product Discount: ₹${summary.productDiscount}`);
  doc.text(`Coupon Discount: ₹${summary.couponDiscount}`);
  doc.text(`Total Discount: ₹${summary.totalDiscount}`);
  doc.text(`Net Sales: ₹${summary.netSales}`);
  doc.text(`Return Amount: ₹${summary.returnAmount}`);
  doc.text(`Final Net Sales: ₹${summary.finalNetSales}`);
  doc.moveDown();

  doc.fontSize(12).text('Orders:', { underline: true });
  mappedOrders.forEach((o, i) => {
    doc.text(
      `${i + 1}. Order# ${o.orderNumber} 
      Date: ${moment(o.createdAt).format('DD-MM-YYYY')} |
      Total: ₹${o.totalAmount} 
      Discount: ₹${o.discountAmount} 
      Final: ₹${o.finalAmount}`,
    );
  });

  doc.end();
};

exports.generateExcel = async (orders, summary, res) => {
  const mappedOrders = mapOrdersForReport(orders);

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Sales Report');

  // Full Summary
  sheet.addRow(['Sales Summary']);
  sheet.addRow(['Total Orders', summary.totalOrders]);
  sheet.addRow(['Gross Revenue', summary.grossRevenue]);
  sheet.addRow(['Post Offers Revenue', summary.postOffersRevenue]);
  sheet.addRow(['Product Discount', summary.productDiscount]);
  sheet.addRow(['Coupon Discount', summary.couponDiscount]);
  sheet.addRow(['Total Discount', summary.totalDiscount]);
  sheet.addRow(['Net Sales', summary.netSales]);
  sheet.addRow(['Return Amount', summary.returnAmount]);
  sheet.addRow(['Final Net Sales', summary.finalNetSales]);
  sheet.addRow([]);

  sheet.addRow(['Order No', 'Date', 'Total', 'Discount', 'Final']);
  mappedOrders.forEach((o) => {
    sheet.addRow([
      o.orderNumber,
      moment(o.createdAt).format('DD-MM-YYYY'),
      o.totalAmount,
      o.discountAmount,
      o.finalAmount,
    ]);
  });

  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  );
  res.setHeader(
    'Content-Disposition',
    'attachment; filename="sales-report.xlsx"',
  );
  await workbook.xlsx.write(res);
  res.end();
};
