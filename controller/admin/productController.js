const productSchema = require('../../models/productSchema');
const logger = require('../../utils/logger');
const cloudinary = require('../../config/cloudinery');
const productServices = require('../../services/admin/productServices');
const mongoose = require('mongoose');
const fs = require('fs');

const products = async (req, res) => {
  try {
    const search = req.query.search || '';
    const page = req.query.page || 1;
    const limit = 5;

    const { productList, totalPages } = await productServices.productsFetch(
      search,
      page,
      limit,
    );
    const categoryNames = await productServices.categoryNames();
    return res.render('products', {
      productList,
      search,
      page,
      totalPages,
      categoryNames,
    });
  } catch (error) {
    logger.error('page not found', +error);
    return res.redirect('/admin/pageNotFound');
  }
};

const addProductsPage = async (req, res) => {
  try {
    const categoryNames = await productServices.categoryNames();
    //console.log(categoryNames);
    return res.render('addProducts', { categoryNames });
  } catch (error) {
    logger.error('page not found', +error);
    return res.redirect('/admin/pageNotFound');
  }
};

const addProducts = async (req, res) => {
  try {
    const { productName, description, brand, category, variants } = req.body;

    if (!req.files || req.files.length === 0) {
      console.log('No files uploaded');
    }

    const files = req.files;

    let variantLength = variants.length;
    let finalVariants = [];

    for (let index = 0; index < variantLength; index++) {
      let variant = variants[index];
      let variantImages = [];

      let imageFiles = files
        .filter((x) => {
          return x.fieldname == `images_variant_${index}[]`;
        })
        .map((x) => x.path);

      for (let img of imageFiles) {
        const output = await cloudinary.uploader.upload(img, {
          folder: 'tempus',
        });

        let image_url = output.secure_url;
        variantImages.push(image_url);
      }

      finalVariants.push({
        strapMaterial: variant.strapMaterial,
        strapColor: variant.strapColor,
        dialColor: variant.dialColor,
        caseSize: variant.caseSize,
        movementType: variant.movementType,
        caseMaterial: variant.caseMaterial,
        stockQuantity: Number(variant.stockQuantity),
        actualPrice: Number(variant.actualPrice),
        offerPrice: Number(variant.offerPrice),
        skuCode: variant.skuCode,
        variantImages,
      });
    }

    await productServices.productsAdd(
      productName,
      description,
      brand,
      new mongoose.Types.ObjectId(category),
      finalVariants,
    );
    req.flash('success_msg', 'Product added!');

    return res.redirect('/admin/products/add');
  } catch (error) {
    console.error('Error while adding product:', error);
    return res.redirect('/admin/pageNotFound');
  }
};

const unlistVariant = async (req, res) => {
  try {
    const variant_id = req.query.id;
    await productServices.variantUnlist(variant_id);

    return res.status(200).json({ message: 'Variant unlisted' });
  } catch (error) {
    logger.error('page not found', +error);
    return res.redirect('/admin/pageNotFound');
  }
};

const listVariant = async (req, res) => {
  try {
    const variant_id = req.query.id;
    await productServices.variantList(variant_id);
    return res.status(200).json({ message: 'Variant listed' });
  } catch (error) {
    logger.error('page not found', error);
    return res.redirect('/admin/pageNotFound');
  }
};

const variantEditPage = async (req, res) => {
  try {
    const { productId, variantId } = req.query;
    const { product, variant } = await productServices.editVariant(
      productId,
      variantId,
    );
    // console.log('product:',product);
    // console.log('variant:',variant);
    return res.render('variant_edit', { product, variant });
  } catch (error) {
    logger.error('page not found', error);
    return res.redirect('/admin/pageNotFound');
  }
};

const variantEdit = async (req, res) => {
  try {
    const { productId, variantId } = req.query;
    // console.log(req.body);
    // console.log(req.files);
    const {
      strapMaterial,
      strapColor,
      dialColor,
      caseSize,
      movementType,
      caseMaterial,
      stockQuantity,
      actualPrice,
      offerPrice,
    } = req.body;

    const updateFields = {
      strapMaterial,
      strapColor,
      dialColor,
      caseSize,
      movementType,
      caseMaterial,
      stockQuantity,
      actualPrice,
      offerPrice,
    };

    let images = [];
    if (req.files && req.files.length > 0) {
      for (let file of req.files) {
        const uploadResult = await cloudinary.uploader.upload(file.path, {
          folder: 'tempus',
        });
        images.push(uploadResult.secure_url);
      }
    }

    if (images.length > 0) {
      updateFields.variantImages = images;
    }

    await productServices.updateVariant(productId, variantId, updateFields);
    req.flash('success_msg', 'Varient updated!');

    return res.redirect('/admin/products');
  } catch (error) {
    console.error('Error while adding product:', error);
    return res.redirect('/admin/pageNotFound');
  }
};

