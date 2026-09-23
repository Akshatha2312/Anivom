const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const User = require('../models/User');

const createOrUpdateAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL ? process.env.ADMIN_EMAIL.trim().toLowerCase() : 'admin@anivom.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const adminName = process.env.ADMIN_NAME ? process.env.ADMIN_NAME.trim() : 'ANIVOM Admin';

    if (!adminEmail || !adminPassword) {
      console.error('Error: ADMIN_EMAIL and ADMIN_PASSWORD environment variables or defaults are required.');
      process.exit(1);
    }

    await connectDB();

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    let user = await User.findOne({ email: adminEmail });

    if (user) {
      user.name = adminName || user.name;
      user.password = hashedPassword;
      user.role = 'admin';
      await user.save();
      console.log(`Admin account updated successfully for: ${adminEmail}`);
    } else {
      user = await User.create({
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
      });
      console.log(`Admin account created successfully for: ${adminEmail}`);
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error(`Failed to initialize admin account: ${error.message}`);
    process.exit(1);
  }
};

createOrUpdateAdmin();
