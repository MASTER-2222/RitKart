
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '../utils/supabase/client';
import { apiClient } from '../utils/api';
import { User } from '@supabase/supabase-js';

export default function Header() {
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [user, setUser] = useState<User | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  const categories = ['All', 'Books', 'Electronics', 'Fashion', 'Grocery', 'Sports', 'Home', 'Appliances', 'Solar', 'Pharmacy'];

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
      
      // Load cart count if user is authenticated
      if (user) {
        loadCartCount();
      } else {
        setCartCount(0);
      }
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Load cart count when user state changes
        if (session?.user) {
          loadCartCount();
        } else {
          setCartCount(0);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadCartCount = async () => {
    try {
      const response = await apiClient.getCart();
      if (response.success && response.data && response.data.cart_items) {
        const totalItems = response.data.cart_items.reduce((sum, item) => sum + item.quantity, 0);
        setCartCount(totalItems);
      } else {
        setCartCount(0);
      }
    } catch (error) {
      console.error('Failed to load cart count:', error);
      setCartCount(0);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
    setShowAccountMenu(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const params = new URLSearchParams();
      params.set('q', searchQuery.trim());
      if (selectedCategory !== 'All') {
        params.set('category', selectedCategory);
      }
      router.push(`/search?${params.toString()}`);
    }
  };

  return (
    <header className="bg-[#232f3e] text-white">
      <div className="flex items-center justify-between px-4 py-2">
        <Link href="/" className="flex items-center">
          <span className="text-2xl font-['Pacifico'] text-white">RitZone</span>
        </Link>

        <div className="flex items-center space-x-2 text-sm">
          <div className="flex items-center space-x-1 hover:border border-white p-1 cursor-pointer">
            <i className="ri-map-pin-line w-4 h-4 flex items-center justify-center"></i>
            <div>
              <div className="text-xs text-gray-300">Deliver to</div>
              <div className="font-bold">New York 10001</div>
            </div>
          </div>
        </div>

        <div className="flex-1 max-w-2xl mx-8">
          <form onSubmit={handleSearch} className="flex">
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-gray-200 text-black px-3 py-2 rounded-l border-0 text-sm pr-8"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Search RitZone"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 text-black border-0"
            />
            <button 
              type="submit"
              className="bg-[#febd69] hover:bg-[#f3a847] px-4 py-2 rounded-r"
            >
              <i className="ri-search-line w-5 h-5 flex items-center justify-center text-black"></i>
            </button>
          </form>
        </div>

        <div className="flex items-center space-x-6 text-sm">
          <div 
            className="relative hover:border border-white p-1 cursor-pointer"
            onMouseEnter={() => setShowAccountMenu(true)}
            onMouseLeave={() => setShowAccountMenu(false)}
          >
            <div className="text-xs">
              {loading ? 'Loading...' : user ? `Hello, ${user.user_metadata?.full_name || 'User'}` : 'Hello, Sign in'}
            </div>
            <div className="font-bold flex items-center">
              Account & Lists
              <i className="ri-arrow-down-s-line w-4 h-4 flex items-center justify-center ml-1"></i>
            </div>
            {showAccountMenu && (
              <div className="absolute top-full right-0 mt-1 bg-white text-black rounded shadow-lg w-64 z-50">
                {!user ? (
                  <div className="p-4">
                    <Link 
                      href="/auth/login" 
                      className="bg-[#febd69] hover:bg-[#f3a847] text-black px-4 py-2 rounded block text-center mb-3 whitespace-nowrap"
                      onClick={() => setShowAccountMenu(false)}
                    >
                      Sign In
                    </Link>
                    <div className="text-sm">
                      New customer? <Link href="/auth/register" className="text-blue-600 hover:underline" onClick={() => setShowAccountMenu(false)}>Start here.</Link>
                    </div>
                  </div>
                ) : (
                  <div className="p-4">
                    <div className="font-semibold mb-2">Welcome back!</div>
                    <div className="text-sm text-gray-600 mb-3">{user.email}</div>
                    <button
                      onClick={handleSignOut}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded block text-center w-full whitespace-nowrap"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
                <div className="border-t">
                  <div className="p-2">
                    <div className="font-bold text-sm mb-2">Your Lists</div>
                    <Link href="/wishlist" className="block py-1 text-sm hover:underline" onClick={() => setShowAccountMenu(false)}>Create a List</Link>
                    <Link href="/wishlist" className="block py-1 text-sm hover:underline" onClick={() => setShowAccountMenu(false)}>Find a List or Registry</Link>
                  </div>
                </div>
                <div className="border-t">
                  <div className="p-2">
                    <div className="font-bold text-sm mb-2">Your Account</div>
                    <Link href="/orders" className="block py-1 text-sm hover:underline" onClick={() => setShowAccountMenu(false)}>Your Orders</Link>
                    <Link href="/profile" className="block py-1 text-sm hover:underline" onClick={() => setShowAccountMenu(false)}>Your Account</Link>
                    <Link href="/wishlist" className="block py-1 text-sm hover:underline" onClick={() => setShowAccountMenu(false)}>Your Wish List</Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Link href="/orders" className="hover:border border-white p-1 cursor-pointer">
            <div className="text-xs">Returns</div>
            <div className="font-bold">& Orders</div>
          </Link>

          <Link href="/cart" className="hover:border border-white p-1 cursor-pointer flex items-center">
            <div className="relative">
              <i className="ri-shopping-cart-line w-8 h-8 flex items-center justify-center text-2xl"></i>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#febd69] text-black text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </div>
            <div className="ml-1">
              <div className="text-xs">Cart</div>
            </div>
          </Link>
        </div>
      </div>

      <div className="bg-[#37475a] px-4 py-2">
        <div className="flex items-center space-x-6 text-sm">
          <div className="flex items-center space-x-1 hover:border border-white p-1 cursor-pointer">
            <i className="ri-menu-line w-4 h-4 flex items-center justify-center"></i>
            <span>All</span>
          </div>
          <Link href="/category/electronics" className="hover:border border-white p-1 cursor-pointer whitespace-nowrap">Electronics</Link>
          <Link href="/category/fashion" className="hover:border border-white p-1 cursor-pointer whitespace-nowrap">Fashion</Link>
          <Link href="/category/books" className="hover:border border-white p-1 cursor-pointer whitespace-nowrap">Books</Link>
          <Link href="/category/home" className="hover:border border-white p-1 cursor-pointer whitespace-nowrap">Home & Garden</Link>
          <Link href="/category/sports" className="hover:border border-white p-1 cursor-pointer whitespace-nowrap">Sports & Outdoors</Link>
          <Link href="/category/grocery" className="hover:border border-white p-1 cursor-pointer whitespace-nowrap">Grocery</Link>
          <Link href="/category/appliances" className="hover:border border-white p-1 cursor-pointer whitespace-nowrap">Appliances</Link>
          <Link href="/category/solar" className="hover:border border-white p-1 cursor-pointer whitespace-nowrap">Solar</Link>
          <Link href="/category/pharmacy" className="hover:border border-white p-1 cursor-pointer whitespace-nowrap">Pharmacy</Link>
          <Link href="/deals" className="hover:border border-white p-1 cursor-pointer whitespace-nowrap">Today's Deals</Link>
          <Link href="/prime" className="hover:border border-white p-1 cursor-pointer whitespace-nowrap">Prime</Link>
          <Link href="/contact" className="hover:border border-white p-1 cursor-pointer whitespace-nowrap">Contact Us</Link>
        </div>
      </div>
    </header>
  );
}
