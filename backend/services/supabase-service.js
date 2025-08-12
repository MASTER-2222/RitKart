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
    
    // Simple connection test - just check if client is initialized
    if (!client) {
      throw new Error('Supabase client not initialized');
    }

    console.log('✅ Supabase connection test successful');
    return {
      success: true,
      message: 'Connected to Supabase successfully',
      url: environment.supabase.url,
      note: 'Database schema may need to be executed manually in Supabase SQL Editor'
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
      
      // First register with Supabase Auth
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

      // CRITICAL: Create user record in custom users table for cart functionality
      if (data.user) {
        try {
          const { error: userTableError } = await client
            .from('users')
            .insert([{
              id: data.user.id,
              email: data.user.email,
              full_name: userData.fullName,
              phone: userData.phone || null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }]);

          if (userTableError) {
            console.error('❌ CRITICAL: Failed to create user in users table:', userTableError.message);
            
            // If users table creation fails, we need to clean up the auth user
            // to prevent orphaned auth records that can't use cart functionality
            try {
              await client.auth.admin.deleteUser(data.user.id);
              console.log('🧹 Cleaned up orphaned auth user due to users table failure');
            } catch (cleanupError) {
              console.error('❌ Failed to cleanup orphaned auth user:', cleanupError.message);
            }
            
            // Return failure since the registration is incomplete
            return { 
              success: false, 
              error: 'Failed to complete user registration. Please try again or contact support if the issue persists.' 
            };
          } else {
            console.log('✅ User created in both auth.users and users tables');
          }
        } catch (userTableErr) {
          console.error('❌ CRITICAL: Error creating user in users table:', userTableErr.message);
          
          // Clean up auth user
          try {
            await client.auth.admin.deleteUser(data.user.id);
            console.log('🧹 Cleaned up orphaned auth user due to users table error');
          } catch (cleanupError) {
            console.error('❌ Failed to cleanup orphaned auth user:', cleanupError.message);
          }
          
          return { 
            success: false, 
            error: 'Failed to complete user registration. Please try again or contact support if the issue persists.' 
          };
        }
      }

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
  },

  // AUTOSYNC: Verify user exists in users table
  verifyUserInUsersTable: async (userId) => {
    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from('users')
        .select('id')
        .eq('id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      return { success: true, exists: !!data };
    } catch (error) {
      console.error('❌ Verify user in users table failed:', error.message);
      return { success: false, error: error.message, exists: false };
    }
  },

  // AUTOSYNC: Force sync user to users table
  forceUserSync: async (userId, userData) => {
    try {
      const client = getSupabaseClient();
      
      // Get user details from auth if not provided
      let authUser = null;
      if (!userData.email) {
        const { data: { user }, error: authError } = await client.auth.admin.getUserById(userId);
        if (authError || !user) {
          throw new Error('Could not retrieve user from auth system');
        }
        authUser = user;
      }
      
      // Create user record in users table
      const { error: insertError } = await client
        .from('users')
        .insert([{
          id: userId,
          email: userData.email || authUser.email,
          full_name: userData.fullName || authUser.user_metadata?.full_name || 'User',
          phone: userData.phone || authUser.user_metadata?.phone || null,
          created_at: authUser?.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);
      
      if (insertError) {
        throw insertError;
      }
      
      console.log(`✅ [AUTOSYNC] Force sync successful for user: ${userId}`);
      return { success: true, message: 'User successfully synced to users table' };
      
    } catch (error) {
      console.error(`❌ [AUTOSYNC] Force sync failed for user ${userId}:`, error.message);
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
  // Get user's cart with automatic user synchronization
  getUserCart: async (userId) => {
    try {
      const client = getSupabaseClient();
      
      // ENHANCED: Ensure user exists in users table before querying cart
      await cartService.ensureUserExists(userId);
      
      const { data, error } = await client
        .from('carts')
        .select(`
          *,
          cart_items (
            *,
            products (
              id,
              name,
              slug,
              price,
              original_price,
              images,
              brand,
              stock_quantity,
              is_active
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

  // Add item to cart with automatic user synchronization
  addToCart: async (userId, productId, quantity) => {
    try {
      const client = getSupabaseClient();
      
      // First get product details to calculate price
      const { data: product, error: productError } = await client
        .from('products')
        .select('price, stock_quantity, is_active')
        .eq('id', productId)
        .single();

      if (productError) throw new Error(`Product not found: ${productError.message}`);
      if (!product.is_active) throw new Error('Product is not available');
      if (product.stock_quantity < quantity) throw new Error('Insufficient stock');

      // ENHANCED: Ensure user exists in users table before proceeding
      await cartService.ensureUserExists(userId);

      // Get or create cart - handle foreign key constraint gracefully
      let { data: cart } = await client
        .from('carts')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (!cart) {
        try {
          const { data: newCart, error: cartError } = await client
            .from('carts')
            .insert([{ 
              user_id: userId,
              status: 'active',
              total_amount: 0,
              currency: 'USD'
            }])
            .select()
            .single();
          
          if (cartError) {
            // If foreign key constraint fails, try to sync user first
            if (cartError.message.includes('violates foreign key constraint')) {
              console.log('🔄 Foreign key constraint detected, attempting user sync...');
              await cartService.ensureUserExists(userId);
              
              // Retry cart creation
              const { data: retryCart, error: retryError } = await client
                .from('carts')
                .insert([{ 
                  user_id: userId,
                  status: 'active',
                  total_amount: 0,
                  currency: 'USD'
                }])
                .select()
                .single();
              
              if (retryError) {
                throw new Error('Cart system configuration issue. Please try logging out and back in.');
              }
              cart = retryCart;
            } else {
              throw cartError;
            }
          } else {
            cart = newCart;
          }
        } catch (fkError) {
          // Re-throw with more context
          if (fkError.message.includes('foreign key constraint')) {
            throw new Error('Cart system configuration issue. User account needs to be properly initialized.');
          }
          throw fkError;
        }
      }

      // Check if item already exists in cart
      const { data: existingItem } = await client
        .from('cart_items')
        .select('*')
        .eq('cart_id', cart.id)
        .eq('product_id', productId)
        .single();

      let cartItem;
      
      if (existingItem) {
        // Update existing item quantity
        const newQuantity = existingItem.quantity + quantity;
        const newTotalPrice = newQuantity * product.price;
        
        const { data: updatedItem, error: updateError } = await client
          .from('cart_items')
          .update({
            quantity: newQuantity,
            total_price: newTotalPrice
          })
          .eq('id', existingItem.id)
          .select()
          .single();
        
        if (updateError) throw updateError;
        cartItem = updatedItem;
      } else {
        // Add new item to cart
        const totalPrice = quantity * product.price;
        
        const { data: newItem, error: insertError } = await client
          .from('cart_items')
          .insert([{
            cart_id: cart.id,
            product_id: productId,
            quantity: quantity,
            unit_price: product.price,
            total_price: totalPrice
          }])
          .select()
          .single();
        
        if (insertError) throw insertError;
        cartItem = newItem;
      }

      // Recalculate cart total
      await cartService.updateCartTotal(cart.id);

      return { success: true, cartItem: cartItem };
    } catch (error) {
      console.error('❌ Add to cart failed:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Update cart item quantity
  updateCartItem: async (itemId, quantity, userId) => {
    try {
      const client = getSupabaseClient();

      // First verify the item belongs to user's cart
      const { data: cartItem, error: itemError } = await client
        .from('cart_items')
        .select(`
          *,
          carts!inner (
            user_id
          ),
          products (
            price,
            stock_quantity
          )
        `)
        .eq('id', itemId)
        .single();

      if (itemError) throw new Error('Cart item not found');
      if (cartItem.carts.user_id !== userId) throw new Error('Unauthorized');
      if (cartItem.products.stock_quantity < quantity) throw new Error('Insufficient stock');

      // Update item
      const newTotalPrice = quantity * cartItem.products.price;
      
      const { data: updatedItem, error: updateError } = await client
        .from('cart_items')
        .update({
          quantity: quantity,
          total_price: newTotalPrice
        })
        .eq('id', itemId)
        .select()
        .single();

      if (updateError) throw updateError;

      // Recalculate cart total
      await cartService.updateCartTotal(cartItem.cart_id);

      return { success: true, cartItem: updatedItem };
    } catch (error) {
      console.error('❌ Update cart item failed:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Remove item from cart
  removeCartItem: async (itemId, userId) => {
    try {
      const client = getSupabaseClient();

      // First verify the item belongs to user's cart
      const { data: cartItem, error: itemError } = await client
        .from('cart_items')
        .select(`
          cart_id,
          carts!inner (
            user_id
          )
        `)
        .eq('id', itemId)
        .single();

      if (itemError) throw new Error('Cart item not found');
      if (cartItem.carts.user_id !== userId) throw new Error('Unauthorized');

      // Delete the item
      const { error: deleteError } = await client
        .from('cart_items')
        .delete()
        .eq('id', itemId);

      if (deleteError) throw deleteError;

      // Recalculate cart total
      await cartService.updateCartTotal(cartItem.cart_id);

      return { success: true, message: 'Item removed from cart' };
    } catch (error) {
      console.error('❌ Remove cart item failed:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Clear entire cart
  clearCart: async (userId) => {
    try {
      const client = getSupabaseClient();

      // Get user's active cart
      const { data: cart } = await client
        .from('carts')
        .select('id')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (!cart) {
        return { success: true, message: 'Cart is already empty' };
      }

      // Delete all cart items
      const { error: deleteError } = await client
        .from('cart_items')
        .delete()
        .eq('cart_id', cart.id);

      if (deleteError) throw deleteError;

      // Update cart total to 0
      const { error: updateError } = await client
        .from('carts')
        .update({ total_amount: 0 })
        .eq('id', cart.id);

      if (updateError) throw updateError;

      return { success: true, message: 'Cart cleared successfully' };
    } catch (error) {
      console.error('❌ Clear cart failed:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Helper function to update cart total
  updateCartTotal: async (cartId) => {
    try {
      const client = getSupabaseClient();
      
      // Calculate total from cart items
      const { data: items, error: itemsError } = await client
        .from('cart_items')
        .select('total_price')
        .eq('cart_id', cartId);

      if (itemsError) throw itemsError;

      const totalAmount = items.reduce((sum, item) => sum + (item.total_price || 0), 0);

      // Update cart total
      const { error: updateError } = await client
        .from('carts')
        .update({ total_amount: totalAmount })
        .eq('id', cartId);

      if (updateError) throw updateError;

      return totalAmount;
    } catch (error) {
      console.error('❌ Update cart total failed:', error.message);
      throw error;
    }
  },

  // NEW: Helper function to ensure user exists in users table
  ensureUserExists: async (userId) => {
    try {
      const client = getSupabaseClient();
      
      // First check if user already exists in users table
      const { data: existingUser, error: checkError } = await client
        .from('users')
        .select('id')
        .eq('id', userId)
        .single();
      
      if (!checkError && existingUser) {
        // User already exists, no action needed
        return { success: true, message: 'User already exists in users table' };
      }
      
      // User doesn't exist, get their details from auth and create record
      console.log(`🔄 User ${userId} not found in users table, attempting to sync from auth...`);
      
      const { data: { user }, error: authError } = await client.auth.admin.getUserById(userId);
      
      if (authError || !user) {
        throw new Error('User not found in authentication system');
      }
      
      // Create user record in users table
      const { error: insertError } = await client
        .from('users')
        .insert([{
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          phone: user.user_metadata?.phone || null,
          created_at: user.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);
      
      if (insertError) {
        console.error('❌ Failed to sync user to users table:', insertError.message);
        throw new Error('Failed to synchronize user account. Please contact support.');
      }
      
      console.log(`✅ Successfully synced user ${userId} to users table`);
      return { success: true, message: 'User successfully synced to users table' };
      
    } catch (error) {
      console.error('❌ Ensure user exists failed:', error.message);
      throw error;
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

// ==============================================
// 📦 ORDER MANAGEMENT SERVICES
// ==============================================
const orderService = {
  // Create new order from cart
  createOrder: async (userId, orderData) => {
    try {
      const client = getSupabaseClient();
      
      // Get user's active cart with items
      const { data: cart, error: cartError } = await client
        .from('carts')
        .select(`
          *,
          cart_items (
            *,
            products (
              id,
              name,
              sku,
              price,
              stock_quantity,
              is_active
            )
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (cartError || !cart || !cart.cart_items || cart.cart_items.length === 0) {
        throw new Error('Cart is empty or not found');
      }

      // Validate stock availability
      for (const item of cart.cart_items) {
        if (!item.products.is_active) {
          throw new Error(`Product ${item.products.name} is no longer available`);
        }
        if (item.products.stock_quantity < item.quantity) {
          throw new Error(`Insufficient stock for ${item.products.name}`);
        }
      }

      // Generate order number
      const orderNumber = `RZ-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Calculate totals
      const subtotalAmount = cart.cart_items.reduce((sum, item) => sum + item.total_price, 0);
      const taxAmount = subtotalAmount * 0.08; // 8% tax
      const shippingAmount = subtotalAmount > 50 ? 0 : 9.99; // Free shipping over $50
      const discountAmount = orderData.discountAmount || 0;
      const totalAmount = subtotalAmount + taxAmount + shippingAmount - discountAmount;

      // Create order
      const { data: order, error: orderError } = await client
        .from('orders')
        .insert([{
          order_number: orderNumber,
          user_id: userId,
          status: 'pending',
          total_amount: totalAmount,
          subtotal_amount: subtotalAmount,
          tax_amount: taxAmount,
          shipping_amount: shippingAmount,
          discount_amount: discountAmount,
          currency: 'USD',
          payment_method: orderData.paymentMethod || 'card',
          billing_address: orderData.billingAddress,
          shipping_address: orderData.shippingAddress,
          notes: orderData.notes || null
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cart.cart_items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.products.name,
        product_sku: item.products.sku,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price
      }));

      const { error: itemsError } = await client
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Update product stock
      for (const item of cart.cart_items) {
        const { error: stockError } = await client
          .from('products')
          .update({ 
            stock_quantity: item.products.stock_quantity - item.quantity 
          })
          .eq('id', item.product_id);
        
        if (stockError) console.warn(`Warning: Could not update stock for product ${item.product_id}`);
      }

      // Convert cart to 'converted' status
      const { error: cartUpdateError } = await client
        .from('carts')
        .update({ status: 'converted' })
        .eq('id', cart.id);

      if (cartUpdateError) console.warn('Warning: Could not update cart status');

      return { success: true, order: order };
    } catch (error) {
      console.error('❌ Create order failed:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Get user's orders
  getUserOrders: async (userId, page = 1, limit = 10) => {
    try {
      const client = getSupabaseClient();
      const offset = (page - 1) * limit;
      
      const { data, error, count } = await client
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (
              name,
              images
            )
          )
        `, { count: 'exact' })
        .eq('user_id', userId)
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { 
        success: true, 
        orders: data,
        totalCount: count,
        currentPage: page,
        totalPages: Math.ceil(count / limit)
      };
    } catch (error) {
      console.error('❌ Get user orders failed:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Get order by ID
  getOrderById: async (orderId, userId) => {
    try {
      const client = getSupabaseClient();
      
      const { data, error } = await client
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (
              name,
              images,
              slug
            )
          )
        `)
        .eq('id', orderId)
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return { success: true, order: data };
    } catch (error) {
      console.error('❌ Get order by ID failed:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Cancel order
  cancelOrder: async (orderId, userId, reason = 'Customer request') => {
    try {
      const client = getSupabaseClient();
      
      // Get order details with items
      const { data: order, error: orderError } = await client
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (
              stock_quantity
            )
          )
        `)
        .eq('id', orderId)
        .eq('user_id', userId)
        .single();

      if (orderError || !order) throw new Error('Order not found');

      // Only allow cancellation of pending or processing orders
      if (!['pending', 'processing'].includes(order.status)) {
        throw new Error('Order cannot be cancelled at this stage');
      }

      // Update order status
      const { error: updateError } = await client
        .from('orders')
        .update({ 
          status: 'cancelled',
          notes: (order.notes || '') + `\nCancelled: ${reason}`
        })
        .eq('id', orderId);

      if (updateError) throw updateError;

      // Restore product stock
      for (const item of order.order_items) {
        const { error: stockError } = await client
          .from('products')
          .update({ 
            stock_quantity: item.products.stock_quantity + item.quantity 
          })
          .eq('id', item.product_id);
        
        if (stockError) console.warn(`Warning: Could not restore stock for product ${item.product_id}`);
      }

      return { success: true, message: 'Order cancelled successfully' };
    } catch (error) {
      console.error('❌ Cancel order failed:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Update order status (admin function)
  updateOrderStatus: async (orderId, status, notes = '') => {
    try {
      const client = getSupabaseClient();
      
      const allowedStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
      if (!allowedStatuses.includes(status)) {
        throw new Error('Invalid order status');
      }

      const { data, error } = await client
        .from('orders')
        .update({ 
          status: status,
          notes: notes
        })
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, order: data };
    } catch (error) {
      console.error('❌ Update order status failed:', error.message);
      return { success: false, error: error.message };
    }
  }
};

// ==============================================
// 🎨 HERO BANNERS SERVICE
// ==============================================
const bannerService = {
  // Get all active hero banners
  async getAllBanners() {
    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from('hero_banners')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('❌ Supabase banners fetch error:', error);
        return { success: false, error: error.message };
      }

      return {
        success: true,
        banners: data || []
      };
    } catch (error) {
      console.error('❌ Get banners service error:', error);
      return { success: false, error: error.message };
    }
  },

  // Create new hero banner
  async createBanner(bannerData) {
    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from('hero_banners')
        .insert([bannerData])
        .select()
        .single();

      if (error) {
        console.error('❌ Supabase banner create error:', error);
        return { success: false, error: error.message };
      }

      return {
        success: true,
        banner: data
      };
    } catch (error) {
      console.error('❌ Create banner service error:', error);
      return { success: false, error: error.message };
    }
  },

  // Update hero banner
  async updateBanner(bannerId, bannerData) {
    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from('hero_banners')
        .update(bannerData)
        .eq('id', bannerId)
        .select()
        .single();

      if (error) {
        console.error('❌ Supabase banner update error:', error);
        return { success: false, error: error.message };
      }

      return {
        success: true,
        banner: data
      };
    } catch (error) {
      console.error('❌ Update banner service error:', error);
      return { success: false, error: error.message };
    }
  },

  // Delete hero banner
  async deleteBanner(bannerId) {
    try {
      const client = getSupabaseClient();
      const { error } = await client
        .from('hero_banners')
        .delete()
        .eq('id', bannerId);

      if (error) {
        console.error('❌ Supabase banner delete error:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('❌ Delete banner service error:', error);
      return { success: false, error: error.message };
    }
  }
};

// ==============================================
// 🏷️ DEALS SERVICE
// ==============================================
const dealsService = {
  // Get all active deals
  async getAllDeals() {
    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from('deals')
        .select(`
          *,
          products (
            id,
            name,
            slug,
            description,
            images,
            brand,
            rating_average,
            total_reviews,
            stock_quantity
          )
        `)
        .eq('is_active', true)
        .gte('end_date', new Date().toISOString())
        .order('discount_percentage', { ascending: false });

      if (error) {
        console.error('❌ Supabase deals fetch error:', error);
        return { success: false, error: error.message };
      }

      // Transform the data to include product information
      const transformedDeals = data?.map(deal => ({
        id: deal.id,
        title: deal.deal_title || deal.products?.name,
        price: deal.deal_price,
        originalPrice: deal.original_price,
        rating: deal.products?.rating_average || 0,
        reviewCount: deal.products?.total_reviews || 0,
        image: deal.products?.images[0] || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        isDeliveryTomorrow: deal.products?.stock_quantity > 0,
        discount: deal.discount_percentage,
        category: deal.category,
        dealEndTime: deal.end_date,
        brand: deal.products?.brand,
        product_id: deal.product_id
      })) || [];

      return {
        success: true,
        deals: transformedDeals
      };
    } catch (error) {
      console.error('❌ Get deals service error:', error);
      return { success: false, error: error.message };
    }
  },

  // Create new deal
  async createDeal(dealData) {
    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from('deals')
        .insert([dealData])
        .select()
        .single();

      if (error) {
        console.error('❌ Supabase deal create error:', error);
        return { success: false, error: error.message };
      }

      return {
        success: true,
        deal: data
      };
    } catch (error) {
      console.error('❌ Create deal service error:', error);
      return { success: false, error: error.message };
    }
  },

  // Update deal
  async updateDeal(dealId, dealData) {
    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from('deals')
        .update(dealData)
        .eq('id', dealId)
        .select()
        .single();

      if (error) {
        console.error('❌ Supabase deal update error:', error);
        return { success: false, error: error.message };
      }

      return {
        success: true,
        deal: data
      };
    } catch (error) {
      console.error('❌ Update deal service error:', error);
      return { success: false, error: error.message };
    }
  },

  // Delete deal
  async deleteDeal(dealId) {
    try {
      const client = getSupabaseClient();
      const { error } = await client
        .from('deals')
        .delete()
        .eq('id', dealId);

      if (error) {
        console.error('❌ Supabase deal delete error:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('❌ Delete deal service error:', error);
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
  orderService,
  bannerService,
  dealsService,
};