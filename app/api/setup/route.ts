import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { databaseConfig, validateEnvironmentVariables } from '@/services/database-config'

export async function GET() {
  try {
    // Validate environment variables first
    validateEnvironmentVariables()
    
    const supabase = createClient()
    
    // Test database connection by trying to fetch categories
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .limit(1)

    if (error) {
      return NextResponse.json({
        success: false,
        message: 'Database schema not yet created. Please run the database-schema.sql in Supabase SQL Editor.',
        error: error.message,
        config: {
          supabaseUrl: databaseConfig.supabase.url,
          environment: databaseConfig.environment.nodeEnv,
          timestamp: new Date().toISOString()
        }
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Database connection successful!',
      categoriesCount: categories?.length || 0,
      config: {
        supabaseUrl: databaseConfig.supabase.url,
        environment: databaseConfig.environment.nodeEnv,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Database setup error:', error)
    return NextResponse.json({
      success: false,
      message: 'Database connection failed',
      error: (error as Error).message,
      config: {
        environment: process.env.NODE_ENV || 'unknown',
        timestamp: new Date().toISOString()
      }
    }, { status: 500 })
  }
}

export async function POST() {
  try {
    validateEnvironmentVariables()
    
    // This endpoint provides setup instructions
    return NextResponse.json({
      message: 'To set up the database:',
      steps: [
        `1. Go to your Supabase project: ${databaseConfig.supabase.url}`,
        '2. Navigate to SQL Editor',
        '3. Copy and paste the contents of database-schema.sql',
        '4. Execute the script',
        '5. Test the connection using GET /api/setup'
      ],
      config: {
        supabaseUrl: databaseConfig.supabase.url,
        environment: databaseConfig.environment.nodeEnv,
        debug: databaseConfig.environment.debug
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 500 })
  }
}