const unlistProduct = async (req, res) => {
  try {
    const product_id = req.query.id;
    await productServices.productUnlist(product_id);
    req.flash('error_msg', 'Product Unlisted!');

    return res.redirect('/admin/products');
  } catch (error) {
    logger.error('page not found', +error);
    return res.redirect('/admin/pageNotFound');
  }
};

const listProduct = async (req, res) => {
  try {
    const product_id = req.query.id;
    await productServices.productList(product_id);
    req.flash('success_msg', 'Product Listed!');

    return res.redirect('/admin/products');
  } catch (error) {
    logger.error('page not found', error);
    return res.redirect('/admin/pageNotFound');
  }
};

const addVariantsPage = async (req, res) => {
  try {
    const product_Id = req.query.id;
    const categoryNames = await productServices.categoryNames();
    const product = await productServices.getProduct(product_Id);

    return res.render('addVariants', { product, categoryNames });
  } catch (error) {
    logger.error('page not found', error);
    return res.redirect('/admin/pageNotFound');
  }
};

const variantAdd = async (req, res) => {
  try {
    const productId = req.query.id;

    const variants = req.body.variants;
    // console.log(productId);
    // console.log(variants);
    // console.log(req.files);
    if (!req.files || req.files.length === 0) {
      console.log('No files uploaded');
    }

    const files = req.files;

    let variantLength = variants.length;
    let finalVariants = [];

    for (let index = 0; index < variantLength; index++) {
      let variant = variants[index];
      let variantImages = [];

      let imageFiles = files
        .filter((x) => {
          return x.fieldname == `images_variant_${index}[]`;
        })
        .map((x) => x.path);

      for (let img of imageFiles) {
        const output = await cloudinary.uploader.upload(img, {
          folder: 'tempus',
        });

        let image_url = output.secure_url;
        variantImages.push(image_url);
      }

      finalVariants.push({
        strapMaterial: variant.strapMaterial,
        strapColor: variant.strapColor,
        dialColor: variant.dialColor,
        caseSize: variant.caseSize,
        movementType: variant.movementType,
        caseMaterial: variant.caseMaterial,
        stockQuantity: Number(variant.stockQuantity),
        actualPrice: Number(variant.actualPrice),
        offerPrice: Number(variant.offerPrice),
        skuCode: variant.skuCode,
        variantImages,
      });
    }

    await productServices.addVariant(productId, finalVariants);
    req.flash('success_msg', 'Variant added!');

    return res.redirect('/admin/products');
  } catch (error) {
    console.error('Error while adding product:', error);
    return res.redirect('/admin/pageNotFound');
  }
};

const editProduct = async (req, res) => {
  try {
    console.log(req.body);
    const productId = req.query.id;
    const { productName, description, brand, category } = req.body;

    await productServices.productsEdit(
      productId,
      productName,
      description,
      brand,
      new mongoose.Types.ObjectId(category),
    );
    req.flash('success_msg', 'Product details successfully edited!');

    return res.redirect('/admin/products');
  } catch (error) {
    console.error('Error while editing product:', error);
    return res.redirect('/admin/pageNotFound');
  }
};

const removeImage = async (req, res) => {
  try {
    const { productId, variantId, index } = req.query;
    await productServices.imageRemove(productId, variantId, index);
    return res.status(200).json({ message: 'Image removed successfully' });
  } catch (error) {
    console.error('Cannot remove image:', error);
    return res.redirect('/admin/pageNotFound');
  }
};

module.exports = {
  products,
  addProductsPage,
  addProducts,
  unlistVariant,
  listVariant,
  variantEditPage,
  variantEdit,
  unlistProduct,
  listProduct,
  addVariantsPage,
  variantAdd,
  editProduct,
  removeImage,
};
