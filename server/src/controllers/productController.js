const mongoose = require('mongoose');
const Product = require('../models/Product');

const isValidPrice = (val) => {
  if (val === undefined || val === null || val === '') return true;
  if (typeof val !== 'string' && typeof val !== 'number') return false;
  const str = String(val).trim();
  return /^\d+(\.\d+)?$/.test(str);
};

const getProducts = async (req, res, next) => {
  try {
    const {
      search,
      category,
      size,
      colour,
      minPrice,
      maxPrice,
      page,
      limit,
      sort,
    } = req.query;

    if (minPrice !== undefined && !isValidPrice(minPrice)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid minPrice value',
      });
    }

    if (maxPrice !== undefined && !isValidPrice(maxPrice)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid maxPrice value',
      });
    }

    const hasMin = minPrice !== undefined && minPrice !== '';
    const hasMax = maxPrice !== undefined && maxPrice !== '';

    if (hasMin && hasMax) {
      if (Number(minPrice) > Number(maxPrice)) {
        return res.status(400).json({
          status: 'fail',
          message: 'minPrice cannot be greater than maxPrice',
        });
      }
    }

    const query = { isActive: true };

    if (search && typeof search === 'string' && search.trim() !== '') {
      const escapedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.name = { $regex: escapedSearch, $options: 'i' };
    }

    if (category && typeof category === 'string' && category.trim() !== '') {
      query.category = category.trim();
    }

    const hasSize = size && typeof size === 'string' && size.trim() !== '';
    const hasColour = colour && typeof colour === 'string' && colour.trim() !== '';

    if (hasSize && hasColour) {
      query.variants = {
        $elemMatch: {
          size: size.trim(),
          colour: colour.trim(),
        },
      };
    } else if (hasSize) {
      query['variants.size'] = size.trim();
    } else if (hasColour) {
      query['variants.colour'] = colour.trim();
    }

    if (hasMin) {
      query.basePrice = { ...query.basePrice, $gte: Number(minPrice) };
    }

    if (hasMax) {
      query.basePrice = { ...query.basePrice, $lte: Number(maxPrice) };
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price-asc') {
      sortOption = { basePrice: 1 };
    } else if (sort === 'price-desc') {
      sortOption = { basePrice: -1 };
    } else if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    } else if (sort === 'newest') {
      sortOption = { createdAt: -1 };
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    const [products, totalProducts] = await Promise.all([
      Product.find(query).sort(sortOption).skip(skip).limit(limitNum),
      Product.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalProducts / limitNum) || (totalProducts === 0 ? 0 : 1);

    res.status(200).json({
      status: 'success',
      results: products.length,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalProducts,
        limit: limitNum,
      },
      data: {
        products,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        status: 'fail',
        message: 'Product not found',
      });
    }

    const product = await Product.findOne({ _id: id, isActive: true });

    if (!product) {
      return res.status(404).json({
        status: 'fail',
        message: 'Product not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        product,
      },
    });
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const { name, description, category, basePrice, images, variants, isActive } = req.body;

    const product = await Product.create({
      name,
      description,
      category,
      basePrice,
      images,
      variants,
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json({
      status: 'success',
      message: 'Product created successfully',
      data: {
        product,
      },
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        status: 'fail',
        message: error.message,
      });
    }
    next(error);
  }
};

const getAdminProducts = async (req, res, next) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: products.length,
      data: {
        products,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getAdminProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        status: 'fail',
        message: 'Product not found',
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        status: 'fail',
        message: 'Product not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        product,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        status: 'fail',
        message: 'Product not found',
      });
    }

    const allowedUpdates = [
      'name',
      'description',
      'category',
      'basePrice',
      'images',
      'variants',
      'isActive',
    ];

    const updates = {};
    Object.keys(req.body).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const product = await Product.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({
        status: 'fail',
        message: 'Product not found',
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Product updated successfully',
      data: {
        product,
      },
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        status: 'fail',
        message: error.message,
      });
    }
    next(error);
  }
};

const updateProductStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        status: 'fail',
        message: 'isActive must be a boolean (true or false)',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        status: 'fail',
        message: 'Product not found',
      });
    }

    const product = await Product.findByIdAndUpdate(
      id,
      { isActive },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        status: 'fail',
        message: 'Product not found',
      });
    }

    res.status(200).json({
      status: 'success',
      message: `Product ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        product,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateVariantStock = async (req, res, next) => {
  try {
    const { id, variantId } = req.params;
    const { stock } = req.body;

    if (
      stock === undefined ||
      stock === null ||
      typeof stock !== 'number' ||
      !Number.isInteger(stock) ||
      !Number.isFinite(stock) ||
      stock < 0
    ) {
      return res.status(400).json({
        status: 'fail',
        message: 'Stock must be a non-negative integer',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        status: 'fail',
        message: 'Product not found',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(variantId)) {
      return res.status(404).json({
        status: 'fail',
        message: 'Variant not found',
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        status: 'fail',
        message: 'Product not found',
      });
    }

    const variant = product.variants.id(variantId);

    if (!variant) {
      return res.status(404).json({
        status: 'fail',
        message: 'Variant not found',
      });
    }

    variant.stock = stock;
    await product.save();

    res.status(200).json({
      status: 'success',
      message: 'Variant stock updated successfully',
      data: {
        product,
      },
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        status: 'fail',
        message: error.message,
      });
    }
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  getAdminProducts,
  getAdminProductById,
  updateProduct,
  updateProductStatus,
  updateVariantStock,
};
