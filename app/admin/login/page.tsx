'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAdminAuth } from '../../../contexts/AdminAuthContext';

export default function AdminLogin() {
  const [username, setUsername] = useState('admin@ritzone.com');
  const [password, setPassword] = useState('RitZone@Admin2025!');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { login, isAuthenticated } = useAdminAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/admin');
    }
  }, [isAuthenticated, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const success = await login(username, password, rememberMe);
      
      if (success) {
        // Redirect will happen automatically due to useEffect above
        router.push('/admin');
      } else {
        setError('Invalid email or password. Please check your credentials.');
      }
    } catch (error) {
      setError('Login failed. Please try again.');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* 3D Animated Background */}
      <div className="absolute inset-0 z-0">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900"></div>
        
        {/* Animated Geometric Shapes */}
        <div className="absolute inset-0">
          {/* Floating Cubes */}
          <div className="absolute top-20 left-20 w-16 h-16 bg-gradient-to-r from-pink-500 to-violet-500 rounded-lg shadow-lg animate-bounce opacity-80 transform rotate-45"></div>
          <div className="absolute top-40 right-32 w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full shadow-lg animate-pulse opacity-70"></div>
          <div className="absolute bottom-32 left-32 w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg shadow-lg animate-spin opacity-60 transform rotate-12" style={{ animationDuration: '6s' }}></div>
          <div className="absolute bottom-20 right-20 w-14 h-14 bg-gradient-to-r from-orange-500 to-red-500 rounded-full shadow-lg animate-bounce opacity-75" style={{ animationDelay: '1s' }}></div>
          
          {/* Floating Orbs */}
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full blur-xl opacity-25 animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 right-1/3 w-24 h-24 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full blur-lg opacity-35 animate-pulse" style={{ animationDelay: '3s' }}></div>
        </div>

        {/* Animated Grid Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full" style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
            animation: 'moveGrid 20s linear infinite'
          }}></div>
        </div>
      </div>

      {/* Login Form */}
      <div className="relative z-10 max-w-md w-full">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
          {/* Welcome Message */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-6">
              <span className="text-4xl font-['Pacifico'] text-white drop-shadow-lg">RitZone</span>
            </Link>
            <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">
              Welcome!
            </h1>
            <h2 className="text-2xl font-semibold text-yellow-300 mb-3 drop-shadow-lg">
              BOSS Sir Rit Mukherjee!
            </h2>
            <p className="text-white/80 text-lg">Admin Panel Access</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Username Field */}
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Username / Email
              </label>
              <input
                type="email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent backdrop-blur-sm text-white placeholder-white/50 transition-all duration-300"
                placeholder="admin@ritzone.com"
                required
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent backdrop-blur-sm text-white placeholder-white/50 transition-all duration-300"
                placeholder="Enter your password"
                required
              />
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-purple-400 focus:ring-purple-400 border-white/20 rounded bg-white/10 transition-all duration-300"
              />
              <label htmlFor="rememberMe" className="ml-2 block text-sm text-white/90">
                Remember Me (Stay logged in on this device)
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/20 border border-red-400/50 text-red-200 px-4 py-3 rounded-xl text-sm backdrop-blur-sm">
                {error}
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
                isLoading 
                  ? 'bg-white/20 text-white/50 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing In...
                </div>
              ) : (
                'Sign In to Admin Panel'
              )}
            </button>
          </form>

          {/* Default Credentials Info */}
          <div className="mt-8 p-4 bg-blue-500/20 border border-blue-400/30 rounded-xl backdrop-blur-sm">
            <h3 className="font-medium text-blue-200 mb-2">Default Credentials:</h3>
            <p className="text-sm text-blue-100 font-mono">
              Email: <span className="bg-blue-400/20 px-2 py-1 rounded">admin@ritzone.com</span>
            </p>
            <p className="text-sm text-blue-100 font-mono mt-1">
              Password: <span className="bg-blue-400/20 px-2 py-1 rounded">RitZone@Admin2025!</span>
            </p>
          </div>

          {/* Back to Site Link */}
          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-white/70 hover:text-white transition-colors duration-300 hover:underline">
              ← Back to RitZone Website
            </Link>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes moveGrid {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
      `}</style>
    </div>
  );
}