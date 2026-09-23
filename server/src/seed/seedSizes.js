const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Size = require('../models/Size');

const initialSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

const seedSizes = async () => {
  try {
    await connectDB();

    for (const name of initialSizes) {
      const existing = await Size.findOne({
        name: { $regex: new RegExp(`^${name}$`, 'i') },
      });

      if (!existing) {
        await Size.create({ name, isActive: true });
        console.log(`Seeded size: ${name}`);
      } else {
        console.log(`Size already exists: ${name}`);
      }
    }

    console.log('Size seeding completed successfully.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error(`Size seeding failed: ${err.message}`);
    process.exit(1);
  }
};

seedSizes();
