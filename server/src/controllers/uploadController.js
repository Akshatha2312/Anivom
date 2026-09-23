const cloudinary = require('../config/cloudinary');

const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'fail',
        message: 'No image file provided for upload.',
      });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'anivom/customizations',
        resource_type: 'image',
      },
      (error, result) => {
        if (error) {
          return res.status(500).json({
            status: 'error',
            message: 'Cloudinary image upload failed.',
          });
        }

        res.status(200).json({
          status: 'success',
          message: 'Image uploaded successfully to Cloudinary.',
          data: {
            url: result.secure_url,
            publicId: result.public_id,
            format: result.format,
            width: result.width,
            height: result.height,
            bytes: result.bytes,
          },
        });
      }
    );

    uploadStream.end(req.file.buffer);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadImage,
};
