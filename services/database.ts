import { createClient } from '@/utils/supabase/client'

export class DatabaseService {
  private supabase = createClient()

  async executeSchema() {
    try {
      // Note: This is a simplified approach for development
      // In production, you would run the SQL script directly in Supabase SQL Editor
      console.log('Database schema should be executed in Supabase SQL Editor')
      console.log('Please copy the contents of database-schema.sql and run it in your Supabase project')
      
      // For now, let's test the connection
      const { data, error } = await this.supabase
        .from('categories')
        .select('*')
        .limit(1)

      if (error) {
        console.log('Database not yet set up. Please run the schema first.')
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (error) {
      console.error('Database connection error:', error)
      return { success: false, error: (error as Error).message }
    }
  }

  async testConnection() {
    try {
      const { data, error } = await this.supabase
        .from('categories')
        .select('count')
        .single()

      return { success: !error, error: error?.message }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  }
}

export const dbService = new DatabaseService()