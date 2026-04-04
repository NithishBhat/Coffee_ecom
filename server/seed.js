const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const mongoose = require('mongoose');
const Product = require('./models/Product');

const products = [
  {
    name: 'Coorg Monsoon Malabar',
    description:
      'A bold, full-bodied coffee from the misty hills of Coorg. Monsoon-processed to bring out earthy, spicy notes with low acidity. Perfect for espresso lovers.',
    price: 499,
    weight: '250g',
    roastType: 'dark',
    origin: 'Coorg, Karnataka',
    imageUrl: 'https://images.unsplash.com/photo-1621155346337-1d19476ba7d6?w=400&h=400&fit=crop',
    stockQuantity: 50,
    isActive: true,
  },
  {
    name: 'Chikmagalur Estate Blend',
    description:
      'Sourced from the birthplace of Indian coffee. This medium roast offers a smooth, balanced cup with chocolate and nutty undertones. Great for pour-over and French press.',
    price: 449,
    weight: '250g',
    roastType: 'medium',
    origin: 'Chikmagalur, Karnataka',
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefda?w=400&h=400&fit=crop',
    stockQuantity: 40,
    isActive: true,
  },
  {
    name: 'Wayanad Robusta Reserve',
    description:
      'A powerful robusta from Kerala\'s Western Ghats. Intense, chocolatey, and perfect for those who like their coffee strong. Makes an excellent South Indian filter kaapi.',
    price: 349,
    weight: '250g',
    roastType: 'dark',
    origin: 'Wayanad, Kerala',
    imageUrl: 'https://images.unsplash.com/photo-1611564494260-6f21b80af7ea?w=400&h=400&fit=crop',
    stockQuantity: 60,
    isActive: true,
  },
  {
    name: 'Araku Valley Arabica',
    description:
      'Award-winning arabica from the tribal farms of Araku Valley. Light roast that reveals floral, citrus, and berry notes. A specialty-grade single origin.',
    price: 599,
    weight: '250g',
    roastType: 'light',
    origin: 'Araku Valley, Andhra Pradesh',
    imageUrl: 'https://images.unsplash.com/photo-1695653422259-8a74ffe90401?w=400&h=400&fit=crop',
    stockQuantity: 30,
    isActive: true,
  },
  {
    name: 'Nilgiri Blue Mountain',
    description:
      'Grown at high altitude in the Nilgiri hills. This medium roast is delicate and aromatic with hints of citrus and a clean finish. Ideal for black coffee drinkers.',
    price: 549,
    weight: '250g',
    roastType: 'medium',
    origin: 'Nilgiris, Tamil Nadu',
    imageUrl: 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?w=400&h=400&fit=crop',
    stockQuantity: 35,
    isActive: true,
  },
  {
    name: 'Attikan Estate Single Origin',
    description:
      'A rare micro-lot from the Attikan Estate in Bababudangiris. Light roast preserving the natural sweetness with notes of honey, jasmine, and stone fruit.',
    price: 699,
    weight: '250g',
    roastType: 'light',
    origin: 'Bababudangiris, Karnataka',
    imageUrl: 'https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=400&h=400&fit=crop',
    stockQuantity: 20,
    isActive: true,
  },
  {
    name: 'Plantation AA Premium',
    description:
      'India\'s classic Plantation A grade, medium roasted to perfection. Rich, full-bodied with caramel sweetness and a mild spice finish. A versatile everyday coffee.',
    price: 399,
    weight: '500g',
    roastType: 'medium',
    origin: 'Hassan, Karnataka',
    imageUrl: 'https://images.unsplash.com/photo-1587049016823-69ef9d68f9a6?w=400&h=400&fit=crop',
    stockQuantity: 75,
    isActive: true,
  },
  {
    name: 'Mysore Nuggets Extra Bold',
    description:
      'The legendary MNEB — India\'s finest export-grade beans. Dark roasted to unlock deep cocoa, tobacco, and brown sugar notes. The ultimate Indian espresso bean.',
    price: 749,
    weight: '250g',
    roastType: 'dark',
    origin: 'Mysore, Karnataka',
    imageUrl: 'https://images.unsplash.com/photo-1610889556528-9a770e32642f?w=400&h=400&fit=crop',
    stockQuantity: 25,
    isActive: true,
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    await Product.deleteMany({});
    console.log('Cleared existing products');

    await Product.insertMany(products);
    console.log(`Seeded ${products.length} products`);

    await mongoose.disconnect();
    console.log('Done');
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  }
}

seed();
