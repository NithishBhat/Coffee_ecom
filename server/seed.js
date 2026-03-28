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
    imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400',
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
    imageUrl: 'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?w=400',
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
    imageUrl: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=400',
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
    imageUrl: 'https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=400',
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
    imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400',
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
    imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400',
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
    imageUrl: 'https://images.unsplash.com/photo-1498804103079-a6351b050096?w=400',
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
    imageUrl: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400',
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
