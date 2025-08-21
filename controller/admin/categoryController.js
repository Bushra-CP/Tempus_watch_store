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
    res.status(500).send('page not found');
  }
};

const addCategory = async (req, res) => {
  try {
    const { categoryName, description } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'Image is required' });
    }

    const existingCategory =
      await categoryServices.findCategoryByName(categoryName);

    if (existingCategory) {
      return res.redirect(
        '/admin/category/add?message=Category name already exists!',
      );
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

    res.redirect('/admin/category?message:category added'); // or success page
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).send('Something went wrong');
  }
};

const categories = async (req, res) => {
  try {
    let search = req.query.search || '';
    let page = req.query.page || 1;
    let status = req.query.status;
    let limit = 6;

    let { category, totalPages } = await categoryServices.listCategory(
      search,
      page,
      limit,
      status,
    );
    //console.log(output);

    res.render('category', { category, search, page, totalPages });
  } catch (error) {
    logger.error('page not found', +error);
    res.status(500).send('page not found');
  }
};

const deactivateCategory = async (req, res) => {
  try {
    let category_id = req.query.id;
    await categoryServices.categoryDeactivate(category_id);
    return res.redirect('/admin/category?message=Category deactivated');
  } catch (error) {
    logger.error('page not found', +error);
    res.status(500).send('page not found');
  }
};

const activateCategory = async (req, res) => {
  try {
    let category_id = req.query.id;
    await categoryServices.categoryActivate(category_id);
    return res.redirect('/admin/category?message=Category activated');
  } catch (error) {
    logger.error('page not found', +error);
    res.status(500).send('page not found');
  }
};

const editCategoryPage = async (req, res) => {
  try {
    let categoryId = req.query.id;
    let item = await categoryServices.findCategoryById(categoryId);

    return res.render('editCategory', { item });
  } catch (error) {
    logger.error('page not found', +error);
    res.status(500).send('page not found');
  }
};

const categoryEdit = async (req, res) => {
  try {
    const category_id = req.params.id; 
    const { categoryName, description } = req.body;

    let updateData = { categoryName, description };

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'tempus',
      });
      updateData.image = result.secure_url;
    }

    await categoryServices.editCategory(category_id, updateData);

    res.redirect('/admin/category?message=Category edited');
  } catch (error) {
    console.error('Error editing category:', error);
    res.status(500).send('Something went wrong');
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
