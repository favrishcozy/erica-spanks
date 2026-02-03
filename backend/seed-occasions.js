import mongoose from 'mongoose';
import Occasion from './src/models/Occasion.js';
import dotenv from 'dotenv';

dotenv.config();

const seedOccasions = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/erica-spanks');
    console.log('✓ Connected to MongoDB');

    // Clear existing occasions
    await Occasion.deleteMany({});
    console.log('✓ Cleared existing occasions');

    // Define occasions
    const occasions = [
      { name: 'Party Wear', slug: 'party', description: 'Perfect for celebrations and nights out' },
      { name: 'Date Night', slug: 'date-night', description: 'Romantic and memorable looks' },
      { name: 'Workwear', slug: 'work', description: 'Professional and polished pieces' },
      { name: 'Everyday', slug: 'casual', description: 'Comfortable everyday essentials' }
    ];

    // Insert occasions
    const created = await Occasion.insertMany(occasions);
    console.log(`✓ Created ${created.length} occasions`);

    // List all occasions
    const all = await Occasion.find();
    console.log('\nOccasions:');
    all.forEach(occ => {
      console.log(`  - ${occ.name} (${occ.slug}): ${occ._id}`);
    });

    console.log('\n✓ Occasion seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('✗ Error seeding occasions:', error);
    process.exit(1);
  }
};

seedOccasions();