// Database setup script using environment variables
const { Client } = require('pg')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') })

async function setupDatabaseWithEnv() {
  // Use environment variables from backend/.env
  const config = {
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    database: process.env.POSTGRES_DB,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    ssl: {
      rejectUnauthorized: false
    }
  }

  // Validate required environment variables
  const required = ['POSTGRES_HOST', 'POSTGRES_DB', 'POSTGRES_USER', 'POSTGRES_PASSWORD']
  const missing = required.filter(key => !process.env[key])
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing.join(', '))
    console.error('Please check your backend/.env file')
    return false
  }

  const client = new Client(config)

  try {
    console.log('🔗 Connecting to Supabase PostgreSQL using environment variables...')
    console.log(`📍 Host: ${config.host}:${config.port}`)
    console.log(`📊 Database: ${config.database}`)
    console.log(`👤 User: ${config.user}`)
    
    await client.connect()
    console.log('✅ Connected successfully!')

    // Read the schema file
    const schemaPath = path.join(__dirname, '../database-schema.sql')
    if (!fs.existsSync(schemaPath)) {
      throw new Error('Database schema file not found: ' + schemaPath)
    }
    
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8')
    console.log('📄 Schema file loaded, executing...')
    
    // Split the SQL into individual statements
    const statements = schemaSql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))

    console.log(`⚙️  Found ${statements.length} SQL statements to execute`)

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      if (statement.trim()) {
        try {
          console.log(`⚙️  Executing statement ${i + 1}/${statements.length}`)
          await client.query(statement)
        } catch (error) {
          console.log(`⚠️  Statement ${i + 1} warning:`, error.message)
          // Continue with other statements
        }
      }
    }

    console.log('✅ Database schema setup complete!')

    // Test the setup by querying categories
    const result = await client.query('SELECT COUNT(*) FROM categories')
    console.log(`📊 Categories table created with ${result.rows[0].count} records`)

    return true

  } catch (error) {
    console.error('❌ Database setup failed:', error.message)
    return false
  } finally {
    await client.end()
    console.log('🔌 Database connection closed')
  }
}

// Export for use in other modules
module.exports = { setupDatabaseWithEnv }

// Run if called directly
if (require.main === module) {
  setupDatabaseWithEnv().then(success => {
    process.exit(success ? 0 : 1)
  })
}