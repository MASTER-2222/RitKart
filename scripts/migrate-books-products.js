const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://igzpodmmymbptmwebonh.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnenBvZG1teW1icHRtd2Vib25oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NDczNDIsImV4cCI6MjA3MDEyMzM0Mn0.eOy5F_0pE7ki3TXl49bW5c0K1TWGKf2_Vpn1IRKWQRc';

const supabase = createClient(supabaseUrl, supabaseKey);

// Books products from CategoryListing.tsx (b1-b36)
const booksProducts = [
  {
    id: 'b1',
    title: 'The Seven Husbands of Evelyn Hugo: A Novel by Taylor Jenkins Reid',
    price: 16.99,
    originalPrice: 17.99,
    rating: 4.6,
    reviewCount: 147832,
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    isDeliveryTomorrow: true,
    discount: 6,
    brand: 'Atria Books'
  },
  {
    id: 'b2',
    title: 'Atomic Habits by James Clear - An Easy & Proven Way to Build Good Habits',
    price: 18.00,
    originalPrice: 21.99,
    rating: 4.8,
    reviewCount: 89234,
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    isDeliveryTomorrow: true,
    discount: 18,
    brand: 'Avery'
  },
  {
    id: 'b3',
    title: 'Where the Crawdads Sing by Delia Owens - Bestselling Novel',
    price: 15.99,
    originalPrice: 19.99,
    rating: 4.7,
    reviewCount: 256789,
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 20,
    brand: 'G.P. Putnam\'s Sons'
  },
  {
    id: 'b4',
    title: 'The Psychology of Money by Morgan Housel - Financial Wisdom',
    price: 17.99,
    originalPrice: 22.00,
    rating: 4.6,
    reviewCount: 45678,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 18,
    brand: 'Harriman House'
  },
  {
    id: 'b5',
    title: 'Educated: A Memoir by Tara Westover - New York Times Bestseller',
    price: 16.99,
    originalPrice: 19.99,
    rating: 4.5,
    reviewCount: 134567,
    image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 15,
    brand: 'Random House'
  },
  {
    id: 'b6',
    title: 'The Silent Patient by Alex Michaelides - Psychological Thriller',
    price: 14.99,
    originalPrice: 17.99,
    rating: 4.4,
    reviewCount: 98765,
    image: 'https://images.unsplash.com/photo-1551029506-0807df4e2031?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 17,
    brand: 'Celadon Books'
  },
  {
    id: 'b7',
    title: 'Becoming by Michelle Obama - Intimate, Powerful, and Inspiring Memoir',
    price: 19.99,
    originalPrice: 24.99,
    rating: 4.8,
    reviewCount: 189234,
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 20,
    brand: 'Crown'
  },
  {
    id: 'b8',
    title: 'The Midnight Library by Matt Haig - Philosophy and Fiction Combined',
    price: 15.99,
    originalPrice: 18.99,
    rating: 4.3,
    reviewCount: 67890,
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 16,
    brand: 'Viking'
  },
  {
    id: 'b9',
    title: '1984 by George Orwell - Classic Dystopian Social Science Fiction',
    price: 13.99,
    originalPrice: 15.99,
    rating: 4.7,
    reviewCount: 345678,
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 13,
    brand: 'Signet Classics'
  },
  {
    id: 'b10',
    title: 'The Subtle Art of Not Giving a F*ck by Mark Manson - Life Philosophy',
    price: 16.99,
    originalPrice: 19.99,
    rating: 4.2,
    reviewCount: 123456,
    image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 15,
    brand: 'HarperOne'
  },
  {
    id: 'b11',
    title: 'Harry Potter and the Sorcerer\'s Stone by J.K. Rowling - Hardcover Edition',
    price: 24.99,
    originalPrice: 29.99,
    rating: 4.9,
    reviewCount: 567890,
    image: 'https://images.unsplash.com/photo-1621351183012-e51df1bdc82f?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 17,
    brand: 'Arthur A. Levine Books'
  },
  {
    id: 'b12',
    title: 'Sapiens: A Brief History of Humankind by Yuval Noah Harari',
    price: 21.99,
    originalPrice: 25.99,
    rating: 4.6,
    reviewCount: 234567,
    image: 'https://images.unsplash.com/photo-1526243741027-444d633d7365?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 15,
    brand: 'Harper'
  },
  {
    id: 'b13',
    title: 'The Thursday Murder Club by Richard Osman - Cozy Mystery Series',
    price: 16.99,
    originalPrice: 18.99,
    rating: 4.5,
    reviewCount: 87654,
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 11,
    brand: 'Viking'
  },
  {
    id: 'b14',
    title: 'Dune by Frank Herbert - Science Fiction Epic Classic',
    price: 17.99,
    originalPrice: 20.99,
    rating: 4.8,
    reviewCount: 234567,
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 14,
    brand: 'Ace'
  },
  {
    id: 'b15',
    title: 'The Power of Now by Eckhart Tolle - Spiritual Enlightenment Guide',
    price: 16.00,
    originalPrice: 18.00,
    rating: 4.6,
    reviewCount: 156789,
    image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 11,
    brand: 'New World Library'
  },
  {
    id: 'b16',
    title: 'The Hobbit by J.R.R. Tolkien - Fantasy Adventure Classic',
    price: 14.99,
    originalPrice: 17.99,
    rating: 4.9,
    reviewCount: 345678,
    image: 'https://images.unsplash.com/photo-1621351183012-e51df1bdc82f?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 17,
    brand: 'Houghton Mifflin'
  },
  {
    id: 'b17',
    title: 'Think and Grow Rich by Napoleon Hill - Success Philosophy',
    price: 12.99,
    originalPrice: 15.99,
    rating: 4.4,
    reviewCount: 98765,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 19,
    brand: 'TarcherPerigee'
  },
  {
    id: 'b18',
    title: 'The Alchemist by Paulo Coelho - Inspirational Fiction',
    price: 15.99,
    originalPrice: 17.99,
    rating: 4.7,
    reviewCount: 287654,
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 11,
    brand: 'HarperOne'
  },
  {
    id: 'b19',
    title: 'The Great Gatsby by F. Scott Fitzgerald - American Literature Classic',
    price: 13.99,
    originalPrice: 16.99,
    rating: 4.3,
    reviewCount: 456789,
    image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 18,
    brand: 'Scribner'
  },
  {
    id: 'b20',
    title: 'Rich Dad Poor Dad by Robert Kiyosaki - Financial Education',
    price: 17.99,
    originalPrice: 19.99,
    rating: 4.5,
    reviewCount: 198765,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 10,
    brand: 'Plata Publishing'
  },
  {
    id: 'b21',
    title: 'The Catcher in the Rye by J.D. Salinger - Coming of Age Classic',
    price: 14.99,
    originalPrice: 17.99,
    rating: 4.2,
    reviewCount: 234567,
    image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 17,
    brand: 'Little, Brown'
  },
  {
    id: 'b22',
    title: 'The 7 Habits of Highly Effective People by Stephen Covey',
    price: 18.99,
    originalPrice: 22.99,
    rating: 4.6,
    reviewCount: 167890,
    image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 17,
    brand: 'Free Press'
  },
  {
    id: 'b23',
    title: 'To Kill a Mockingbird by Harper Lee - Pulitzer Prize Winner',
    price: 15.99,
    originalPrice: 18.99,
    rating: 4.8,
    reviewCount: 389076,
    image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 16,
    brand: 'Harper Perennial'
  },
  {
    id: 'b24',
    title: 'The Four Agreements by Don Miguel Ruiz - Personal Freedom Guide',
    price: 13.99,
    originalPrice: 16.99,
    rating: 4.7,
    reviewCount: 145632,
    image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 18,
    brand: 'Amber-Allen Publishing'
  },
  {
    id: 'b25',
    title: 'Pride and Prejudice by Jane Austen - Romantic Literature Classic',
    price: 12.99,
    originalPrice: 15.99,
    rating: 4.6,
    reviewCount: 267890,
    image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 19,
    brand: 'Penguin Classics'
  },
  {
    id: 'b26',
    title: 'The Lean Startup by Eric Ries - Innovation and Entrepreneurship',
    price: 19.99,
    originalPrice: 23.99,
    rating: 4.4,
    reviewCount: 87654,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 17,
    brand: 'Crown Business'
  },
  {
    id: 'b27',
    title: 'The Girl with the Dragon Tattoo by Stieg Larsson - Thriller',
    price: 16.99,
    originalPrice: 19.99,
    rating: 4.5,
    reviewCount: 198765,
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 15,
    brand: 'Vintage Crime'
  },
  {
    id: 'b28',
    title: 'The Kite Runner by Khaled Hosseini - Historical Fiction',
    price: 17.99,
    originalPrice: 20.99,
    rating: 4.7,
    reviewCount: 234567,
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 14,
    brand: 'Riverhead Books'
  },
  {
    id: 'b29',
    title: 'Born to Run by Bruce Springsteen - Music Memoir',
    price: 18.99,
    originalPrice: 22.99,
    rating: 4.6,
    reviewCount: 123456,
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 17,
    brand: 'Simon & Schuster'
  },
  {
    id: 'b30',
    title: 'The Outsiders by S.E. Hinton - Young Adult Classic',
    price: 13.99,
    originalPrice: 16.99,
    rating: 4.3,
    reviewCount: 178965,
    image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 18,
    brand: 'Speak'
  },
  {
    id: 'b31',
    title: 'Mindset by Carol S. Dweck - Psychology of Success',
    price: 17.99,
    originalPrice: 21.99,
    rating: 4.5,
    reviewCount: 145632,
    image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 18,
    brand: 'Ballantine Books'
  },
  {
    id: 'b32',
    title: 'The Book Thief by Markus Zusak - Historical Fiction',
    price: 16.99,
    originalPrice: 19.99,
    rating: 4.8,
    reviewCount: 267890,
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 15,
    brand: 'Knopf Books'
  },
  {
    id: 'b33',
    title: 'Good to Great by Jim Collins - Business Strategy',
    price: 19.99,
    originalPrice: 24.99,
    rating: 4.4,
    reviewCount: 98765,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 20,
    brand: 'HarperBusiness'
  },
  {
    id: 'b34',
    title: 'Lord of the Flies by William Golding - Dystopian Classic',
    price: 14.99,
    originalPrice: 17.99,
    rating: 4.2,
    reviewCount: 345678,
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 17,
    brand: 'Faber & Faber'
  },
  {
    id: 'b35',
    title: 'The Fault in Our Stars by John Green - Young Adult Romance',
    price: 15.99,
    originalPrice: 18.99,
    rating: 4.6,
    reviewCount: 234567,
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 16,
    brand: 'Dutton'
  },
  {
    id: 'b36',
    title: 'The Intelligent Investor by Benjamin Graham - Investment Guide',
    price: 22.99,
    originalPrice: 26.99,
    rating: 4.5,
    reviewCount: 156789,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 15,
    brand: 'Harper Business'
  }
];

