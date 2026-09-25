const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const Product = require('../models/Product');
const Order = require('../models/Order');
const connectDB = require('../config/db');

const newProductTypes = [
  {
    name: 'Crew Neck',
    category: 'Crew Neck',
    description: 'Classic crew neck t-shirt engineered from 100% premium combed cotton for everyday comfort and durability.',
    basePrice: 999,
    garmentImages: {
      front: '',
      back: '',
      left: '',
      right: '',
    },
    images: [],
    colours: ['Black', 'White', 'Navy', 'Grey', 'Red', 'Blue', 'Olive'],
  },
  {
    name: 'V-Neck',
    category: 'V-Neck',
    description: 'Sleek V-neck t-shirt with a modern tailored cut, perfect for layering or standalone wear.',
    basePrice: 1099,
    garmentImages: {
      front: '',
      back: '',
      left: '',
      right: '',
    },
    images: [],
    colours: ['Black', 'White', 'Navy', 'Grey', 'Maroon', 'Beige'],
  },
  {
    name: 'Henley',
    category: 'Henley',
    description: 'Buttoned placket Henley t-shirt crafted with textured waffle-knit fabric for a refined casual aesthetic.',
    basePrice: 1399,
    garmentImages: {
      front: '',
      back: '',
      left: '',
      right: '',
    },
    images: [],
    colours: ['Black', 'White', 'Navy', 'Olive', 'Brown', 'Cream', 'Wine'],
  },
  {
    name: 'Polo',
    category: 'Polo',
    description: 'Structured polo t-shirt featuring a ribbed collar, mother-of-pearl buttons, and breathable cotton pique.',
    basePrice: 1599,
    garmentImages: {
      front: '',
      back: '',
      left: '',
      right: '',
    },
    images: [],
    colours: ['Black', 'White', 'Navy', 'Red', 'Blue', 'Teal', 'Yellow', 'Green'],
  },
  {
    name: 'Regular Fit',
    category: 'Regular Fit',
    description: 'Timeless regular fit t-shirt with a standard straight silhouette suitable for all body types.',
    basePrice: 899,
    garmentImages: {
      front: '',
      back: '',
      left: '',
      right: '',
    },
    images: [],
    colours: ['Black', 'White', 'Navy', 'Grey', 'Red', 'Blue', 'Pink', 'Purple', 'Orange'],
  },
  {
    name: 'Slim Fit',
    category: 'Slim Fit',
    description: 'Form-fitting slim t-shirt designed with elastane-infused cotton for flexible movement and sharp contour.',
    basePrice: 1199,
    garmentImages: {
      front: '',
      back: '',
      left: '',
      right: '',
    },
    images: [],
    colours: ['Black', 'White', 'Navy', 'Grey', 'Maroon'],
  },
  {
    name: 'Oversized',
    category: 'Oversized',
    description: 'Heavyweight drop-shoulder oversized t-shirt boasting a trendy boxy fit and street-lux aesthetic.',
    basePrice: 1499,
    garmentImages: {
      front: '',
      back: '',
      left: '',
      right: '',
    },
    images: [],
    colours: ['Black', 'White', 'Navy', 'Grey', 'Olive', 'Cream', 'Mustard', 'Sky Blue', 'Wine', 'Purple'],
  },
  {
    name: 'Cropped',
    category: 'Cropped',
    description: 'Modern cropped style t-shirt with a raw hem trim and relaxed casual upper body silhouette.',
    basePrice: 999,
    garmentImages: {
      front: '',
      back: '',
      left: '',
      right: '',
    },
    images: [],
    colours: ['Black', 'White', 'Pink', 'Yellow', 'Sky Blue', 'Cream'],
  },
];

const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

function generateVariants(colours) {
  const variants = [];
  for (const colour of colours) {
    for (const size of sizes) {
      variants.push({
        size,
        colour,
        stock: 25,
      });
    }
  }
  return variants;
}

async function seedProducts() {
  try {
    await connectDB();

    console.log('Connected to MongoDB.');

    // 1. Find all product IDs referenced in existing orders
    const orders = await Order.find({}, 'items.product');
    const orderedProductIds = new Set();
    orders.forEach((order) => {
      (order.items || []).forEach((item) => {
        if (item.product) {
          orderedProductIds.add(item.product.toString());
        }
      });
    });

    console.log(`Found ${orderedProductIds.size} unique product ID(s) referenced in historical orders.`);

    // 2. Identify active seed products to replace/deactivate
    const targetProductNames = newProductTypes.map((p) => p.name);

    // Deactivate or safely soft-delete old active products not in the new set
    const obsoleteProducts = await Product.find({
      name: { $nin: targetProductNames },
    });

    let softDeletedCount = 0;
    let hardDeletedCount = 0;

    for (const prod of obsoleteProducts) {
      if (orderedProductIds.has(prod._id.toString())) {
        // Soft delete / deactivate so historical orders referencing this product remain intact
        prod.isActive = false;
        await prod.save();
        softDeletedCount++;
      } else {
        // Hard delete non-ordered obsolete active product
        await Product.deleteOne({ _id: prod._id });
        hardDeletedCount++;
      }
    }

    console.log(`Obsolete products handled: ${softDeletedCount} soft-deleted/deactivated (referenced in historical orders), ${hardDeletedCount} hard-deleted.`);

    // 3. Upsert / seed the 8 new product types without creating duplicates
    let createdCount = 0;
    let updatedCount = 0;

    for (const pTypeDef of newProductTypes) {
      const variants = generateVariants(pTypeDef.colours);

      const productPayload = {
        name: pTypeDef.name,
        description: pTypeDef.description,
        category: pTypeDef.category,
        basePrice: pTypeDef.basePrice,
        garmentImages: pTypeDef.garmentImages,
        images: pTypeDef.images,
        variants,
        isActive: true,
      };

      const existing = await Product.findOne({ name: pTypeDef.name });

      if (existing) {
        await Product.updateOne({ _id: existing._id }, productPayload);
        updatedCount++;
      } else {
        await Product.create(productPayload);
        createdCount++;
      }
    }

    console.log(`Seed execution complete: ${createdCount} created, ${updatedCount} updated.`);

    await mongoose.disconnect();
    console.log('Database connection closed successfully.');
    if (require.main === module) {
      process.exit(0);
    }
  } catch (error) {
    console.error('Error during product seeding:', error);
    if (require.main === module) {
      process.exit(1);
    } else {
      throw error;
    }
  }
}

if (require.main === module) {
  seedProducts();
}

module.exports = { seedProducts, newProductTypes };
