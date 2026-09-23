const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Category = require('../models/Category');

const initialCategories = ['Oversized', 'Minimal', 'Graphic', 'Regular Fit', 'Custom'];

const seedCategories = async () => {
  try {
    await connectDB();

    for (const name of initialCategories) {
      const existing = await Category.findOne({
        name: { $regex: new RegExp(`^${name}$`, 'i') },
      });

      if (!existing) {
        await Category.create({ name, isActive: true });
        console.log(`Seeded category: ${name}`);
      } else {
        console.log(`Category already exists: ${name}`);
      }
    }

    console.log('Category seeding completed successfully.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error(`Category seeding failed: ${err.message}`);
    process.exit(1);
  }
};

seedCategories();
