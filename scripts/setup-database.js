const { Client } = require('pg')
const fs = require('fs')
const path = require('path')

async function setupDatabase() {
  const client = new Client({
    connectionString: 'postgresql://postgres:e%UKa?Y@2MdT7DH@db.igzpodmmymbptmwebonh.supabase.co:5432/postgres',
    ssl: {
      rejectUnauthorized: false
    }
  })

  try {
    console.log('🔗 Connecting to Supabase PostgreSQL...')
    await client.connect()
    console.log('✅ Connected successfully!')

    // Read the schema file
    const schemaPath = path.join(__dirname, 'database-schema.sql')
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8')

    console.log('📄 Executing database schema...')
    
    // Split the SQL into individual statements
    const statements = schemaSql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))

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
  }
}

setupDatabase().then(success => {
  process.exit(success ? 0 : 1)
})