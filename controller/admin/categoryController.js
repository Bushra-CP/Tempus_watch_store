const logger = require('../../utils/logger');
const Category = require('../../models/categorySchema');
const categoryServices = require('../../services/admin/categoryServices');
const cloudinary = require('../../config/cloudinery');
const session = require('express-session');

const addCategoryPage = async (req, res) => {
  try {
    return res.render('addCategory');
  } catch (error) {
    logger.error('page not found', +error);
    return res.redirect('/admin/pageNotFound');
  }
};

const addCategory = async (req, res) => {
  try {
    const { categoryName, description } = req.body;

    const existingCategory =
      await categoryServices.findCategoryByName(categoryName);

    if (existingCategory) {
      req.flash('error_msg', 'Category name already exists!');
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

    req.flash('success_msg', 'Category added');
    res.redirect('/admin/category');
  } catch (error) {
    console.error('Error creating category:', error);
    return res.redirect('/admin/pageNotFound');
  }
};

const categories = async (req, res) => {
  try {
    req.session.categoryOfferEditUrl='/admin/category';
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

    req.flash('error_msg', 'Category deactivated!');
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

    req.flash('success_msg', 'Category activated!');
    res.redirect('/admin/category');
  } catch (error) {
    logger.error('page not found', +error);
    return res.redirect('/admin/pageNotFound');
  }
};

const editCategoryPage = async (req, res) => {
  try {
    let categoryId = req.query.id;
    let item = await categoryServices.findCategoryById(categoryId);

    return res.render('editCategory', { item });
  } catch (error) {
    logger.error('page not found', +error);
    return res.redirect('/admin/pageNotFound');
  }
};

const categoryEdit = async (req, res) => {
  try {
    const category_id = req.params.id;

    const { categoryName, description } = req.body;
    let existingCategory =
      await categoryServices.findCategoryByName(categoryName);
    if (existingCategory) {
      req.flash('error_msg', 'Category name already exists!');
      res.redirect('/admin/category');
    }
    let updateData = { categoryName, description };

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'tempus',
      });
      updateData.image = result.secure_url;
    }

    await categoryServices.editCategory(category_id, updateData);

    req.flash('success_msg', 'Category edited!');
    res.redirect('/admin/category');
  } catch (error) {
    console.error('Error editing category:', error);
    return res.redirect('/admin/pageNotFound');
  }
};

module.exports = {
  categories,
  addCategoryPage,
  addCategory,
  deactivateCategory,
  activateCategory,
  editCategoryPage,
  categoryEdit,
};
