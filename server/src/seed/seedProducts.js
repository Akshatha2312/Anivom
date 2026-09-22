const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });
const Product = require('../models/Product');

const developmentProducts = [
  {
    name: 'ANIVOM Monogram Heavyweight Oversized Tee',
    description: 'Luxurious 280 GSM combed cotton oversized graphic t-shirt featuring subtle front chest monogram embroidery and back high-density rubber print.',
    category: 'Oversized',
    basePrice: 1499,
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop'
    ],
    variants: [
      { size: 'XS', colour: 'Black', stock: 15 },
      { size: 'S', colour: 'Black', stock: 20 },
      { size: 'M', colour: 'Black', stock: 25 },
      { size: 'L', colour: 'Black', stock: 20 },
      { size: 'XL', colour: 'Black', stock: 15 },
      { size: 'XXL', colour: 'Black', stock: 10 },
      { size: 'M', colour: 'White', stock: 18 },
      { size: 'L', colour: 'White', stock: 12 }
    ],
    isActive: true
  },
  {
    name: 'ANIVOM Minimalist Boxy Drop-Shoulder Tee',
    description: 'Clean architectural lines, relaxed drop-shoulder cut, crafted from organic luxury cotton with a velvety touch finish.',
    category: 'Minimal',
    basePrice: 1299,
    images: [
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=800&auto=format&fit=crop'
    ],
    variants: [
      { size: 'S', colour: 'Cream', stock: 14 },
      { size: 'M', colour: 'Cream', stock: 22 },
      { size: 'L', colour: 'Cream', stock: 18 },
      { size: 'XL', colour: 'Cream', stock: 12 },
      { size: 'M', colour: 'Grey', stock: 15 },
      { size: 'L', colour: 'Grey', stock: 10 }
    ],
    isActive: true
  },
  {
    name: 'ANIVOM Heritage Crest Graphic T-Shirt',
    description: 'Vintage wash graphic tee with handcrafted heraldry crest screenprint and distressed rib neckline.',
    category: 'Graphic',
    basePrice: 1699,
    images: [
      'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&auto=format&fit=crop'
    ],
    variants: [
      { size: 'XS', colour: 'Navy', stock: 10 },
      { size: 'S', colour: 'Navy', stock: 15 },
      { size: 'M', colour: 'Navy', stock: 20 },
      { size: 'L', colour: 'Navy', stock: 15 },
      { size: 'XL', colour: 'Navy', stock: 8 },
      { size: 'M', colour: 'Maroon', stock: 12 }
    ],
    isActive: true
  },
  {
    name: 'ANIVOM Essential Crewneck Regular Fit Tee',
    description: 'The definitive daily crewneck t-shirt. Tailored regular fit engineered from 220 GSM ring-spun Egyptian cotton.',
    category: 'Regular Fit',
    basePrice: 999,
    images: [
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1618354691438-25bc04584c23?w=800&auto=format&fit=crop'
    ],
    variants: [
      { size: 'XS', colour: 'White', stock: 25 },
      { size: 'S', colour: 'White', stock: 30 },
      { size: 'M', colour: 'White', stock: 40 },
      { size: 'L', colour: 'White', stock: 35 },
      { size: 'XL', colour: 'White', stock: 20 },
      { size: 'XXL', colour: 'White', stock: 15 },
      { size: 'M', colour: 'Black', stock: 35 },
      { size: 'L', colour: 'Black', stock: 30 }
    ],
    isActive: true
  },
  {
    name: 'ANIVOM Studio Blank Custom Canvas Tee',
    description: 'Premium blank canvas garment optimized for Studio vector customization, high-res text printing, and uploaded graphics.',
    category: 'Custom',
    basePrice: 1199,
    images: [
      'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop'
    ],
    variants: [
      { size: 'XS', colour: 'Black', stock: 20 },
      { size: 'S', colour: 'Black', stock: 25 },
      { size: 'M', colour: 'Black', stock: 30 },
      { size: 'L', colour: 'Black', stock: 25 },
      { size: 'XL', colour: 'Black', stock: 20 },
      { size: 'XXL', colour: 'Black', stock: 15 },
      { size: 'S', colour: 'Red', stock: 12 },
      { size: 'M', colour: 'Red', stock: 18 }
    ],
    isActive: true
  },
  {
    name: 'ANIVOM Earth Tone Oversized Tee',
    description: 'Earth-toned garment dyed oversized t-shirt in warm olive, featuring reinforced double-needle collar stitching.',
    category: 'Oversized',
    basePrice: 1599,
    images: [
      'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop'
    ],
    variants: [
      { size: 'S', colour: 'Olive', stock: 15 },
      { size: 'M', colour: 'Olive', stock: 20 },
      { size: 'L', colour: 'Olive', stock: 18 },
      { size: 'XL', colour: 'Olive', stock: 10 },
      { size: 'XXL', colour: 'Olive', stock: 8 }
    ],
    isActive: true
  },
  {
    name: 'ANIVOM Maroon Signature Emblem Tee',
    description: 'Deep maroon regular fit tee with gold thread signature logo emblem on sleeve hem.',
    category: 'Regular Fit',
    basePrice: 1399,
    images: [
      'https://images.unsplash.com/photo-1618354691438-25bc04584c23?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&auto=format&fit=crop'
    ],
    variants: [
      { size: 'S', colour: 'Maroon', stock: 12 },
      { size: 'M', colour: 'Maroon', stock: 22 },
      { size: 'L', colour: 'Maroon', stock: 16 },
      { size: 'XL', colour: 'Maroon', stock: 10 }
    ],
    isActive: true
  }
];

async function seed() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb+srv://akshathaprabakaran_db_user:7kdotT5hRIDgin3N@cluster0.uyvzevq.mongodb.net';
    await mongoose.connect(mongoUri);
    
    let createdCount = 0;
    for (const pData of developmentProducts) {
      const existing = await Product.findOne({ name: pData.name });
      if (!existing) {
        await Product.create(pData);
        createdCount++;
      }
    }
    
    console.log(`Development seed completed. ${createdCount} new products created (${developmentProducts.length - createdCount} already existed).`);
    await mongoose.disconnect();
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
