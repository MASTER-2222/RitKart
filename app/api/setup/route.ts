import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET() {
  try {
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
        error: error.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Database connection successful!',
      categoriesCount: categories?.length || 0
    })

  } catch (error) {
    console.error('Database setup error:', error)
    return NextResponse.json({
      success: false,
      message: 'Database connection failed',
      error: (error as Error).message
    }, { status: 500 })
  }
}

export async function POST() {
  try {
    // This endpoint could be used to initialize the database
    // For now, we'll just return instructions
    return NextResponse.json({
      message: 'To set up the database:',
      steps: [
        '1. Go to your Supabase project: https://igzpodmmymbptmwebonh.supabase.co',
        '2. Navigate to SQL Editor',
        '3. Copy and paste the contents of database-schema.sql',
        '4. Execute the script',
        '5. Test the connection using GET /api/setup'
      ]
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 500 })
  }
}