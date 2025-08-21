const productSchema = require('../../models/productSchema');
const logger = require('../../utils/logger');
const cloudinary = require('../../config/cloudinery');
const productServices = require('../../services/admin/productServices');
const mongoose = require('mongoose');

const products = async (req, res) => {
  try {
    const productList = await productServices.productsFetch();
    return res.render('products', { productList });
  } catch (error) {
    logger.error('page not found', +error);
    res.status(500).send('page not found');
  }
};

const addProductsPage = async (req, res) => {
  try {
    const categoryNames = await productServices.categoryNames();
    //console.log(categoryNames);
    return res.render('addProducts', { categoryNames });
  } catch (error) {
    logger.error('page not found', +error);
    res.status(500).send('page not found');
  }
};

const addProducts = async (req, res) => {
  try {
    const { productName, description, brand, category, variants } = req.body;

    if (!req.files || req.files.length === 0) {
      console.log('No files uploaded');
      return res.status(400).json({ error: 'No files uploaded' });
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

    return res.redirect('/admin/products/add');
  } catch (error) {
    console.error('Error while adding product:', error);
    res.status(500).send('Something went wrong');
  }
};

const unlistVariant = async (req, res) => {
  try {
    const variant_id = req.query.id;
    await productServices.variantUnlist(variant_id);
    return res.redirect('/admin/products?message=Variant Unlisted');
  } catch (error) {
    logger.error('page not found', +error);
    res.status(500).send('page not found');
  }
};

const listVariant = async (req, res) => {
  try {
    const variant_id = req.query.id;
    await productServices.variantList(variant_id);
    return res.redirect('/admin/products?message=Variant Listed');
  } catch (error) {
    logger.error('page not found', error);
    res.status(500).send('page not found');
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
    res.status(500).send('page not found');
  }
};

const variantEdit = async (req, res) => {
  try {
    const { productId, variantId } = req.query;

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

    if (variantImages.length > 0) {
      updateFields.variantImages = images;
    }

    await productServices.updateVarient(productId, variantId, updateFields);
    return res.redirect('/admin/products?message=Varient updated');
  } catch (error) {
    console.error('Error while adding product:', error);
    res.status(500).send('Something went wrong');
  }
};

const unlistProduct = async (req, res) => {
  try {
    const product_id = req.query.id;
    await productServices.productUnlist(product_id);
    return res.redirect('/admin/products?message=Product Unlisted');
  } catch (error) {
    logger.error('page not found', +error);
    res.status(500).send('page not found');
  }
};

const listProduct = async (req, res) => {
  try {
    const product_id = req.query.id;
    await productServices.productList(product_id);
    return res.redirect('/admin/products?message=Product Listed');
  } catch (error) {
    logger.error('page not found', error);
    res.status(500).send('page not found');
  }
};

const editProductPage = async (req, res) => {
  try {
    const product_Id = req.query.id;
    const categoryNames = await productServices.categoryNames();
    const product = await productServices.getProduct(product_Id);

    return res.render('editProduct', { product, categoryNames });
  } catch (error) {
    logger.error('page not found', error);
    res.status(500).send('page not found');
  }
};

const editProduct = async (req, res) => {
  try {
    const productId = req.query.id;
    console.log(productId);
    const { productName, description, brand, category, variants } = req.body;

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

    await productServices.productsEdit(
      productId,
      productName,
      description,
      brand,
      new mongoose.Types.ObjectId(category),
      finalVariants,
    );

    return res.redirect('/admin/products?message=Product successfully edited');
  } catch (error) {
    console.error('Error while editing product:', error);
    res.status(500).send('Something went wrong');
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
  editProductPage,
  editProduct,
};
