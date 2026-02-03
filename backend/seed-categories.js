import mongoose from 'mongoose';
import Category from './src/models/Category.js';
import dotenv from 'dotenv';

dotenv.config();

const seedCategories = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/erica-spanks');
    console.log('✓ Connected to MongoDB');

    // Clear existing categories
    await Category.deleteMany({});
    console.log('✓ Cleared existing categories');

    // Define categories
    const categories = [
      { name: 'Dresses', slug: 'dresses', description: 'Beautiful dresses for all occasions', kind: 'category' },
      { name: 'Tops', slug: 'tops', description: 'Tops and shirts', kind: 'category' },
      { name: 'Bottoms', slug: 'bottoms', description: 'Bottoms and pants', kind: 'category' },
      { name: 'Two-Piece Sets', slug: 'two-piece-sets', description: 'Coordinated two-piece sets', kind: 'category' },
      { name: 'Loungewear', slug: 'loungewear', description: 'Comfortable loungewear', kind: 'category' },
      { name: 'Jackets & Coats', slug: 'outerwear', description: 'Stylish outerwear for any season', kind: 'category' },
      { name: 'New In', slug: 'new-in', description: 'Latest arrivals', kind: 'category' },
      { name: 'Essentials', slug: 'essentials', description: 'Essential basics', kind: 'category' },
      { name: 'Bodysuits', slug: 'bodysuits', description: 'Bodysuits', kind: 'category' },
      { name: 'Intimates', slug: 'intimates', description: 'Intimates collection', kind: 'category' },
      { name: 'Sets', slug: 'sets', description: 'Coordinated sets', kind: 'category' },
    ];

    // Insert categories
    const created = await Category.insertMany(categories);
    console.log(`✓ Created ${created.length} categories`);

    // List all categories
    const all = await Category.find();
    console.log('\nCategories:');
    all.forEach(cat => {
      console.log(`  - ${cat.name} (${cat.slug}): ${cat._id}`);
    });

    console.log('\n✓ Category seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('✗ Error seeding categories:', error);
    process.exit(1);
  }
};

seedCategories();
