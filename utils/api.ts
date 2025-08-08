// RitZone API Client
// ==============================================
// Centralized API client for frontend-backend communication

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
  
  // Priority 3: Dynamic URL based on current origin (for development)
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/api`;
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

    // Add auth token if available
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('supabase.auth.token');
      if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
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
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Categories API
  async getCategories() {
    return this.makeRequest('/categories');
  }

  async getCategoryBySlug(slug: string) {
    return this.makeRequest(`/categories/${slug}`);
  }

  // Products API  
  async getProducts(params?: {
    limit?: number;
    page?: number;
    category?: string;
    featured?: boolean;
    search?: string;
  }) {
    const searchParams = new URLSearchParams();
    
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.category) searchParams.set('category', params.category);
    if (params?.featured !== undefined) searchParams.set('featured', params.featured.toString());
    if (params?.search) searchParams.set('search', params.search);

    const query = searchParams.toString();
    return this.makeRequest(`/products${query ? `?${query}` : ''}`);
  }

  async getProductBySlug(slug: string) {
    return this.makeRequest(`/products/${slug}`);
  }

  async getFeaturedProducts() {
    return this.getProducts({ featured: true });
  }

  async getProductsByCategory(categorySlug: string, limit?: number) {
    return this.makeRequest(`/products/category/${categorySlug}${limit ? `?limit=${limit}` : ''}`);
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

// Export types for API responses
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
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