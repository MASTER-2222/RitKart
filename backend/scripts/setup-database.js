// RitZone Database Setup Script
// ==============================================
// Sets up database tables and initial data using environment variables

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const { environment } = require('../config/environment');

// ==============================================
// 🗄️ DATABASE CONNECTION
// ==============================================
const createDatabaseConnection = () => {
  return new Client({
    host: environment.database.host,
    port: environment.database.port,
    database: environment.database.database,
    user: environment.database.user,
    password: environment.database.password,
    ssl: environment.database.ssl
  });
};

// ==============================================
// 📋 SETUP DATABASE SCHEMA
// ==============================================
const setupDatabase = async () => {
  const client = createDatabaseConnection();

  try {
    console.log('🔧 Connecting to PostgreSQL database...');
    console.log(`📍 Host: ${environment.database.host}`);
    console.log(`📊 Database: ${environment.database.database}`);
    
    await client.connect();
    console.log('✅ Connected to database successfully');

    // Read the database schema file
    const schemaPath = path.join(__dirname, '../../database-schema.sql');
    
    if (!fs.existsSync(schemaPath)) {
      throw new Error('Database schema file not found at: ' + schemaPath);
    }

    console.log('📄 Reading database schema...');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('🚀 Executing database schema...');
    await client.query(schema);

    console.log('✅ Database schema executed successfully');
    console.log('🎉 Database setup completed!');

    // Test the setup by querying categories
    console.log('🧪 Testing database setup...');
    const result = await client.query('SELECT COUNT(*) FROM categories');
    const categoryCount = result.rows[0].count;
    
    console.log(`✅ Database test passed - ${categoryCount} categories found`);

    return {
      success: true,
      message: 'Database setup completed successfully',
      categoryCount: parseInt(categoryCount)
    };

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
};

// ==============================================
// 🧪 TEST DATABASE CONNECTION
// ==============================================
const testConnection = async () => {
  const client = createDatabaseConnection();

  try {
    console.log('🧪 Testing database connection...');
    await client.connect();
    
    // Test basic query
    const result = await client.query('SELECT NOW() as current_time');
    console.log('✅ Database connection test successful');
    console.log(`⏰ Database time: ${result.rows[0].current_time}`);

    return {
      success: true,
      message: 'Database connection test successful',
      serverTime: result.rows[0].current_time
    };

  } catch (error) {
    console.error('❌ Database connection test failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  } finally {
    await client.end();
  }
};

// ==============================================
// 📊 GET DATABASE INFO
// ==============================================
const getDatabaseInfo = async () => {
  const client = createDatabaseConnection();

  try {
    await client.connect();
    
    // Get table information
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    const tables = tablesResult.rows.map(row => row.table_name);

    // Get category count
    let categoryCount = 0;
    try {
      const categoryResult = await client.query('SELECT COUNT(*) FROM categories');
      categoryCount = parseInt(categoryResult.rows[0].count);
    } catch (e) {
      // Table might not exist yet
    }

    // Get product count
    let productCount = 0;
    try {
      const productResult = await client.query('SELECT COUNT(*) FROM products');
      productCount = parseInt(productResult.rows[0].count);
    } catch (e) {
      // Table might not exist yet
    }

    return {
      success: true,
      info: {
        host: environment.database.host,
        database: environment.database.database,
        tables: tables,
        tableCount: tables.length,
        categoryCount: categoryCount,
        productCount: productCount
      }
    };

  } catch (error) {
    console.error('❌ Failed to get database info:', error.message);
    return {
      success: false,
      error: error.message
    };
  } finally {
    await client.end();
  }
};

// ==============================================
// 🚀 MAIN EXECUTION
// ==============================================
const main = async () => {
  try {
    console.log('\n' + '='.repeat(60));
    console.log('🗄️  RitZone Database Setup');
    console.log('='.repeat(60));

    // Test connection first
    console.log('\n1. Testing database connection...');
    const connectionTest = await testConnection();
    
    if (!connectionTest.success) {
      console.error('❌ Cannot proceed - database connection failed');
      process.exit(1);
    }

    // Get current database info
    console.log('\n2. Getting database information...');
    const dbInfo = await getDatabaseInfo();
    
    if (dbInfo.success) {
      console.log(`📊 Tables found: ${dbInfo.info.tableCount}`);
      console.log(`🏷️  Categories: ${dbInfo.info.categoryCount}`);
      console.log(`📦 Products: ${dbInfo.info.productCount}`);
      
      if (dbInfo.info.tableCount > 0) {
        console.log('ℹ️  Database already has tables. Proceeding with setup...');
      }
    }

    // Setup database
    console.log('\n3. Setting up database schema...');
    const setupResult = await setupDatabase();
    
    if (setupResult.success) {
      console.log('\n' + '='.repeat(60));
      console.log('🎉 Database setup completed successfully!');
      console.log('='.repeat(60));
      console.log(`✅ ${setupResult.categoryCount} categories ready`);
      console.log('🚀 You can now start the backend server');
      console.log('='.repeat(60));
    } else {
      console.error('\n❌ Database setup failed');
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Script failed:', error.message);
    process.exit(1);
  }
};

// Run script if called directly
if (require.main === module) {
  main();
}

module.exports = {
  setupDatabase,
  testConnection,
  getDatabaseInfo
};