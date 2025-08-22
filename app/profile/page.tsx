'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import UserProfileSidebar from '../../components/profile/UserProfileSidebar';
import PersonalInfo from '../../components/profile/PersonalInfo';
import MyOrders from '../../components/profile/MyOrders';
import Wishlist from '../../components/profile/Wishlist';
import AddressBook from '../../components/profile/AddressBook';
import PaymentMethods from '../../components/profile/PaymentMethods';
import ProfileDashboard from '../../components/profile/ProfileDashboard';

function ProfileContent() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const searchParams = useSearchParams();

  // Check for section parameter and set active section accordingly
  useEffect(() => {
    const section = searchParams.get('section');
    if (section && ['dashboard', 'personal-info', 'orders', 'wishlist', 'addresses', 'payments'].includes(section)) {
      setActiveSection(section);
    }
  }, [searchParams]);

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <ProfileDashboard />;
      case 'personal-info':
        return <PersonalInfo />;
      case 'orders':
        return <MyOrders />;
      case 'wishlist':
        return <Wishlist />;
      case 'addresses':
        return <AddressBook />;
      case 'payments':
        return <PaymentMethods />;
      default:
        return <ProfileDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-64 flex-shrink-0">
            <UserProfileSidebar 
              activeSection={activeSection} 
              onSectionChange={setActiveSection}
            />
          </div>
          
          <div className="flex-1">
            {renderContent()}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    }>
      <ProfileContent />
    </Suspense>
  );
}