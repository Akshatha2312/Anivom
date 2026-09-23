const Banner = require('../models/Banner');

const isValidButtonLink = (link) => {
  if (!link || link.trim() === '') return true;
  const trimmed = link.trim();
  const lower = trimmed.toLowerCase();
  
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('file:') ||
    lower.includes('<script')
  ) {
    return false;
  }

  if (trimmed.startsWith('/')) {
    return true;
  }

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return true;
  }

  return false;
};

const validateBannerData = (data) => {
  const errors = [];
  
  if (!data.title || data.title.trim() === '') {
    errors.push('Banner title is required.');
  } else if (data.title.trim().length > 120) {
    errors.push('Title cannot exceed 120 characters.');
  }

  if (data.subtitle && data.subtitle.trim().length > 250) {
    errors.push('Subtitle cannot exceed 250 characters.');
  }

  if (data.buttonText && data.buttonText.trim().length > 50) {
    errors.push('Button text cannot exceed 50 characters.');
  }

  if (data.buttonLink && !isValidButtonLink(data.buttonLink)) {
    errors.push('Invalid or unsafe button link URL.');
  }

  if (data.sortOrder !== undefined && data.sortOrder !== null && isNaN(Number(data.sortOrder))) {
    errors.push('Sort order must be a valid number.');
  }

  if (data.startDate && data.endDate) {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end < start) {
      errors.push('End date cannot be earlier than start date.');
    }
  }

  if (data.image) {
    const imgStr = String(data.image).trim();
    if (imgStr && !imgStr.startsWith('http://') && !imgStr.startsWith('https://') && !imgStr.startsWith('/')) {
      errors.push('Image must be a valid URL.');
    }
  }

  return errors;
};

const getPublicBanners = async (req, res, next) => {
  try {
    const now = new Date();

    const banners = await Banner.find({
      isActive: true,
      $and: [
        { $or: [{ startDate: null }, { startDate: { $lte: now } }] },
        { $or: [{ endDate: null }, { endDate: { $gte: now } }] },
      ],
    })
      .sort({ sortOrder: 1, createdAt: 1 })
      .select('title subtitle image buttonText buttonLink sortOrder -_id id');

    const cleanBanners = banners.map((b) => ({
      id: b._id,
      title: b.title,
      subtitle: b.subtitle,
      image: b.image,
      buttonText: b.buttonText,
      buttonLink: b.buttonLink,
      sortOrder: b.sortOrder,
    }));

    res.status(200).json({
      status: 'success',
      results: cleanBanners.length,
      data: { banners: cleanBanners },
    });
  } catch (error) {
    next(error);
  }
};

const getAdminBanners = async (req, res, next) => {
  try {
    const banners = await Banner.find().sort({ sortOrder: 1, createdAt: 1 });
    res.status(200).json({
      status: 'success',
      results: banners.length,
      data: { banners },
    });
  } catch (error) {
    next(error);
  }
};

const createBanner = async (req, res, next) => {
  try {
    const errors = validateBannerData(req.body);
    if (errors.length > 0) {
      return res.status(400).json({
        status: 'fail',
        message: errors.join(' '),
      });
    }

    const { title, subtitle, image, imagePublicId, buttonText, buttonLink, sortOrder, isActive, startDate, endDate } = req.body;

    const banner = await Banner.create({
      title: title.trim(),
      subtitle: subtitle ? subtitle.trim() : '',
      image: image ? image.trim() : '',
      imagePublicId: imagePublicId ? imagePublicId.trim() : '',
      buttonText: buttonText ? buttonText.trim() : '',
      buttonLink: buttonLink ? buttonLink.trim() : '',
      sortOrder: sortOrder !== undefined ? Number(sortOrder) : 0,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
    });

    res.status(201).json({
      status: 'success',
      data: { banner },
    });
  } catch (error) {
    next(error);
  }
};

const updateBanner = async (req, res, next) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({
        status: 'fail',
        message: 'Banner not found',
      });
    }

    const updatedPayload = { ...banner.toObject(), ...req.body };
    const errors = validateBannerData(updatedPayload);
    if (errors.length > 0) {
      return res.status(400).json({
        status: 'fail',
        message: errors.join(' '),
      });
    }

    const fieldsToUpdate = ['title', 'subtitle', 'image', 'imagePublicId', 'buttonText', 'buttonLink', 'sortOrder', 'isActive', 'startDate', 'endDate'];
    fieldsToUpdate.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === 'startDate' || field === 'endDate') {
          banner[field] = req.body[field] ? new Date(req.body[field]) : null;
        } else if (field === 'sortOrder') {
          banner[field] = Number(req.body[field]);
        } else if (typeof req.body[field] === 'string') {
          banner[field] = req.body[field].trim();
        } else {
          banner[field] = req.body[field];
        }
      }
    });

    await banner.save();

    res.status(200).json({
      status: 'success',
      data: { banner },
    });
  } catch (error) {
    next(error);
  }
};

const deleteBanner = async (req, res, next) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) {
      return res.status(404).json({
        status: 'fail',
        message: 'Banner not found',
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Banner deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPublicBanners,
  getAdminBanners,
  createBanner,
  updateBanner,
  deleteBanner,
};
