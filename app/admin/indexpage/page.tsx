'use client';
import { useState, useEffect } from 'react';
import HeroSectionManager from '../../../components/admin/HeroSectionManager';
import CategorySectionManager from '../../../components/admin/CategorySectionManager';
import FeaturedProductsManager from '../../../components/admin/FeaturedProductsManager';
import ElectronicsProductsManager from '../../../components/admin/ElectronicsProductsManager';
import { apiClient } from '../../../utils/api';

export default function IndexPageManagement() {
  const [activeTab, setActiveTab] = useState('hero');
  const [loading, setLoading] = useState(true);
  const [sectionsData, setSectionsData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const tabs = [
    { id: 'hero', label: 'Hero Section', icon: 'ri-image-line', description: 'Manage slider images and text content' },
    { id: 'categories', label: 'Shop by Category', icon: 'ri-folder-line', description: 'Manage category images and text' },
    { id: 'featured', label: 'Featured Products', icon: 'ri-star-line', description: 'Manage featured products section' },
    { id: 'electronics', label: 'Bestsellers in Electronics', icon: 'ri-computer-line', description: 'Manage electronics bestsellers section' },
  ];

  useEffect(() => {
    fetchSectionsData();
  }, []);

  const fetchSectionsData = async () => {
    try {
      setLoading(true);
      // This will call our new API endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8001/api'}/admin/homepage/sections`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setSectionsData(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch sections data');
      }
    } catch (err) {
      console.error('Error fetching sections data:', err);
      setError('Failed to load sections data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSectionUpdate = (sectionType: string) => {
    console.log(`Section ${sectionType} updated, refreshing data...`);
    fetchSectionsData(); // Refresh data after update
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Index Page Management</h2>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading index page sections...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Index Page Management</h2>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="text-red-600 mb-4">
                <i className="ri-error-warning-line w-12 h-12 flex items-center justify-center mx-auto mb-2 text-4xl"></i>
                {error}
              </div>
              <button
                onClick={fetchSectionsData}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Index Page Management</h2>
          <p className="text-gray-600">
            Manage all content sections displayed on your main index page. Changes will be reflected immediately on the frontend.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-3 rounded-t-lg font-medium transition-colors whitespace-nowrap group ${
                activeTab === tab.id
                  ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <i className={`${tab.icon} w-4 h-4 flex items-center justify-center mr-2`}></i>
              <div className="text-left">
                <div className="text-sm font-semibold">{tab.label}</div>
                <div className="text-xs opacity-75 hidden lg:block">{tab.description}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Hero Section Management */}
        {activeTab === 'hero' && sectionsData && (
          <HeroSectionManager 
            banners={sectionsData.hero_section.banners}
            onUpdate={() => handleSectionUpdate('hero')}
          />
        )}

        {/* Category Section Management */}
        {activeTab === 'categories' && sectionsData && (
          <CategorySectionManager 
            categories={sectionsData.categories_section.categories}
            onUpdate={() => handleSectionUpdate('categories')}
          />
        )}

        {/* Featured Products Management */}
        {activeTab === 'featured' && sectionsData && (
          <FeaturedProductsManager 
            products={sectionsData.featured_section.products}
            onUpdate={() => handleSectionUpdate('featured')}
          />
        )}

        {/* Electronics Products Management */}
        {activeTab === 'electronics' && sectionsData && (
          <ElectronicsProductsManager 
            products={sectionsData.electronics_section.products}
            onUpdate={() => handleSectionUpdate('electronics')}
          />
        )}
      </div>
    </div>
  );
}