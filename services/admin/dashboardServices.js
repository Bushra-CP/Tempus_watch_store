import Order from '../../models/orderSchema.js';
import Products from '../../models/productSchema.js';
import User from '../../models/userSchema.js';
import moment from 'moment';

const loadDashboard = async (params) => {
  const ordersList = await Order.aggregate([
    { $unwind: '$orderDetails' },
    { $unwind: '$orderDetails.orderItems' },
    {
      $lookup: {
        from: 'products',
        localField: 'orderDetails.orderItems.productId',
        foreignField: '_id',
        as: 'productInfo',
      },
    },
    { $unwind: '$productInfo' },
    {
      $lookup: {
        from: 'categories',
        localField: 'productInfo.category',
        foreignField: '_id',
        as: 'categoryInfo',
      },
    },
    { $unwind: '$categoryInfo' },
    {
      $project: {
        'orderDetails.orderItems': 1,
        'categoryInfo.categoryName': 1,
        _id: 0,
      },
    },
  ]);

  let categoryList = ordersList.reduce((acc, curr) => {
    const categoryName = curr.categoryInfo.categoryName;
    const priceInfo =
      curr.orderDetails.orderItems.finalDiscountedPrice ??
      curr.orderDetails.orderItems.total;
    const quantity = curr.orderDetails.orderItems.quantity;
    let count, total;
    if (acc[categoryName]) {
      acc[categoryName].count += quantity;
      acc[categoryName].total += priceInfo;
    } else {
      acc[categoryName] = {
        count: quantity,
        total: priceInfo,
      };
    }

    return acc;
  }, {});

  //console.log(categoryList);

  let productList = ordersList.reduce((acc, curr) => {
    const productName = curr.orderDetails.orderItems.productName;
    const priceInfo =
      curr.orderDetails.orderItems.finalDiscountedPrice ??
      curr.orderDetails.orderItems.total;
    const quantity = curr.orderDetails.orderItems.quantity;
    let count, total;
    if (acc[productName]) {
      acc[productName].count += quantity;
      acc[productName].total += priceInfo;
    } else {
      acc[productName] = {
        count: quantity,
        total: priceInfo,
      };
    }

    return acc;
  }, {});

  //console.log(productList);

  let brandList = ordersList.reduce((acc, curr) => {
    const brandName = curr.orderDetails.orderItems.brand;
    const priceInfo =
      curr.orderDetails.orderItems.finalDiscountedPrice ??
      curr.orderDetails.orderItems.total;
    const quantity = curr.orderDetails.orderItems.quantity;
    let count, total;
    if (acc[brandName]) {
      acc[brandName].count += quantity;
      acc[brandName].total += priceInfo;
    } else {
      acc[brandName] = {
        count: quantity,
        total: priceInfo,
      };
    }

    return acc;
  }, {});

  //console.log(brandList);

  const orderedCategoryList = Object.entries(categoryList)
    .sort((a, b) => b[1].count - a[1].count)
    .map(([categoryName, data]) => ({
      categoryName,
      ...data,
    }));

  const orderedProductsList = Object.entries(productList)
    .sort((a, b) => b[1].count - a[1].count)
    .map(([productName, data]) => ({
      productName,
      ...data,
    }));

  const orderedBrandsList = Object.entries(brandList)
    .sort((a, b) => b[1].count - a[1].count)
    .map(([brandName, data]) => ({
      brandName,
      ...data,
    }));

  return { orderedCategoryList, orderedProductsList, orderedBrandsList };
};

const dashboard = async (filter) => {
  let match = { 'orderDetails.status': { $ne: 'failed' } };

  let start, end;

  if (filter === 'Weekly') {
    start = moment().startOf('isoWeek').toDate();
    end = moment().endOf('isoWeek').toDate();
  } else if (filter === 'Monthly') {
    start = moment().startOf('month').toDate();
    end = moment().endOf('month').toDate();
  } else if (filter === 'Yearly') {
    start = moment().startOf('year').toDate();
    end = moment().endOf('year').toDate();
  }

  if (start && end) {
    match['orderDetails.orderDate'] = { $gte: start, $lte: end };
  }

  try {
    const salesData = await Order.aggregate([
      { $unwind: '$orderDetails' },
      { $match: match },
      {
        $group: {
          _id: {
            $dateToString: {
              format:
                filter === 'Weekly'
                  ? '%d %b' // group by day
                  : filter === 'Monthly'
                    ? '%d %b' // group by date
                    : '%Y %b', // group by month
              date: '$orderDetails.orderDate',
            },
          },
          totalSales: { $sum: '$orderDetails.orderTotal' },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Format for Chart.js
    const formatted = salesData.map((item) => ({
      label: item._id,
      totalSales: item.totalSales,
      orderCount: item.orderCount,
    }));

    return formatted;
  } catch (err) {
    console.error('Error generating dashboard data:', err);
    return [];
  }
};

const getVariantDetails = async (variantId) => {
  return await Products.findOne(
    { 'variants._id': variantId },
    { _id: 0, 'variants.$': 1 },
  );
};

const dashboardData = async () => {
  let match = { 'orderDetails.status': { $ne: 'failed' } };

  //////RECENT ORDERS
  const orders = await Order.aggregate([
    { $unwind: '$orderDetails' },
    { $match: match },
  ]);

  /////TOTAL ORDERS
  let totalOrders = orders.length;

  const ordersList = await Order.aggregate([
    { $unwind: '$orderDetails' },
    { $match: match },
    { $unwind: '$orderDetails.orderItems' },
  ]);

  /////GROSS REVENUE
  let netSales = 0;

  for (let i = 0; i < orders.length; i++) {
    netSales += orders[i].orderDetails.orderTotal;
  }

  //////TOTAL USERS
  const users = await User.find({ isAdmin: false });
  let totalUsers = users.length;

  /////TOTAL PRODUCTS
  const productList = await Products.find({});
  let totalProducts = productList.length;

  return { orders, totalOrders, netSales, totalUsers, totalProducts };
};

export default { loadDashboard, dashboard, dashboardData };
