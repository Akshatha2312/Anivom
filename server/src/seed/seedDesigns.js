const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Design = require('../models/Design');

const initialDesigns = [
  {
    name: 'ANIVOM Atelier Seal',
    category: 'ANIVOM Originals',
    svg: `<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="42" stroke-dasharray="4 2"/><circle cx="50" cy="50" r="34"/><text x="50%" y="46%" dominant-baseline="middle" text-anchor="middle" font-size="14" font-weight="900" fill="currentColor" letter-spacing="2">ANIVOM</text><text x="50%" y="58%" dominant-baseline="middle" text-anchor="middle" font-size="7" font-weight="600" fill="currentColor" letter-spacing="1">STUDIO ATELIER</text></svg>`,
    isActive: true,
  },
  {
    name: 'Signature Compass',
    category: 'ANIVOM Originals',
    svg: `<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="40"/><path d="M50 10V90M10 50H90M50 25L57 43L75 50L57 57L50 75L43 57L25 50L43 43Z" fill="currentColor"/><circle cx="50" cy="50" r="6" fill="#FFFDF8"/></svg>`,
    isActive: true,
  },
  {
    name: 'Minimal Crest',
    category: 'Minimal',
    svg: `<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="3" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="40"/><path d="M35 50L45 60L65 40"/></svg>`,
    isActive: true,
  },
  {
    name: 'Geometric Sun',
    category: 'Minimal',
    svg: `<svg viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="24"/><path d="M50 10V20M50 80V90M10 50H20M80 50H90M22 22L29 29M71 71L78 78M22 78L29 71M71 29L78 22" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>`,
    isActive: true,
  },
  {
    name: 'Cyber Skull',
    category: 'Street',
    svg: `<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="3" xmlns="http://www.w3.org/2000/svg"><path d="M25 45C25 28 36 15 50 15C64 15 75 28 75 45C75 58 68 64 68 75H32C32 64 25 58 25 45Z"/><circle cx="40" cy="42" r="6" fill="currentColor"/><circle cx="60" cy="42" r="6" fill="currentColor"/><path d="M42 62H58M45 75V68M55 75V68"/></svg>`,
    isActive: true,
  },
  {
    name: 'Street Wave Emblem',
    category: 'Street',
    svg: `<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="3" xmlns="http://www.w3.org/2000/svg"><path d="M15 50Q35 30 50 50T85 50"/><path d="M15 62Q35 42 50 62T85 62"/><path d="M15 38Q35 18 50 38T85 38"/></svg>`,
    isActive: true,
  },
  {
    name: 'Urban Monogram',
    category: 'Typography',
    svg: `<svg viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><text x="50%" y="65%" dominant-baseline="middle" text-anchor="middle" font-size="52" font-weight="900" font-family="Arial, sans-serif">ANVM</text></svg>`,
    isActive: true,
  },
  {
    name: 'Bold Identity',
    category: 'Typography',
    svg: `<svg viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><text x="50%" y="60%" dominant-baseline="middle" text-anchor="middle" font-size="44" font-weight="800" font-family="Impact, sans-serif">STUDIO</text></svg>`,
    isActive: true,
  },
  {
    name: 'Aram Motif',
    category: 'Tamil',
    svg: `<svg viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><text x="50%" y="62%" dominant-baseline="middle" text-anchor="middle" font-size="54" font-weight="bold" font-family="serif">அ</text></svg>`,
    isActive: true,
  },
  {
    name: 'Kolam Geometry',
    category: 'Tamil',
    svg: `<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="3" xmlns="http://www.w3.org/2000/svg"><rect x="30" y="30" width="40" height="40" rx="8" transform="rotate(45 50 50)"/><circle cx="50" cy="50" r="6" fill="currentColor"/><circle cx="50" cy="20" r="4" fill="currentColor"/><circle cx="50" cy="80" r="4" fill="currentColor"/><circle cx="20" cy="50" r="4" fill="currentColor"/><circle cx="80" cy="50" r="4" fill="currentColor"/></svg>`,
    isActive: true,
  },
  {
    name: 'Fluid Eclipse',
    category: 'Abstract',
    svg: `<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="3" xmlns="http://www.w3.org/2000/svg"><path d="M20 50C20 33 33 20 50 20C67 20 80 33 80 50C80 67 67 80 50 80" stroke-dasharray="6 3"/><circle cx="50" cy="50" r="18" fill="currentColor"/></svg>`,
    isActive: true,
  },
  {
    name: 'Sacred Triad',
    category: 'Geometric',
    svg: `<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5" xmlns="http://www.w3.org/2000/svg"><polygon points="50,15 85,75 15,75"/><polygon points="50,85 85,25 15,25" stroke-dasharray="4 2"/><circle cx="50" cy="50" r="8" fill="currentColor"/></svg>`,
    isActive: true,
  },
];

const seedDesigns = async () => {
  try {
    await connectDB();

    for (const item of initialDesigns) {
      const existing = await Design.findOne({ name: item.name });
      if (!existing) {
        await Design.create(item);
        console.log(`Seeded design: ${item.name}`);
      } else {
        console.log(`Design already exists: ${item.name}`);
      }
    }

    console.log('Design library seeding completed successfully.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error(`Design seeding failed: ${err.message}`);
    process.exit(1);
  }
};

seedDesigns();
