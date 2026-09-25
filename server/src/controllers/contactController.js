const mongoose = require('mongoose');
const ContactMessage = require('../models/ContactMessage');

const createContactMessage = async (req, res, next) => {
  try {
    const { name, email, orderId, subject, message } = req.body;

    let finalName = name ? String(name).trim() : '';
    let finalEmail = email ? String(email).trim().toLowerCase() : '';
    let userId = null;

    if (req.user) {
      userId = req.user._id;
      finalName = req.user.name || finalName;
      finalEmail = req.user.email || finalEmail;
    }

    if (!finalName) {
      return res.status(400).json({ success: false, message: 'Full Name is required.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!finalEmail || !emailRegex.test(finalEmail)) {
      return res.status(400).json({ success: false, message: 'A valid email address is required.' });
    }

    const finalMessage = message ? String(message).trim() : '';
    if (!finalMessage) {
      return res.status(400).json({ success: false, message: 'Message content is required.' });
    }

    if (finalName.length > 100) {
      return res.status(400).json({ success: false, message: 'Name must not exceed 100 characters.' });
    }
    if (finalEmail.length > 150) {
      return res.status(400).json({ success: false, message: 'Email must not exceed 150 characters.' });
    }
    const finalSubject = subject ? String(subject).trim().substring(0, 200) : 'General Support Inquiry';
    const finalOrderId = orderId ? String(orderId).trim().substring(0, 100) : '';

    if (finalMessage.length > 3000) {
      return res.status(400).json({ success: false, message: 'Message must not exceed 3000 characters.' });
    }

    const contactMsg = await ContactMessage.create({
      user: userId,
      name: finalName,
      email: finalEmail,
      orderId: finalOrderId,
      subject: finalSubject,
      message: finalMessage,
      status: 'unread',
    });

    res.status(201).json({
      success: true,
      message: 'Your support inquiry has been received by ANIVOM Atelier Support.',
      data: {
        contactMessage: contactMsg,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getAllContactMessages = async (req, res, next) => {
  try {
    const { status, page, limit } = req.query;
    const query = {};

    if (status && ['unread', 'read', 'resolved'].includes(status)) {
      query.status = status;
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [messages, totalMessages, unreadCount] = await Promise.all([
      ContactMessage.find(query)
        .populate('user', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      ContactMessage.countDocuments(query),
      ContactMessage.countDocuments({ status: 'unread' }),
    ]);

    const totalPages = Math.ceil(totalMessages / limitNum) || (totalMessages === 0 ? 0 : 1);

    res.status(200).json({
      success: true,
      results: messages.length,
      unreadCount,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalMessages,
        limit: limitNum,
      },
      data: {
        messages,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateContactMessageStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: 'Support message not found.' });
    }

    const validStatuses = ['unread', 'read', 'resolved'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const message = await ContactMessage.findById(id);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Support message not found.' });
    }

    message.status = status;
    await message.save();

    const updatedMessage = await ContactMessage.findById(id).populate('user', 'name email role');

    res.status(200).json({
      success: true,
      message: `Message status updated to ${status}.`,
      data: {
        message: updatedMessage,
      },
    });
  } catch (error) {
    next(error);
  }
};

const deleteContactMessage = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: 'Support message not found.' });
    }

    const message = await ContactMessage.findById(id);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Support message not found.' });
    }

    await ContactMessage.deleteOne({ _id: id });

    res.status(200).json({
      success: true,
      message: 'Support message deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createContactMessage,
  getAllContactMessages,
  updateContactMessageStatus,
  deleteContactMessage,
};
