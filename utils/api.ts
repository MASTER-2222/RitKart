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
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    // Add auth token if available (from Supabase)
    if (typeof window !== 'undefined') {
      try {
        // Try to get Supabase session first
        const { createClient } = await import('../utils/supabase/client');
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.access_token) {
          defaultHeaders['Authorization'] = `Bearer ${session.access_token}`;
        }
      } catch (error) {
        console.warn('Failed to get Supabase session:', error);
        // Fallback to localStorage token
        const token = localStorage.getItem('supabase.auth.token');
        if (token) {
          defaultHeaders['Authorization'] = `Bearer ${token}`;
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
      
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Log currency information if present in response
      if (data.currency) {
        console.log(`💰 Response currency: ${data.currency}`);
      }
      
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

  // Cart API (requires authentication)
  async getCart() {
    return this.makeRequest('/cart');
  }

  async addToCart(productId: string, quantity: number = 1) {
    return this.makeRequest('/cart/add', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId, quantity }),
    });
  }

  async updateCartItem(itemId: string, quantity: number) {
    return this.makeRequest(`/cart/item/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  }

  async removeFromCart(itemId: string) {
    return this.makeRequest(`/cart/item/${itemId}`, {
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
  product: Product;
}

export interface Cart {
  id: string;
  user_id: string;
  total_amount: number;
  items: CartItem[];
}

export default apiClient;