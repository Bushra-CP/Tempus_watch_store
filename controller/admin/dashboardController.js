import dashboardServices from '../../services/admin/dashboardServices.js';

const loadDashboard = async (req, res) => {
  try {
    const { orderedCategoryList, orderedProductsList, orderedBrandsList } =
      await dashboardServices.loadDashboard();

    const { orders, totalOrders, netSales, totalUsers, totalProducts } =
      await dashboardServices.dashboardData();

    return res.render('adminDashboard', {
      orderedCategoryList,
      orderedProductsList,
      orderedBrandsList,
      orders,
      totalOrders,
      netSales,
      totalUsers,
      totalProducts,
    });
  } catch (error) {
    console.log('page not found', error);
    return res.redirect('/admin/pageNotFound');
  }
};

const dashboardData = async (req, res) => {
  try {
    const filter = req.query.filter;

    const chartData = await dashboardServices.dashboard(filter);
    // console.log(chartData);
    res.json(chartData);
  } catch (error) {
    console.log(error);
  }
};

export default {
  loadDashboard,
  dashboardData,
};
