'use client';
import { useState } from 'react';
import ContentEditor from '../../../components/admin/ContentEditor';
import ImageManager from '../../../components/admin/ImageManager';

export default function HomepageManagement() {
  const [activeTab, setActiveTab] = useState('hero');

  const tabs = [
    { id: 'hero', label: 'Hero Section', icon: 'ri-image-line' },
    { id: 'categories', label: 'Categories', icon: 'ri-folder-line' },
    { id: 'banners', label: 'Banners', icon: 'ri-gallery-line' },
    { id: 'content', label: 'Content', icon: 'ri-file-text-line' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Homepage Management</h2>
        
        <div className="flex space-x-1 mb-6 border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-2 rounded-t-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <i className={`${tab.icon} w-4 h-4 flex items-center justify-center mr-2`}></i>
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'hero' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ContentEditor
                title="Hero Title"
                content="Discover Amazing Products at RitZone"
                placeholder="Enter hero title..."
              />
              <ContentEditor
                title="Hero Subtitle"
                content="Shop millions of products with fast delivery and great deals"
                placeholder="Enter hero subtitle..."
                isTextarea={true}
              />
            </div>
            <ImageManager
              title="Hero Background Image"
              currentImage="https://readdy.ai/api/search-image?query=ecommerce%20shopping%20online%20retail%20modern%20website%20hero%20background%20vibrant%20colors%20technology%20digital%20commerce%20clean%20professional&width=1200&height=600&seq=heroecommerce&orientation=landscape"
            />
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {['Electronics', 'Fashion', 'Books', 'Home & Garden', 'Sports', 'Grocery'].map((category) => (
                <div key={category} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">{category}</h3>
                  <ImageManager
                    title={`${category} Image`}
                    currentImage={`https://readdy.ai/api/search-image?query=${category.toLowerCase().replace('&', 'and')} products category ecommerce clean background modern design&width=300&height=200&seq=${category.toLowerCase().replace(/[^a-z]/g, '')}&orientation=landscape`}
                    compact={true}
                  />
                  <div className="mt-3">
                    <input
                      type="text"
                      defaultValue={category}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Category name"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'banners' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ImageManager
                title="Main Banner"
                currentImage="https://readdy.ai/api/search-image?query=ecommerce%20sale%20banner%20promotion%20discount%20shopping%20deals%20modern%20design%20colorful%20attractive%20marketing&width=600&height=300&seq=mainbanner&orientation=landscape"
              />
              <ImageManager
                title="Secondary Banner"
                currentImage="https://readdy.ai/api/search-image?query=special%20offer%20promotion%20banner%20ecommerce%20website%20modern%20design%20attractive%20colors%20sale%20discount&width=600&height=300&seq=secondbanner&orientation=landscape"
              />
            </div>
            <ImageManager
              title="Full Width Promotional Banner"
              currentImage="https://readdy.ai/api/search-image?query=full%20width%20promotional%20banner%20ecommerce%20website%20sale%20discount%20special%20offer%20modern%20design%20vibrant%20colors&width=1200&height=200&seq=fullwidthbanner&orientation=landscape"
            />
          </div>
        )}

        {activeTab === 'content' && (
          <div className="space-y-6">
            <ContentEditor
              title="Welcome Message"
              content="Welcome to RitZone - Your One-Stop Shopping Destination"
              placeholder="Enter welcome message..."
            />
            <ContentEditor
              title="About Section"
              content="Discover millions of products with fast delivery, great deals, and excellent customer service. Shop with confidence at RitZone."
              placeholder="Enter about section content..."
              isTextarea={true}
            />
            <ContentEditor
              title="Featured Section Title"
              content="Featured Products"
              placeholder="Enter featured section title..."
            />
            <ContentEditor
              title="Newsletter Signup Text"
              content="Subscribe to get special offers and updates"
              placeholder="Enter newsletter signup text..."
            />
          </div>
        )}

        <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
          <button className="px-6 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors whitespace-nowrap">
            Reset Changes
          </button>
          <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors whitespace-nowrap">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}