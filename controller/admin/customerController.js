import logger from '../../utils/logger.js';
import customerServices from '../../services/admin/customerServices.js';
import messages from '../../config/messages.js';
import statusCode from '../../config/statusCodes.js';

const loadUsers = async (req, res) => {
  try {
    //console.log(req.query);
    let search = req.query.search || '';
    let status = req.query.status;

    const page = req.query.page || 1;
    const limit = 10;

    const { users, totalPages } = await customerServices.getUsers(
      search,
      page,
      limit,
      status,
    );

    res.render('manageUsers', { users, search, status, page, totalPages });
  } catch (error) {
    logger.error('page not found', error);
    return res.redirect('/admin/pageNotFound');
  }
};

const blockCustomer = async (req, res) => {
  try {
    let id = req.query.id;
    await customerServices.customerBlock(id);
    req.flash('error_msg', messages.BLOCKED_CUSTOMER);
    res.redirect('/admin/users');
  } catch (error) {
    logger.error('page not found', error);
    return res.redirect('/admin/pageNotFound');
  }
};

const unblockCustomer = async (req, res) => {
  try {
    let id = req.query.id;
    await customerServices.customerUnblock(id);
    req.flash('success_msg', messages.UNBLOCKED_CUSTOMER);
    res.redirect('/admin/users');
  } catch (error) {
    logger.error('page not found', +error);
    return res.redirect('/admin/pageNotFound');
  }
};

export default {
  loadUsers,
  blockCustomer,
  unblockCustomer,
};
