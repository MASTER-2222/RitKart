// RitZone Backend Supabase Service
// ==============================================
// Supabase integration using environment variables

const { createClient } = require('@supabase/supabase-js');
const { environment } = require('../config/environment');

// ==============================================
// 🔧 SUPABASE CLIENT INITIALIZATION
// ==============================================
let supabaseClient = null;

const initializeSupabase = () => {
  try {
    if (!environment.supabase.url || !environment.supabase.anonKey) {
      throw new Error('❌ Supabase configuration missing from environment variables');
    }

    supabaseClient = createClient(
      environment.supabase.url,
      environment.supabase.anonKey,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false
        },
        db: {
          schema: 'public'
        },
        global: {
          headers: {
            'X-Client-Info': 'ritzone-backend'
          }
        }
      }
    );

    console.log('✅ Supabase client initialized successfully');
    console.log(`🌐 Connected to: ${environment.supabase.url}`);
    
    return supabaseClient;
  } catch (error) {
    console.error('❌ Failed to initialize Supabase client:', error.message);
    throw error;
  }
};

// ==============================================
// 🔧 GET SUPABASE CLIENT
// ==============================================
const getSupabaseClient = () => {
  if (!supabaseClient) {
    initializeSupabase();
  }
  return supabaseClient;
};

// ==============================================
// 🧪 CONNECTION TEST
// ==============================================
const testConnection = async () => {
  try {
    const client = getSupabaseClient();
    
    // Test basic connection
    const { data, error } = await client
      .from('categories')
      .select('count(*)')
      .limit(1);

    if (error) {
      throw error;
    }

    console.log('✅ Supabase connection test successful');
    return {
      success: true,
      message: 'Connected to Supabase successfully',
      url: environment.supabase.url
    };
  } catch (error) {
    console.error('❌ Supabase connection test failed:', error.message);
    return {
      success: false,
      message: error.message,
      url: environment.supabase.url
    };
  }
};

// ==============================================
// 👤 USER MANAGEMENT SERVICES
// ==============================================
const userService = {
  // Register new user
  register: async (userData) => {
    try {
      const client = getSupabaseClient();
      const { data, error } = await client.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.fullName,
            phone: userData.phone || null
          }
        }
      });

      if (error) throw error;
      return { success: true, user: data.user };
    } catch (error) {
      console.error('❌ User registration failed:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Login user
  login: async (email, password) => {
    try {
      const client = getSupabaseClient();
      const { data, error } = await client.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      return { success: true, user: data.user, session: data.session };
    } catch (error) {
      console.error('❌ User login failed:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Get user profile
  getProfile: async (userId) => {
    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return { success: true, user: data };
    } catch (error) {
      console.error('❌ Get user profile failed:', error.message);
      return { success: false, error: error.message };
    }
  }
};

// ==============================================
// 📦 PRODUCT MANAGEMENT SERVICES
// ==============================================
const productService = {
  // Get all products
  getAllProducts: async (page = 1, limit = 20) => {
    try {
      const client = getSupabaseClient();
      const offset = (page - 1) * limit;
      
      const { data, error, count } = await client
        .from('products')
        .select('*', { count: 'exact' })
        .eq('is_active', true)
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { 
        success: true, 
        products: data, 
        totalCount: count,
        currentPage: page,
        totalPages: Math.ceil(count / limit)
      };
    } catch (error) {
      console.error('❌ Get products failed:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Get product by ID
  getProductById: async (productId) => {
    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from('products')
        .select('*')
        .eq('id', productId)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      return { success: true, product: data };
    } catch (error) {
      console.error('❌ Get product failed:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Get products by category
  getProductsByCategory: async (categorySlug, page = 1, limit = 20) => {
    try {
      const client = getSupabaseClient();
      const offset = (page - 1) * limit;
      
      // First get category ID
      const { data: category } = await client
        .from('categories')
        .select('id')
        .eq('slug', categorySlug)
        .single();

      if (!category) {
        throw new Error('Category not found');
      }

      const { data, error, count } = await client
        .from('products')
        .select('*', { count: 'exact' })
        .eq('category_id', category.id)
        .eq('is_active', true)
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { 
        success: true, 
        products: data,
        category: categorySlug, 
        totalCount: count,
        currentPage: page,
        totalPages: Math.ceil(count / limit)
      };
    } catch (error) {
      console.error('❌ Get products by category failed:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Create new product
  createProduct: async (productData) => {
    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from('products')
        .insert([productData])
        .select()
        .single();

      if (error) throw error;
      return { success: true, product: data };
    } catch (error) {
      console.error('❌ Create product failed:', error.message);
      return { success: false, error: error.message };
    }
  }
};

// ==============================================
// 🛒 CART MANAGEMENT SERVICES  
// ==============================================
const cartService = {
  // Get user's cart
  getUserCart: async (userId) => {
    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from('carts')
        .select(`
          *,
          cart_items (
            *,
            products (
              name,
              price,
              images
            )
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return { success: true, cart: data };
    } catch (error) {
      console.error('❌ Get user cart failed:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Add item to cart
  addToCart: async (userId, productId, quantity) => {
    try {
      const client = getSupabaseClient();
      
      // First, get or create cart
      let { data: cart } = await client
        .from('carts')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (!cart) {
        const { data: newCart, error: cartError } = await client
          .from('carts')
          .insert([{ user_id: userId }])
          .select()
          .single();
        
        if (cartError) throw cartError;
        cart = newCart;
      }

      // Add item to cart
      const { data, error } = await client
        .from('cart_items')
        .insert([{
          cart_id: cart.id,
          product_id: productId,
          quantity: quantity
        }])
        .select()
        .single();

      if (error) throw error;
      return { success: true, cartItem: data };
    } catch (error) {
      console.error('❌ Add to cart failed:', error.message);
      return { success: false, error: error.message };
    }
  }
};

// ==============================================
// 📋 CATEGORY SERVICES
// ==============================================
const categoryService = {
  // Get all categories
  getAllCategories: async () => {
    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      return { success: true, categories: data };
    } catch (error) {
      console.error('❌ Get categories failed:', error.message);
      return { success: false, error: error.message };
    }
  }
};

module.exports = {
  initializeSupabase,
  getSupabaseClient,
  testConnection,
  userService,
  productService,
  cartService,
  categoryService,
};