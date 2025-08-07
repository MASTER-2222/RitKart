import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// Backend-specific Supabase service with environment variables
class SupabaseBackendService {
  private supabase: ReturnType<typeof createClient<Database>>
  
  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables')
    }
    
    this.supabase = createClient<Database>(supabaseUrl, supabaseKey)
  }

  // Categories operations
  async getCategories() {
    try {
      const { data, error } = await this.supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error fetching categories:', error)
      return { success: false, error: (error as Error).message }
    }
  }

  async createCategory(categoryData: Database['public']['Tables']['categories']['Insert']) {
    try {
      const { data, error } = await this.supabase
        .from('categories')
        .insert(categoryData)
        .select()

      if (error) throw error
      return { success: true, data: data[0] }
    } catch (error) {
      console.error('Error creating category:', error)
      return { success: false, error: (error as Error).message }
    }
  }

  // Products operations
  async getProducts(filters?: {
    category_id?: string
    is_featured?: boolean
    limit?: number
    offset?: number
  }) {
    try {
      let query = this.supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name,
            slug
          )
        `)
        .eq('is_active', true)

      if (filters?.category_id) {
        query = query.eq('category_id', filters.category_id)
      }

      if (filters?.is_featured !== undefined) {
        query = query.eq('is_featured', filters.is_featured)
      }

      if (filters?.limit) {
        query = query.limit(filters.limit)
      }

      if (filters?.offset) {
        query = query.range(filters.offset, (filters.offset + (filters.limit || 10)) - 1)
      }

      query = query.order('created_at', { ascending: false })

      const { data, error } = await query

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error fetching products:', error)
      return { success: false, error: (error as Error).message }
    }
  }

  async getProductById(id: string) {
    try {
      const { data, error } = await this.supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name,
            slug
          )
        `)
        .eq('id', id)
        .eq('is_active', true)
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error fetching product:', error)
      return { success: false, error: (error as Error).message }
    }
  }

  async createProduct(productData: Database['public']['Tables']['products']['Insert']) {
    try {
      const { data, error } = await this.supabase
        .from('products')
        .insert(productData)
        .select()

      if (error) throw error
      return { success: true, data: data[0] }
    } catch (error) {
      console.error('Error creating product:', error)
      return { success: false, error: (error as Error).message }
    }
  }

  async updateProduct(id: string, updates: Database['public']['Tables']['products']['Update']) {
    try {
      const { data, error } = await this.supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()

      if (error) throw error
      return { success: true, data: data[0] }
    } catch (error) {
      console.error('Error updating product:', error)
      return { success: false, error: (error as Error).message }
    }
  }

  // Cart operations
  async getUserCart(userId: string) {
    try {
      const { data, error } = await this.supabase
        .from('carts')
        .select(`
          *,
          cart_items (
            *,
            products (
              id,
              name,
              price,
              images
            )
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'active')
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error fetching cart:', error)
      return { success: false, error: (error as Error).message }
    }
  }

  async addToCart(userId: string, productId: string, quantity: number) {
    try {
      // First, get or create active cart
      let { data: cart } = await this.supabase
        .from('carts')
        .select('id')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single()

      if (!cart) {
        const { data: newCart, error: cartError } = await this.supabase
          .from('carts')
          .insert({
            user_id: userId,
            status: 'active',
            total_amount: 0,
            currency: 'USD'
          })
          .select()
          .single()

        if (cartError) throw cartError
        cart = newCart
      }

      // Get product details
      const { data: product, error: productError } = await this.supabase
        .from('products')
        .select('price')
        .eq('id', productId)
        .single()

      if (productError) throw productError

      // Check if item already exists in cart
      const { data: existingItem } = await this.supabase
        .from('cart_items')
        .select('*')
        .eq('cart_id', cart.id)
        .eq('product_id', productId)
        .single()

      if (existingItem) {
        // Update existing item
        const newQuantity = existingItem.quantity + quantity
        const { data, error } = await this.supabase
          .from('cart_items')
          .update({
            quantity: newQuantity,
            total_price: newQuantity * product.price
          })
          .eq('id', existingItem.id)
          .select()

        if (error) throw error
        return { success: true, data: data[0] }
      } else {
        // Add new item
        const { data, error } = await this.supabase
          .from('cart_items')
          .insert({
            cart_id: cart.id,
            product_id: productId,
            quantity: quantity,
            unit_price: product.price,
            total_price: quantity * product.price
          })
          .select()

        if (error) throw error
        return { success: true, data: data[0] }
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      return { success: false, error: (error as Error).message }
    }
  }

  // Database health check
  async healthCheck() {
    try {
      const { data, error } = await this.supabase
        .from('categories')
        .select('count')
        .limit(1)

      if (error) {
        return { 
          success: false, 
          message: 'Database schema not created', 
          error: error.message 
        }
      }

      return { 
        success: true, 
        message: 'Database connection successful',
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return { 
        success: false, 
        error: (error as Error).message 
      }
    }
  }
}

// Export singleton instance
export const supabaseBackend = new SupabaseBackendService()