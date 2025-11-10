import logger from '../../utils/logger.js';
import Category from '../../models/categorySchema.js';
import categoryServices from '../../services/admin/categoryServices.js';
import cloudinary from '../../config/cloudinery.js';
import session from 'express-session';
import messages from '../../config/messages.js';
import statusCode from '../../config/statusCodes.js';
import mongoose from 'mongoose';

const addCategoryPage = async (req, res) => {
  try {
    return res.render('addCategory');
  } catch (error) {
    logger.error('page not found', error);
    return res.redirect('/admin/pageNotFound');
  }
};

const addCategory = async (req, res) => {
  try {
    const { categoryName, description } = req.body;
    console.log(req.body);

    ////////*/FORM VALIDATION/*////////

    // ✅ Check for empty fields
    if (!categoryName || !description) {
      req.flash('error_msg', messages.CATEGORY_DESC_ERROR);
      return res.redirect('/admin/category/add');
    }

    // ✅ Trim to avoid whitespace-only input
    if (categoryName.trim().length === 0) {
      req.flash('error_msg', messages.CATEGORY_ERROR);
      return res.redirect('/admin/category/add');
    }

    if (description.trim().length === 0) {
      req.flash('error_msg', messages.DESC_ERROR);
      return res.redirect('/admin/category/add');
    }

    // ✅ Optional: Check length limits
    if (categoryName.length < 3 || categoryName.length > 50) {
      req.flash('error_msg', messages.CATEGORY_ERROR2);
      return res.redirect('/admin/category/add');
    }

    if (description.length < 10) {
      req.flash('error_msg', messages.DESC_ERROR2);
      return res.redirect('/admin/category/add');
    }

    ////////*/FORM VALIDATION/*////////

    const existingCategory =
      await categoryServices.findCategoryByName(categoryName);

    if (existingCategory) {
      req.flash('error_msg', messages.CATEGORY_NAME_EXISTS);
      return res.redirect('/admin/category/add');
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'tempus',
    });

    let image_url = result.secure_url;

    req.session.categoryData = {
      categoryName,
      description,
      image_url,
    };

    let categoryDetails = req.session.categoryData;

    await categoryServices.createCategory(categoryDetails);

    req.flash('success_msg', messages.CATEGORY_ADDED);
    res.redirect('/admin/category');
  } catch (error) {
    console.error('Error creating category:', error);
    return res.redirect('/admin/pageNotFound');
  }
};

const categories = async (req, res) => {
  try {
    req.session.categoryOfferEditUrl = '/admin/category';
    let search = req.query.search || '';
    let page = req.query.page || 1;
    let status = req.query.status;
    let limit = 5;

    let { category, totalPages } = await categoryServices.listCategory(
      search,
      page,
      limit,
      status,
    );

    const categoryOffer = await categoryServices.findCategoryOffer();

    res.render('category', {
      category,
      search,
      page,
      totalPages,
      categoryOffer,
    });
  } catch (error) {
    logger.error('page not found', error);
    return res.redirect('/admin/pageNotFound');
  }
};

const deactivateCategory = async (req, res) => {
  try {
    let category_id = req.query.id;
    await categoryServices.categoryDeactivate(category_id);

    req.flash('success_msg', messages.CATEGORY_DEACTIVATED);
    res.redirect('/admin/category');
  } catch (error) {
    logger.error('page not found', +error);
    return res.redirect('/admin/pageNotFound');
  }
};

const activateCategory = async (req, res) => {
  try {
    let category_id = req.query.id;
    await categoryServices.categoryActivate(category_id);

    req.flash('success_msg', messages.CATEGORY_ACTIVATED);
    res.redirect('/admin/category');
  } catch (error) {
    logger.error('page not found', error);
    return res.redirect('/admin/pageNotFound');
  }
};

const editCategoryPage = async (req, res) => {
  try {
    let categoryId = req.query.id;
    let item = await categoryServices.findCategoryById(categoryId);

    return res.render('editCategory', { item });
  } catch (error) {
    logger.error('page not found', error);
    return res.redirect('/admin/pageNotFound');
  }
};

const categoryEdit = async (req, res) => {
  try {
    const category_id = req.params.id;

    const { categoryName, description } = req.body;

    ////////*/FORM VALIDATION/*////////

    // ✅ Check for empty fields
    if (!categoryName || !description) {
      req.flash('error_msg', messages.CATEGORY_DESC_ERROR);
      return res.redirect('/admin/category/add');
    }

    // ✅ Trim to avoid whitespace-only input
    if (categoryName.trim().length === 0) {
      req.flash('error_msg', messages.CATEGORY_ERROR);
      return res.redirect('/admin/category/add');
    }

    if (description.trim().length === 0) {
      req.flash('error_msg', messages.DESC_ERROR);
      return res.redirect('/admin/category/add');
    }

    // ✅ Optional: Check length limits
    if (categoryName.length < 3 || categoryName.length > 50) {
      req.flash('error_msg', messages.CATEGORY_ERROR2);
      return res.redirect('/admin/category/add');
    }

    if (description.length < 10) {
      req.flash('error_msg', messages.DESC_ERROR2);
      return res.redirect('/admin/category/add');
    }

    ////////*/FORM VALIDATION/*////////

    let existingCategory = await categoryServices.findCategoryByName(
      new mongoose.Types.ObjectId(String(category_id)),
      categoryName,
    );
    if (existingCategory) {
      req.flash('error_msg', messages.CATEGORY_NAME_EXISTS);
      return res.redirect('/admin/category');
    }
    let updateData = { categoryName, description };

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'tempus',
      });
      updateData.image = result.secure_url;
    }

    await categoryServices.editCategory(category_id, updateData);

    req.flash('success_msg', messages.CATEGORY_EDITED);
    res.redirect('/admin/category');
  } catch (error) {
    console.error('Error editing category:', error);
    return res.redirect('/admin/pageNotFound');
  }
};

export default {
  categories,
  addCategoryPage,
  addCategory,
  deactivateCategory,
  activateCategory,
  editCategoryPage,
  categoryEdit,
};
