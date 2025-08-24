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
    return res.redirect('/admin/pageNotFound');
  }
};

const blockCustomer = async (req, res) => {
  try {
    let id = req.query.id;
    await adminServices.customerBlock(id);
    req.flash('error_msg', 'Blocked customer!');
    res.redirect('/admin/users');
  } catch (error) {
    logger.error('page not found', +error);
    return res.redirect('/admin/pageNotFound');
  }
};

const unblockCustomer = async (req, res) => {
  try {
    let id = req.query.id;
    await adminServices.customerUnblock(id);
    req.flash('success_msg', 'Unblocked customer!');
    res.redirect('/admin/users');
  } catch (error) {
    logger.error('page not found', +error);
    return res.redirect('/admin/pageNotFound');
  }
};

module.exports = {
  loadUsers,
  blockCustomer,
  unblockCustomer,
};