async function migrateBooksProducts() {
  console.log('📚 Starting Books Products Migration...');
  console.log(`📦 Found ${booksProducts.length} Books products to migrate`);

  // First, get the Books category ID
  const { data: categories, error: categoryError } = await supabase
    .from('categories')
    .select('id, name')
    .eq('slug', 'books')
    .single();

  if (categoryError) {
    console.error('❌ Error fetching Books category:', categoryError);
    return;
  }

  const booksCategoryId = categories.id;
  console.log(`✅ Found Books category ID: ${booksCategoryId}`);

  let successCount = 0;
  let failCount = 0;

  // Process each product
  for (let i = 0; i < booksProducts.length; i++) {
    const product = booksProducts[i];
    
    console.log(`\n📚 Migrating Product ${i + 1}/${booksProducts.length}: ${product.title}`);

    // Create slug from title
    const slug = product.title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim();

    // Prepare product data for database
    const productData = {
      name: product.title,
      slug: slug,
      description: `${product.title} - Published by ${product.brand}. Rating: ${product.rating}/5 stars with ${product.reviewCount} reviews. ${product.isPrime ? 'Prime eligible.' : ''} ${product.discount ? `Save ${product.discount}%!` : ''}`,
      short_description: `${product.brand} publication with ${product.rating}-star rating`,
      sku: `${product.brand.replace(/\s+/g, '').toUpperCase()}-${product.id.toUpperCase()}-001`,
      price: product.price,
      original_price: product.originalPrice,
      category_id: booksCategoryId,
      brand: product.brand,
      stock_quantity: Math.floor(Math.random() * 50) + 10, // Random stock 10-60
      low_stock_threshold: 5,
      is_active: true,
      is_featured: Math.random() > 0.7, // 30% chance of being featured
      rating_average: product.rating,
      rating_count: Math.floor(product.reviewCount / 10), // Approximation
      total_reviews: product.reviewCount,
      images: [product.image]
    };

    try {
      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select();

      if (error) {
        console.error(`❌ Error inserting ${product.title}:`, error.message);
        failCount++;
      } else {
        console.log(`✅ Successfully migrated: ${product.title}`);
        successCount++;
      }
    } catch (err) {
      console.error(`❌ Exception while inserting ${product.title}:`, err);
      failCount++;
    }

    // Add small delay to prevent overwhelming the database
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n🎉 Books Products Migration Complete!');
  console.log(`✅ Successfully migrated: ${successCount} products`);
  console.log(`❌ Failed to migrate: ${failCount} products`);
  console.log(`📊 Total processed: ${successCount + failCount} products`);

  // Verify migration by checking total Books products
  const { data: booksCount, error: countError } = await supabase
    .from('products')
    .select('id', { count: 'exact' })
    .eq('category_id', booksCategoryId);

  if (!countError) {
    console.log(`\n📈 Total Books products in database: ${booksCount.length || 0}`);
  }
}

// Run the migration
if (require.main === module) {
  migrateBooksProducts()
    .then(() => {
      console.log('\n✅ Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateBooksProducts };