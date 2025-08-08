export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          email: string
          full_name: string | null
          avatar_url: string | null
          phone: string | null
          role: 'customer' | 'admin'
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          role?: 'customer' | 'admin'
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          role?: 'customer' | 'admin'
        }
      }
      categories: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          slug: string
          description: string | null
          image_url: string | null
          parent_id: string | null
          sort_order: number
          is_active: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          slug: string
          description?: string | null
          image_url?: string | null
          parent_id?: string | null
          sort_order?: number
          is_active?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          slug?: string
          description?: string | null
          image_url?: string | null
          parent_id?: string | null
          sort_order?: number
          is_active?: boolean
        }
      }
      products: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          slug: string
          description: string
          short_description: string | null
          sku: string
          price: number
          original_price: number | null
          category_id: string
          brand: string | null
          stock_quantity: number
          low_stock_threshold: number
          is_active: boolean
          is_featured: boolean
          weight: number | null
          dimensions: Json | null
          images: string[]
          features: string[]
          specifications: Json | null
          meta_title: string | null
          meta_description: string | null
          rating_average: number
          rating_count: number
          total_reviews: number
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          slug: string
          description: string
          short_description?: string | null
          sku: string
          price: number
          original_price?: number | null
          category_id: string
          brand?: string | null
          stock_quantity: number
          low_stock_threshold?: number
          is_active?: boolean
          is_featured?: boolean
          weight?: number | null
          dimensions?: Json | null
          images: string[]
          features: string[]
          specifications?: Json | null
          meta_title?: string | null
          meta_description?: string | null
          rating_average?: number
          rating_count?: number
          total_reviews?: number
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          slug?: string
          description?: string
          short_description?: string | null
          sku?: string
          price?: number
          original_price?: number | null
          category_id?: string
          brand?: string | null
          stock_quantity?: number
          low_stock_threshold?: number
          is_active?: boolean
          is_featured?: boolean
          weight?: number | null
          dimensions?: Json | null
          images?: string[]
          features?: string[]
          specifications?: Json | null
          meta_title?: string | null
          meta_description?: string | null
          rating_average?: number
          rating_count?: number
          total_reviews?: number
        }
      }
      carts: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string | null
          session_id: string | null
          status: 'active' | 'abandoned' | 'converted'
          total_amount: number
          currency: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string | null
          session_id?: string | null
          status?: 'active' | 'abandoned' | 'converted'
          total_amount?: number
          currency?: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string | null
          session_id?: string | null
          status?: 'active' | 'abandoned' | 'converted'
          total_amount?: number
          currency?: string
        }
      }
      cart_items: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          cart_id: string
          product_id: string
          quantity: number
          unit_price: number
          total_price: number
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          cart_id: string
          product_id: string
          quantity: number
          unit_price: number
          total_price: number
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          cart_id?: string
          product_id?: string
          quantity?: number
          unit_price?: number
          total_price?: number
        }
      }
      orders: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          order_number: string
          user_id: string
          status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          total_amount: number
          subtotal_amount: number
          tax_amount: number
          shipping_amount: number
          discount_amount: number
          currency: string
          payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
          payment_method: string | null
          billing_address: Json
          shipping_address: Json
          notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          order_number: string
          user_id: string
          status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          total_amount: number
          subtotal_amount: number
          tax_amount?: number
          shipping_amount?: number
          discount_amount?: number
          currency?: string
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded'
          payment_method?: string | null
          billing_address: Json
          shipping_address: Json
          notes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          order_number?: string
          user_id?: string
          status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          total_amount?: number
          subtotal_amount?: number
          tax_amount?: number
          shipping_amount?: number
          discount_amount?: number
          currency?: string
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded'
          payment_method?: string | null
          billing_address?: Json
          shipping_address?: Json
          notes?: string | null
        }
      }
      order_items: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          order_id: string
          product_id: string
          product_name: string
          product_sku: string
          quantity: number
          unit_price: number
          total_price: number
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          order_id: string
          product_id: string
          product_name: string
          product_sku: string
          quantity: number
          unit_price: number
          total_price: number
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          order_id?: string
          product_id?: string
          product_name?: string
          product_sku?: string
          quantity?: number
          unit_price?: number
          total_price?: number
        }
      }
      reviews: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          product_id: string
          user_id: string
          rating: number
          title: string | null
          comment: string | null
          is_verified_purchase: boolean
          is_approved: boolean
          helpful_count: number
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          product_id: string
          user_id: string
          rating: number
          title?: string | null
          comment?: string | null
          is_verified_purchase?: boolean
          is_approved?: boolean
          helpful_count?: number
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          product_id?: string
          user_id?: string
          rating?: number
          title?: string | null
          comment?: string | null
          is_verified_purchase?: boolean
          is_approved?: boolean
          helpful_count?: number
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types
export type User = Database['public']['Tables']['users']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
export type Product = Database['public']['Tables']['products']['Row']
export type Cart = Database['public']['Tables']['carts']['Row']
export type CartItem = Database['public']['Tables']['cart_items']['Row']
export type Order = Database['public']['Tables']['orders']['Row']
export type OrderItem = Database['public']['Tables']['order_items']['Row']
export type Review = Database['public']['Tables']['reviews']['Row']