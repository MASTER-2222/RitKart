'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../utils/supabase/client';

export default function WishlistPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          // User is not authenticated, redirect to login with wishlist redirect
          router.push('/auth/login?redirect=wishlist');
          return;
        }

        // User is authenticated, redirect to profile page with wishlist section active
        // Using URL hash to set the active section to wishlist
        router.push('/profile?section=wishlist');
        
      } catch (error) {
        console.error('Auth check failed:', error);
        // On error, redirect to login
        router.push('/auth/login?redirect=wishlist');
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndRedirect();
  }, [router, supabase.auth]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to your wishlist...</p>
        </div>
      </div>
    );
  }

  return null;
}