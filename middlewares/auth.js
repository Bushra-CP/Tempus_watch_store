import User from '../models/userSchema.js';

const userAuth = async (req, res, next) => {
  try {
    if (!req.session.user) {
      return res.redirect('/login');
    }

    const userExist = await User.findById(req.session.user);

    if (!userExist) {
      return res.redirect('/login');
    }

    if (userExist.isBlocked) {
      return res.redirect('/?message=Your account is blocked by admin');
    }

    next();
  } catch (error) {
    console.error(error);
    res.redirect('/login');
  }
};

const adminAuth = async (req, res, next) => {
  try {
    if (!req.session.admin) {
      return res.redirect('/admin/login');
    }

    const adminCheck = await User.findOne({ isAdmin: true });

    if (!adminCheck) {
      return res.redirect('/admin/login');
    }

    next();
  } catch (error) {
    console.error(error);
    res.redirect('/admin/login');
  }
};

const preventUserLoginAccess = (req, res, next) => {
  if (req.session.user) {
    return res.redirect('/');
  }
  next();
};

const preventAdminLoginAccess = (req, res, next) => {
  if (req.session.admin) {
    return res.redirect('/admin/dashboard');
  }
  next();
};

export default {
  userAuth,
  adminAuth,
  preventUserLoginAccess,
  preventAdminLoginAccess,
};
