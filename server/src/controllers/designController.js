const mongoose = require('mongoose');
const Design = require('../models/Design');

const getCustomerDesigns = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    const query = { isActive: true };

    if (category && typeof category === 'string' && category.trim() !== '' && category !== 'All') {
      query.category = category.trim();
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      const escapedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.name = { $regex: escapedSearch, $options: 'i' };
    }

    const designs = await Design.find(query).sort({ createdAt: -1 }).lean();

    res.status(200).json({
      status: 'success',
      results: designs.length,
      data: {
        designs,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getAdminDesigns = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    const query = {};

    if (category && typeof category === 'string' && category.trim() !== '' && category !== 'All') {
      query.category = category.trim();
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      const escapedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.name = { $regex: escapedSearch, $options: 'i' };
    }

    const designs = await Design.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: designs.length,
      data: {
        designs,
      },
    });
  } catch (error) {
    next(error);
  }
};

const createDesign = async (req, res, next) => {
  try {
    const { name, category, svg, url, publicId, isActive } = req.body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({
        status: 'fail',
        message: 'Design name is required',
      });
    }

    const hasSvg = svg && typeof svg === 'string' && svg.trim() !== '';
    const hasUrl = url && typeof url === 'string' && url.trim() !== '';

    if (!hasSvg && !hasUrl) {
      return res.status(400).json({
        status: 'fail',
        message: 'Design must have either SVG content or an image URL',
      });
    }

    const design = await Design.create({
      name: name.trim(),
      category: category && typeof category === 'string' && category.trim() !== '' ? category.trim() : 'General',
      svg: hasSvg ? svg.trim() : '',
      url: hasUrl ? url.trim() : '',
      publicId: publicId && typeof publicId === 'string' ? publicId.trim() : '',
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    res.status(201).json({
      status: 'success',
      message: 'Design created successfully',
      data: {
        design,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateDesign = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid design ID',
      });
    }

    const allowedFields = ['name', 'category', 'svg', 'url', 'publicId', 'isActive'];
    const updates = {};

    Object.keys(req.body).forEach((key) => {
      if (allowedFields.includes(key)) {
        if (key === 'name' || key === 'category' || key === 'svg' || key === 'url' || key === 'publicId') {
          if (typeof req.body[key] === 'string') {
            updates[key] = req.body[key].trim();
          }
        } else if (key === 'isActive') {
          updates[key] = Boolean(req.body[key]);
        }
      }
    });

    const design = await Design.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!design) {
      return res.status(404).json({
        status: 'fail',
        message: 'Design not found',
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Design updated successfully',
      data: {
        design,
      },
    });
  } catch (error) {
    next(error);
  }
};

const deleteDesign = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid design ID',
      });
    }

    const design = await Design.findByIdAndDelete(id);

    if (!design) {
      return res.status(404).json({
        status: 'fail',
        message: 'Design not found',
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Design deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCustomerDesigns,
  getAdminDesigns,
  createDesign,
  updateDesign,
  deleteDesign,
};
