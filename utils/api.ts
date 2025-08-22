// RitZone API Client
// ==============================================
// Centralized API client for frontend-backend communication
// ENHANCED WITH DYNAMIC CURRENCY SUPPORT

// Environment-based API URL configuration (no hardcoded fallbacks)
const getApiBaseUrl = (): string => {
  // Priority 1: NEXT_PUBLIC_BACKEND_URL (recommended)
  if (process.env.NEXT_PUBLIC_BACKEND_URL) {
    return process.env.NEXT_PUBLIC_BACKEND_URL;
  }
  
  // Priority 2: Legacy NEXT_PUBLIC_API_BASE_URL
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }
  
  // Priority 3: Development fallback
  if (typeof window !== 'undefined') {
    return 'http://localhost:8001/api';
  }
  
  // Priority 4: Server-side fallback for development
  return '/api';
};

const API_BASE_URL = getApiBaseUrl();

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultHeaders: Record<string, string> = {};

    // Only set Content-Type for non-FormData requests
    if (!(options.body instanceof FormData)) {
      defaultHeaders['Content-Type'] = 'application/json';
    }

    // Add auth token if available (from Supabase)
    if (typeof window !== 'undefined') {
      try {
        // Try to get Supabase session first
        console.log('🔍 Getting Supabase session...');
        const { createClient } = await import('../utils/supabase/client');
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        
        console.log('🔐 Supabase session:', session ? 'Found' : 'Not found');
        if (session?.access_token) {
          console.log('✅ Access token found, length:', session.access_token.length);
          defaultHeaders['Authorization'] = `Bearer ${session.access_token}`;
        } else {
          console.log('❌ No access token in session');
        }
      } catch (error) {
        console.warn('⚠️ Failed to get Supabase session:', error);
        // Fallback to localStorage token
        const token = localStorage.getItem('supabase.auth.token');
        if (token) {
          console.log('🔄 Using localStorage token fallback');
          defaultHeaders['Authorization'] = `Bearer ${token}`;
        } else {
          console.log('❌ No token found in localStorage either');
        }
      }
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      console.log(`🌐 API Request: ${url}`);
      console.log(`🔑 Headers:`, config.headers);
      
      const response = await fetch(url, config);
      
      console.log(`📊 Response Status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ API Error (${response.status}):`, errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      
      // Log currency information if present in response
      if (data.currency) {
        console.log(`💰 Response currency: ${data.currency}`);
      }
      
      console.log(`✅ API Success:`, data);
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // NEW: Helper function to add currency parameter
  private addCurrencyToParams(params: URLSearchParams, currency?: string): void {
    if (currency && currency !== 'INR') {
      params.set('currency', currency);
    }
  }

  // Categories API
  async getCategories() {
    return this.makeRequest('/categories');
  }

  async getCategoryBySlug(slug: string) {
    return this.makeRequest(`/categories/${slug}`);
  }

  // Products API - ENHANCED WITH CURRENCY SUPPORT
  async getProducts(params?: {
    limit?: number;
    page?: number;
    category?: string;
    featured?: boolean;
    search?: string;
    currency?: string; // NEW: Currency parameter
  }) {
    const searchParams = new URLSearchParams();
    
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.category) searchParams.set('category', params.category);
    if (params?.featured !== undefined) searchParams.set('featured', params.featured.toString());
    if (params?.search) searchParams.set('search', params.search);
    
    // NEW: Add currency parameter
    this.addCurrencyToParams(searchParams, params?.currency);

    const query = searchParams.toString();
    return this.makeRequest(`/products${query ? `?${query}` : ''}`);
  }

  async getProductBySlug(slug: string, currency?: string) {
    const searchParams = new URLSearchParams();
    this.addCurrencyToParams(searchParams, currency);
    
    const query = searchParams.toString();
    return this.makeRequest(`/products/${slug}${query ? `?${query}` : ''}`);
  }

  async getProductById(id: string, currency?: string) {
    const searchParams = new URLSearchParams();
    this.addCurrencyToParams(searchParams, currency);
    
    const query = searchParams.toString();
    return this.makeRequest(`/products/${id}${query ? `?${query}` : ''}`);
  }

  async getFeaturedProducts(currency?: string) {
    return this.getProducts({ featured: true, currency });
  }

  async getRelatedProducts(productId: string, params?: {
    limit?: number;
    currency?: string;
  }) {
    const searchParams = new URLSearchParams();
    
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    
    // Add currency parameter
    this.addCurrencyToParams(searchParams, params?.currency);

    const query = searchParams.toString();
    return this.makeRequest(`/products/${productId}/related${query ? `?${query}` : ''}`);
  }

  async getProductsByCategory(categorySlug: string, params?: {
    limit?: number;
    page?: number;
    currency?: string; // NEW: Currency parameter
  }) {
    const searchParams = new URLSearchParams();
    
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.page) searchParams.set('page', params.page.toString());
    
    // NEW: Add currency parameter
    this.addCurrencyToParams(searchParams, params?.currency);

    const query = searchParams.toString();
    return this.makeRequest(`/products/category/${categorySlug}${query ? `?${query}` : ''}`);
  }

  // Banners API
  async getBanners() {
    return this.makeRequest('/banners');
  }

  // Deals API
  async getDeals() {
    return this.makeRequest('/deals');
  }

  // NEW: Currency API
  async getCurrencies() {
    return this.makeRequest('/currency/currencies');
  }

  async getExchangeRates(baseCurrency = 'INR') {
    return this.makeRequest(`/currency/rates?base=${baseCurrency}`);
  }

  async convertPrice(amount: number, fromCurrency: string, toCurrency: string) {
    return this.makeRequest('/currency/convert', {
      method: 'POST',
      body: JSON.stringify({
        amount,
        from: fromCurrency,
        to: toCurrency
      }),
    });
  }

  // Search API
  async searchProducts(query: string, params?: {
    page?: number;
    limit?: number;
    category?: string;
    sortBy?: string;
    currency?: string;
  }) {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.category && params.category !== 'All') searchParams.set('category', params.category);
    if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
    
    // Add currency parameter
    this.addCurrencyToParams(searchParams, params?.currency);

    const queryString = searchParams.toString();
    return this.makeRequest(`/products/search/${encodeURIComponent(query)}${queryString ? `?${queryString}` : ''}`);
  }

  // Cart API (requires authentication)
  async getCart(currency?: string) {
    const searchParams = new URLSearchParams();
    this.addCurrencyToParams(searchParams, currency);
    const query = searchParams.toString();
    return this.makeRequest(`/cart${query ? `?${query}` : ''}`);
  }

  async addToCart(productId: string, quantity: number = 1) {
    return this.makeRequest('/cart/add', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    });
  }

  async updateCartItem(itemId: string, quantity: number) {
    return this.makeRequest(`/cart/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  }

  async removeFromCart(itemId: string) {
    return this.makeRequest(`/cart/items/${itemId}`, {
      method: 'DELETE',
    });
  }

  // Orders API (requires authentication)
  async getOrders() {
    return this.makeRequest('/orders');
  }

  async createOrder(orderData: any) {
    return this.makeRequest('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async getOrderById(orderId: string) {
    return this.makeRequest(`/orders/${orderId}`);
  }

  // Auth API
  async register(userData: {
    email: string;
    password: string;
    full_name: string;
    phone?: string;
  }) {
    return this.makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(email: string, password: string) {
    return this.makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getProfile() {
    return this.makeRequest('/auth/profile');
  }

  async updateProfile(profileData: {
    fullName?: string;
    phone?: string;
    dateOfBirth?: string;
  }) {
    return this.makeRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // Profile Dashboard API
  async getProfileDashboard() {
    return this.makeRequest('/profile/dashboard');
  }

  // Address Management API
  async getAddresses() {
    return this.makeRequest('/profile/addresses');
  }

  async createAddress(addressData: {
    type: string;
    name: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone?: string;
    isDefault?: boolean;
  }) {
    return this.makeRequest('/profile/addresses', {
      method: 'POST',
      body: JSON.stringify(addressData),
    });
  }

  async updateAddress(addressId: string, addressData: {
    type?: string;
    name?: string;
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    phone?: string;
    isDefault?: boolean;
  }) {
    return this.makeRequest(`/profile/addresses/${addressId}`, {
      method: 'PUT',
      body: JSON.stringify(addressData),
    });
  }

  async deleteAddress(addressId: string) {
    return this.makeRequest(`/profile/addresses/${addressId}`, {
      method: 'DELETE',
    });
  }

  // Payment Methods API
  async getPaymentMethods() {
    return this.makeRequest('/profile/payment-methods');
  }

  async createPaymentMethod(paymentData: {
    type: 'card' | 'upi';
    name: string;
    details: string;
    lastFour?: string;
    expiryDate?: string;
    isDefault?: boolean;
  }) {
    return this.makeRequest('/profile/payment-methods', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  async updatePaymentMethod(methodId: string, paymentData: {
    type?: 'card' | 'upi';
    name?: string;
    details?: string;
    lastFour?: string;
    expiryDate?: string;
    isDefault?: boolean;
  }) {
    return this.makeRequest(`/profile/payment-methods/${methodId}`, {
      method: 'PUT',
      body: JSON.stringify(paymentData),
    });
  }

  async deletePaymentMethod(methodId: string) {
    return this.makeRequest(`/profile/payment-methods/${methodId}`, {
      method: 'DELETE',
    });
  }

  // Wishlist API
  async getWishlist() {
    return this.makeRequest('/profile/wishlist');
  }

  async addToWishlist(productId: string) {
    return this.makeRequest('/profile/wishlist', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId }),
    });
  }

  async removeFromWishlist(productId: string) {
    return this.makeRequest(`/profile/wishlist/${productId}`, {
      method: 'DELETE',
    });
  }

  // User Reviews API
  async getProductReviews(productId: string, params?: {
    page?: number;
    limit?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    
    const query = searchParams.toString();
    return this.makeRequest(`/reviews/product/${productId}${query ? `?${query}` : ''}`);
  }

  async createReview(formData: FormData) {
    return this.makeRequest('/reviews', {
      method: 'POST',
      body: formData,
    });
  }

  async updateReview(reviewId: string, formData: FormData) {
    return this.makeRequest(`/reviews/${reviewId}`, {
      method: 'PUT',
      body: formData,
    });
  }

  async deleteReview(reviewId: string) {
    return this.makeRequest(`/reviews/${reviewId}`, {
      method: 'DELETE',
    });
  }

  async getUserReviews(params?: {
    page?: number;
    limit?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    
    const query = searchParams.toString();
    return this.makeRequest(`/reviews/my-reviews${query ? `?${query}` : ''}`);
  }

  async getReviewStats(productId: string) {
    return this.makeRequest(`/reviews/stats/${productId}`);
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// NEW: Currency-aware API helper functions
export const currencyApiClient = {
  // Get current currency from localStorage
  getCurrentCurrency: (): string => {
    if (typeof window !== 'undefined') {
      try {
        const savedCurrency = localStorage.getItem('ritzone_selected_currency');
        if (savedCurrency) {
          const parsedCurrency = JSON.parse(savedCurrency);
          return parsedCurrency.code || 'INR';
        }
      } catch (error) {
        console.error('Error getting current currency:', error);
      }
    }
    return 'INR';
  },

  // Products with automatic currency
  async getProducts(params?: {
    limit?: number;
    page?: number;
    category?: string;
    featured?: boolean;
    search?: string;
  }) {
    const currency = this.getCurrentCurrency();
    return apiClient.getProducts({ ...params, currency });
  },

  async getProductById(id: string) {
    const currency = this.getCurrentCurrency();
    return apiClient.getProductById(id, currency);
  },

  async getProductsByCategory(categorySlug: string, params?: {
    limit?: number;
    page?: number;
  }) {
    const currency = this.getCurrentCurrency();
    return apiClient.getProductsByCategory(categorySlug, { ...params, currency });
  },

  async getFeaturedProducts() {
    const currency = this.getCurrentCurrency();
    return apiClient.getFeaturedProducts(currency);
  },

  async getRelatedProducts(productId: string, params?: {
    limit?: number;
  }) {
    const currency = this.getCurrentCurrency();
    return apiClient.getRelatedProducts(productId, { ...params, currency });
  },
};

// Export types for API responses
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  currency?: string; // NEW: Currency information
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
  };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  parent_id: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  sku: string;
  price: number;
  original_price: number;
  category_id: string;
  brand: string;
  stock_quantity: number;
  is_active: boolean;
  is_featured: boolean;
  images: string[];
  features: string[];
  specifications: Record<string, any>;
  reviews?: string; // NEW: Reviews field for admin panel editable reviews
  rating_average: number;
  rating_count: number;
  total_reviews: number;
  // NEW: Currency fields
  currency?: string;
  currency_symbol?: string;
  formatted_price?: string;
  base_currency?: string;
  base_price?: number;
}

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  products: Product;
}

export interface Cart {
  id: string;
  user_id: string;
  total_amount: number;
  cart_items: CartItem[];
  currency?: string;
  status?: string;
}

export interface UserReview {
  id: string;
  rating: number;
  review_text: string;
  images: string[];
  created_at: string;
  updated_at: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  product?: {
    id: string;
    name: string;
    slug: string;
    image: string;
  };
}

export interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

// Profile Enhancement interfaces
export interface ProfileDashboard {
  user: {
    id: string;
    email: string;
    fullName: string;
    memberSince: string;
  };
  stats: {
    totalOrders: number;
    activeDeliveries: number;
    completedOrders: number;
    totalSpent: number;
    cartItems: number;
    wishlistItems: number;
  };
  recentOrders: Array<{
    id: string;
    date: string;
    status: string;
    totalAmount: number;
    items: Array<{
      name: string;
      image: string;
      price: number;
    }>;
  }>;
}

export interface Address {
  id: string;
  type: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'upi';
  name: string;
  details: string;
  lastFour?: string;
  expiryDate?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WishlistItem {
  id: string;
  added_at: string;
  product: {
    id: string;
    name: string;
    slug?: string;
    price: number;
    original_price?: number;
    images: string | string[];
    brand?: string;
    rating?: number;
    reviewCount?: number;
    stock?: number;
    isActive?: boolean;
    category?: string;
  };
}

export default apiClient;