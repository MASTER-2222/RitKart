import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

interface CategoryInsert {
  name: string
  slug: string
  description?: string
  image_url?: string
  sort_order?: number
  is_active?: boolean
}

interface ProductInsert {
  name: string
  slug: string
  description: string
  short_description?: string
  sku: string
  price: number
  original_price?: number
  category_id: string
  brand?: string
  stock_quantity: number
  images: string[]
  features: string[]
  specifications?: any
  rating_average?: number
  rating_count?: number
}

export async function createTablesManually() {
  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  
  try {
    console.log('📋 Manual table creation guide:')
    console.log('Since we cannot create tables with the anonymous key,')
    console.log('please follow these steps:')
    console.log('')
    console.log('1. Go to: https://igzpodmmymbptmwebonh.supabase.co')
    console.log('2. Navigate to SQL Editor')
    console.log('3. Copy and execute the database-schema.sql file')
    console.log('')
    console.log('🚀 Alternatively, execute these commands one by one:')
    console.log('')
    
    const commands = [
      '-- Enable UUID extension',
      `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`,
      '',
      '-- Categories table',
      `CREATE TABLE public.categories (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        description TEXT,
        image_url TEXT,
        parent_id UUID REFERENCES public.categories(id),
        sort_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true
      );`,
      '',
      '-- Products table',
      `CREATE TABLE public.products (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        description TEXT NOT NULL,
        short_description TEXT,
        sku TEXT NOT NULL UNIQUE,
        price DECIMAL(10,2) NOT NULL,
        original_price DECIMAL(10,2),
        category_id UUID REFERENCES public.categories(id) NOT NULL,
        brand TEXT,
        stock_quantity INTEGER DEFAULT 0 NOT NULL,
        low_stock_threshold INTEGER DEFAULT 10,
        is_active BOOLEAN DEFAULT true,
        is_featured BOOLEAN DEFAULT false,
        weight DECIMAL(8,2),
        dimensions JSONB,
        images TEXT[] DEFAULT '{}',
        features TEXT[] DEFAULT '{}',
        specifications JSONB DEFAULT '{}',
        rating_average DECIMAL(3,2) DEFAULT 0.0,
        rating_count INTEGER DEFAULT 0
      );`
    ]
    
    commands.forEach(cmd => console.log(cmd))
    
    return { success: false, message: 'Manual setup required' }
    
  } catch (error) {
    console.error('Error:', error)
    return { success: false, error: (error as Error).message }
  }
}

export async function insertSampleCategories() {
  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  
  const categories: CategoryInsert[] = [
    {
      name: 'Electronics',
      slug: 'electronics',
      description: 'Latest tech gadgets and electronics',
      image_url: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=300&h=200&fit=crop&crop=center',
      sort_order: 1
    },
    {
      name: 'Fashion',
      slug: 'fashion',
      description: 'Trending styles and fashion items',
      image_url: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=300&h=200&fit=crop&crop=center',
      sort_order: 2
    },
    {
      name: 'Books',
      slug: 'books',
      description: 'Bestsellers and educational books',
      image_url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=200&fit=crop&crop=center',
      sort_order: 3
    }
  ]

  try {
    const { data, error } = await supabase
      .from('categories')
      .insert(categories)
      .select()

    if (error) {
      console.error('Error inserting categories:', error)
      return { success: false, error: error.message }
    }

    console.log('✅ Sample categories inserted:', data)
    return { success: true, data }
    
  } catch (error) {
    console.error('Error:', error)
    return { success: false, error: (error as Error).message }
  }
}

export async function testDatabaseConnection() {
  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .limit(1)

    if (error) {
      return { success: false, message: 'Database schema not created', error: error.message }
    }

    return { success: true, message: 'Database connection successful!', data }
    
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}