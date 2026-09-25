const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Referral = require('../models/Referral');

const registerCustomer = async (req, res, next) => {
  try {
    const { name, email, password, referralCode, ref } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Name, email, and password are required',
      });
    }

    if (typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({
        status: 'fail',
        message: 'Password must be at least 8 characters long',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        status: 'fail',
        message: 'Email is already registered',
      });
    }

    const cleanRefCode = (referralCode || ref || '').trim().toUpperCase();
    let referrerUser = null;
    if (cleanRefCode) {
      referrerUser = await User.findOne({ referralCode: cleanRefCode });
      if (!referrerUser) {
        return res.status(400).json({
          status: 'fail',
          message: 'Invalid or non-existent referral code',
        });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: 'customer',
    });

    if (referrerUser) {
      if (referrerUser._id.equals(user._id)) {
        await User.findByIdAndDelete(user._id);
        return res.status(400).json({
          status: 'fail',
          message: 'Self-referral is not allowed',
        });
      }
      try {
        await Referral.create({
          referrer: referrerUser._id,
          referred: user._id,
          referralCode: cleanRefCode,
          status: 'completed',
          rewardStatus: 'pending',
        });
      } catch (refErr) {
        // Safe fallback if referral record creation fails
      }
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      status: 'success',
      message: 'Customer registered successfully',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          referralCode: user.referralCode,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const loginCustomer = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Email and password are required',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid email or password',
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid email or password',
      });
    }

    if (!user.referralCode) {
      await user.save();
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      status: 'success',
      message: 'Customer logged in successfully',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          referralCode: user.referralCode,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const logoutCustomer = async (req, res, next) => {
  try {
    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('token', '', {
      httpOnly: true,
      expires: new Date(0),
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/',
    });

    res.status(200).json({
      status: 'success',
      message: 'Customer logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

const getCurrentUser = async (req, res, next) => {
  try {
    if (!req.user.referralCode) {
      await req.user.save();
    }
    res.status(200).json({
      status: 'success',
      data: {
        user: {
          _id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role,
          referralCode: req.user.referralCode,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const getAdminUsers = async (req, res, next) => {
  try {
    const { page, limit, role, search } = req.query;

    const query = {};

    if (role && typeof role === 'string' && role.trim() !== '') {
      query.role = role.trim();
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      const searchStr = search.trim();
      const escapedSearch = searchStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { name: { $regex: escapedSearch, $options: 'i' } },
        { email: { $regex: escapedSearch, $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const [users, totalUsers] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      User.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalUsers / limitNum) || (totalUsers === 0 ? 0 : 1);

    res.status(200).json({
      status: 'success',
      results: users.length,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalUsers,
        limit: limitNum,
      },
      data: {
        users,
      },
    });
  } catch (error) {
    next(error);
  }
};

const googleAuth = async (req, res, next) => {
  try {
    const { credential, referralCode, ref } = req.body;

    if (!credential || typeof credential !== 'string' || !credential.trim()) {
      return res.status(400).json({
        status: 'fail',
        message: 'Google credential is required',
      });
    }

    const { OAuth2Client } = require('google-auth-library');
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    let payload;
    try {
      const ticket = await client.verifyIdToken({
        idToken: credential.trim(),
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch (err) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid Google ID token',
      });
    }

    if (!payload || !payload.email || !payload.sub) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid Google account payload',
      });
    }

    if (!payload.email_verified) {
      return res.status(400).json({
        status: 'fail',
        message: 'Google account email is not verified',
      });
    }

    const googleSub = payload.sub;
    const googleEmail = payload.email.trim().toLowerCase();
    const googleName = (payload.name || googleEmail.split('@')[0]).trim();

    let user = await User.findOne({
      $or: [{ googleId: googleSub }, { email: googleEmail }],
    });

    if (user) {
      if (user.googleId && user.googleId !== googleSub) {
        return res.status(400).json({
          status: 'fail',
          message: 'Account is associated with a different Google account',
        });
      }

      if (!user.googleId) {
        const existingGoogleUser = await User.findOne({ googleId: googleSub });
        if (existingGoogleUser && !existingGoogleUser._id.equals(user._id)) {
          return res.status(400).json({
            status: 'fail',
            message: 'Google identity is associated with another account',
          });
        }
        user.googleId = googleSub;
        await user.save();
      }
    } else {
      const cleanRefCode = (referralCode || ref || '').trim().toUpperCase();
      let referrerUser = null;

      if (cleanRefCode) {
        referrerUser = await User.findOne({ referralCode: cleanRefCode });
        if (!referrerUser) {
          return res.status(400).json({
            status: 'fail',
            message: 'Invalid or non-existent referral code',
          });
        }
      }

      const crypto = require('crypto');
      const randomPassword = crypto.randomBytes(32).toString('hex');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(randomPassword, salt);

      user = await User.create({
        name: googleName,
        email: googleEmail,
        password: hashedPassword,
        googleId: googleSub,
        role: 'customer',
      });

      if (referrerUser) {
        if (referrerUser._id.equals(user._id)) {
          await User.findByIdAndDelete(user._id);
          return res.status(400).json({
            status: 'fail',
            message: 'Self-referral is not allowed',
          });
        }
        try {
          await Referral.create({
            referrer: referrerUser._id,
            referred: user._id,
            referralCode: cleanRefCode,
            status: 'completed',
            rewardStatus: 'pending',
          });
        } catch (refErr) {
          // safe fallback
        }
      }
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      status: 'success',
      message: 'Google authentication successful',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          referralCode: user.referralCode,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerCustomer,
  loginCustomer,
  logoutCustomer,
  getCurrentUser,
  getAdminUsers,
  googleAuth,
};

