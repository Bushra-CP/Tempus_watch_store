import logger from '../../utils/logger.js';
import cloudinary from '../../config/cloudinery.js';
import productServices from '../../services/admin/productServices.js';
import mongoose from 'mongoose';
import messages from '../../config/messages.js';
import statusCode from '../../config/statusCodes.js';

const products = async (req, res) => {
  try {
    req.session.productOfferEditUrl = '/admin/products';
    const search = req.query.search || '';
    const page = req.query.page || 1;
    const limit = 5;

    const { productList, totalPages } = await productServices.productsFetch(
      search,
      page,
      limit,
    );
    const categoryNames = await productServices.categoryNames();
    const productOffer = await productServices.findProductOffer();
    return res.render('products', {
      productList,
      search,
      page,
      totalPages,
      categoryNames,
      productOffer,
    });
  } catch (error) {
    logger.error('page not found', error);
    return res.redirect('/admin/pageNotFound');
  }
};

const addProductsPage = async (req, res) => {
  try {
    const categoryNames = await productServices.categoryNames();
    //console.log(categoryNames);
    return res.render('addProducts', { categoryNames });
  } catch (error) {
    logger.error('page not found', error);
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
        skuCode: variant.skuCode,
        variantImages,
      });
    }

    await productServices.productsAdd(
      productName,
      description,
      brand,
      new mongoose.Types.ObjectId(String(category)),
      finalVariants,
    );
    req.flash('success_msg', messages.PRODUCT_ADDED);

    return res.redirect('/admin/products/add');
  } catch (error) {
    console.error('Error while adding product:', error);
    return res.redirect('/admin/pageNotFound');
  }
};

const unlistVariant = async (req, res) => {
  try {
    const variant_id = new mongoose.Types.ObjectId(String(req.query.id));
    await productServices.variantUnlist(variant_id);
    return res.status(200).json({
      success: true,
      message: 'Variant unlisted successfully!',
    });
  } catch (error) {
    console.log('Error unlisting variant:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to unlist variant',
    });
  }
};

const listVariant = async (req, res) => {
  try {
    const variant_id = new mongoose.Types.ObjectId(String(req.query.id));
    await productServices.variantList(variant_id);
    return res.status(200).json({
      success: true,
      message: 'Variant listed successfully!',
    });
  } catch (error) {
    console.log('Error listing variant:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to list variant',
    });
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
    return res.json({
      success: true,
      message: messages.VARIANT_EDITED,
      redirect: '/admin/products',
    });
  } catch (error) {
    console.error('Error while adding product:', error);
    return res.redirect('/admin/pageNotFound');
  }
};

const unlistProduct = async (req, res) => {
  try {
    const product_id = new mongoose.Types.ObjectId(String(req.query.id));
    await productServices.productUnlist(product_id);
    return res.status(200).json({
      success: true,
      message: 'Product unlisted successfully!',
    });
  } catch (error) {
    console.log('Error unlisting product:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to unlist product',
    });
  }
};

const listProduct = async (req, res) => {
  try {
    const product_id = new mongoose.Types.ObjectId(String(req.query.id));
    await productServices.productList(product_id);
    return res.status(200).json({
      success: true,
      message: 'Product listed successfully!',
    });
  } catch (error) {
    console.log('Error listing product:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to list product',
    });
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
        skuCode: variant.skuCode,
        variantImages,
      });
    }

    await productServices.addVariant(productId, finalVariants);
    req.flash('success_msg', messages.VARIANT_ADDED);

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
      new mongoose.Types.ObjectId(String(category)),
    );
    req.flash('success_msg', messages.PRODUCT_EDITED);

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
    return res.status(200).json({ message: messages.IMAGE_REMOVED });
  } catch (error) {
    console.error('Cannot remove image:', error);
    return res.redirect('/admin/pageNotFound');
  }
};

const replaceImage = async (req, res) => {
  try {
    const { productId, variantId, index } = req.body;
    const imageFile = req.file;

    if (!imageFile) return res.status(400).json({ error: 'No image uploaded' });

    const result = await cloudinary.uploader.upload(imageFile.path, {
      folder: 'tempus',
    });

    let image_url = result.secure_url;

    await productServices.replaceImage(productId, variantId, index, image_url);

    res.json({ message: 'Image replaced successfully ✅' });
  } catch (error) {
    console.error('Cannot replace image:', error);
    return res.redirect('/admin/pageNotFound');
  }
};

export default {
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
  replaceImage,
};
