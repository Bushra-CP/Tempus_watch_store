const logger = require('../../utils/logger');
const adminServices = require('../../services/admin/adminServices');

const loadUsers = async (req, res) => {
  try {
    //console.log(req.query);
    let search = req.query.search || '';
    let status = req.query.status;

    const page = req.query.page || 1;
    const limit = 5;

    const { users, totalPages } = await adminServices.getUsers(
      search,
      page,
      limit,
      status,
    );

    res.render('manageUsers', { users, search, status, page, totalPages });
  } catch (error) {
    logger.error('page not found', +error);
    res.status(500).send('page not found');
  }
};

const blockCustomer = async (req, res) => {
  try {
    let id = req.query.id;
    await adminServices.customerBlock(id);
    res.redirect('/admin/users?message=Blocked customer');
  } catch (error) {
    logger.error('page not found', +error);
    res.status(500).send('page not found');
  }
};

const unblockCustomer = async (req, res) => {
  try {
    let id = req.query.id;
    await adminServices.customerUnblock(id);
    res.redirect('/admin/users?message=Unblocked customer');
  } catch (error) {
    logger.error('page not found', +error);
    res.status(500).send('page not found');
  }
};

module.exports = {
  loadUsers,
  blockCustomer,
  unblockCustomer,
};
