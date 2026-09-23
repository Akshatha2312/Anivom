const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Colour = require('../models/Colour');

const initialColours = [
  'Black',
  'White',
  'Red',
  'Blue',
  'Green',
  'Yellow',
  'Orange',
  'Pink',
  'Purple',
  'Maroon',
  'Navy',
  'Grey',
  'Brown',
  'Beige',
  'Cream',
  'Teal',
  'Mustard',
  'Olive',
  'Sky Blue',
  'Wine',
];

const seedColours = async () => {
  try {
    await connectDB();

    for (const name of initialColours) {
      const existing = await Colour.findOne({
        name: { $regex: new RegExp(`^${name}$`, 'i') },
      });

      if (!existing) {
        await Colour.create({ name, isActive: true });
        console.log(`Seeded colour: ${name}`);
      } else {
        console.log(`Colour already exists: ${name}`);
      }
    }

    console.log('Colour seeding completed successfully.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error(`Colour seeding failed: ${err.message}`);
    process.exit(1);
  }
};

seedColours();
