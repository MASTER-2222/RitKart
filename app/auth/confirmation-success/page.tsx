'use client';

import Link from 'next/link';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const message = searchParams.get('message') || 'Email confirmed successfully!';

  return (
    <div className="flex min-h-[calc(100vh-160px)] flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="mt-4 text-3xl font-bold text-gray-900">Email Verified Successfully!</h1>
          <p className="mt-2 text-sm text-gray-600">
            {message}
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
          <div className="space-y-4">
            <div className="rounded-md bg-green-50 border border-green-200 p-4">
              <div className="text-sm text-green-700">
                <p className="font-medium mb-2">Welcome to RitZone!</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Your email has been verified successfully</li>
                  <li>You can now sign in to your account</li>
                  <li>Start exploring millions of products</li>
                  <li>Enjoy personalized shopping experience</li>
                </ul>
              </div>
            </div>

            <div className="space-y-3">
              <Link
                href="/auth/login"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#febd69] hover:bg-[#f3a847] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                Sign In to Your Account
              </Link>
              
              <Link
                href="/"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-orange-600 bg-orange-50 hover:bg-orange-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                Start Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EmailConfirmationSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <Suspense fallback={
        <div className="flex min-h-[calc(100vh-160px)] items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      }>
        <ConfirmationContent />
      </Suspense>

      <Footer />
    </div>
  );
}