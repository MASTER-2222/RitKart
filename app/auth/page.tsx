
'use client';
import { useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Link from 'next/link';

export default function AuthPage() {
  const [isSignIn, setIsSignIn] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignIn) {
      console.log('Sign in:', { email: formData.email, password: formData.password });
    } else {
      console.log('Sign up:', formData);
    }
  };

  const handleGoogleSignIn = () => {
    console.log('Google sign in');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-md mx-auto px-6 py-12">
        <div className="bg-white rounded-lg shadow-lg border p-8">
          <div className="text-center mb-8">
            <Link href="/" className="flex items-center justify-center mb-6">
              <span className="text-2xl font-['Pacifico'] text-[#232f3e]">RitZone</span>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">
              {isSignIn ? 'Sign In' : 'Create Account'}
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isSignIn && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your name
                </label>
                <input
                  type="text"
                  required={!isSignIn}
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#febd69] focus:border-transparent"
                  placeholder="First and last name"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#febd69] focus:border-transparent"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#febd69] focus:border-transparent"
                placeholder="Enter your password"
                minLength={6}
              />
              {!isSignIn && (
                <p className="text-xs text-gray-600 mt-1">
                  Passwords must be at least 6 characters.
                </p>
              )}
            </div>

            {!isSignIn && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required={!isSignIn}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#febd69] focus:border-transparent"
                  placeholder="Confirm your password"
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-[#febd69] hover:bg-[#f3a847] text-black font-semibold py-3 px-6 rounded-lg transition-colors whitespace-nowrap"
            >
              {isSignIn ? 'Sign In' : 'Create your RitZone account'}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or</span>
              </div>
            </div>

            <button
              onClick={handleGoogleSignIn}
              className="mt-4 w-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2 whitespace-nowrap"
            >
              <i className="ri-google-line w-5 h-5 flex items-center justify-center"></i>
              <span>Continue with Google</span>
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {isSignIn ? "Don't have an account?" : "Already have an account?"}{' '}
              <button
                onClick={() => setIsSignIn(!isSignIn)}
                className="text-blue-600 hover:underline font-medium"
              >
                {isSignIn ? 'Create your RitZone account' : 'Sign in'}
              </button>
            </p>
          </div>

          {isSignIn && (
            <div className="mt-4 text-center">
              <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
                Forgot your password?
              </Link>
            </div>
          )}

          <div className="mt-8 text-xs text-gray-500 text-center">
            By {isSignIn ? 'signing in' : 'creating an account'}, you agree to RitZone's{' '}
            <Link href="/conditions" className="text-blue-600 hover:underline">
              Conditions of Use
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-blue-600 hover:underline">
              Privacy Notice
            </Link>
            .
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            {isSignIn ? 'New to RitZone?' : 'Benefits of your RitZone account'}
          </h2>
          
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start space-x-2">
              <i className="ri-check-line w-5 h-5 flex items-center justify-center text-green-600 mt-0.5"></i>
              <span>Fast, free delivery with Prime</span>
            </div>
            <div className="flex items-start space-x-2">
              <i className="ri-check-line w-5 h-5 flex items-center justify-center text-green-600 mt-0.5"></i>
              <span>Exclusive access to movies and TV shows with Prime Video</span>
            </div>
            <div className="flex items-start space-x-2">
              <i className="ri-check-line w-5 h-5 flex items-center justify-center text-green-600 mt-0.5"></i>
              <span>A world of listening with Prime Music</span>
            </div>
            <div className="flex items-start space-x-2">
              <i className="ri-check-line w-5 h-5 flex items-center justify-center text-green-600 mt-0.5"></i>
              <span>Easy returns and exchanges</span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
