'use client';
import { useState, useEffect } from 'react';
import ContentEditor from '../../../components/admin/ContentEditor';
import ImageManager from '../../../components/admin/ImageManager';
import apiClient from '../../../utils/api';

interface HomepageSection {
  id: string;
  section_name: string;
  section_title: string;
  section_subtitle: string;
  content: any[];
  images: any[];
}

export default function HomepageManagement() {
  const [activeTab, setActiveTab] = useState('hero');
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [saveMessage, setSaveMessage] = useState<string>('');

  const tabs = [
    { id: 'categories', label: 'Categories', icon: 'ri-folder-line' },
    { id: 'featured_products', label: 'Featured Products', icon: 'ri-star-line' },
    { id: 'bestsellers_electronics', label: 'Electronics Bestsellers', icon: 'ri-flashlight-line' },
    { id: 'prime_benefits', label: 'Prime Benefits', icon: 'ri-vip-crown-line' },
  ];

  // Load homepage sections from backend
  useEffect(() => {
    loadHomepageSections();
  }, []);

  const loadHomepageSections = async () => {
    try {
      setLoading(true);
      const result = await apiClient.getHomepageSections();
      
      if (result.success) {
        setSections(result.data || []);
      } else {
        setError(result.message || 'Failed to load sections');
      }
    } catch (err) {
      console.error('Load sections error:', err);
      setError('Failed to load homepage sections');
    } finally {
      setLoading(false);
    }
  };

  // Get section data by name
  const getSectionData = (sectionName: string) => {
    return sections.find(section => section.section_name === sectionName);
  };

  // Get content value by key
  const getContentValue = (sectionName: string, contentKey: string) => {
    const section = getSectionData(sectionName);
    if (!section?.content) return '';
    
    const contentItem = section.content.find((item: any) => item.key === contentKey);
    return contentItem?.value || '';
  };

  // Get image URL by key
  const getImageUrl = (sectionName: string, imageKey: string) => {
    const section = getSectionData(sectionName);
    if (!section?.images) return '';
    
    const imageItem = section.images.find((item: any) => item.key === imageKey);
    return imageItem?.url || '';
  };

  // Handle bulk save (for future enhancement)
  const handleBulkSave = async () => {
    setSaveMessage('✅ All sections are auto-saved individually');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handleRefresh = () => {
    loadHomepageSections();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading homepage sections...</p>
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
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={loadHomepageSections}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Homepage Management</h2>
          <div className="flex items-center space-x-4">
            {saveMessage && (
              <span className="text-sm text-green-600">{saveMessage}</span>
            )}
            <button
              onClick={handleRefresh}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              <i className="ri-refresh-line w-4 h-4 mr-1"></i>
              Refresh
            </button>
          </div>
        </div>
        
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

        {/* Hero Section */}
        {activeTab === 'hero' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ContentEditor
                title="Hero Title"
                content={getContentValue('hero', 'welcome_title') || 'Welcome to RitZone - Your One-Stop Shopping Destination'}
                placeholder="Enter hero title..."
                sectionName="hero"
                contentKey="welcome_title"
                onSave={loadHomepageSections}
              />
              <ContentEditor
                title="Hero Subtitle"
                content={getContentValue('hero', 'welcome_subtitle') || 'Discover millions of products with fast delivery, great deals, and excellent customer service'}
                placeholder="Enter hero subtitle..."
                isTextarea={true}
                sectionName="hero"
                contentKey="welcome_subtitle"
                onSave={loadHomepageSections}
              />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ContentEditor
                title="Call-to-Action Button Text"
                content={getContentValue('hero', 'cta_button_text') || 'Shop Now'}
                placeholder="Enter button text..."
                sectionName="hero"
                contentKey="cta_button_text"
                onSave={loadHomepageSections}
              />
            </div>
            <ImageManager
              title="Hero Background Image"
              currentImage={getImageUrl('hero', 'hero_background') || 'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=1200&h=400&fit=crop&crop=center'}
              sectionName="hero"
              imageKey="hero_background"
              onImageUpdate={loadHomepageSections}
            />
          </div>
        )}

        {/* Categories Section */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <ContentEditor
              title="Section Title"
              content={getSectionData('categories')?.section_title || 'Shop by Category'}
              placeholder="Enter section title..."
              sectionName="categories"
              contentKey="section_title"
              onSave={loadHomepageSections}
            />
            <ContentEditor
              title="Section Description"
              content={getContentValue('categories', 'section_description') || 'Browse our wide range of product categories'}
              placeholder="Enter section description..."
              isTextarea={true}
              sectionName="categories"
              contentKey="section_description"
              onSave={loadHomepageSections}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {['electronics', 'fashion', 'books', 'home', 'sports', 'grocery'].map((category) => (
                <div key={category} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 capitalize">{category.replace('_', ' & ')}</h3>
                  <ImageManager
                    title={`${category.charAt(0).toUpperCase() + category.slice(1)} Image`}
                    currentImage={getImageUrl('categories', `category_${category}`) || `https://images.unsplash.com/photo-1498049794561-7780e7231661?w=300&h=200&fit=crop`}
                    compact={true}
                    sectionName="categories"
                    imageKey={`category_${category}`}
                    onImageUpdate={loadHomepageSections}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Featured Products Section */}
        {activeTab === 'featured_products' && (
          <div className="space-y-6">
            <ContentEditor
              title="Section Title"
              content={getSectionData('featured_products')?.section_title || 'Featured Products'}
              placeholder="Enter section title..."
              sectionName="featured_products"
              contentKey="section_title"
              onSave={loadHomepageSections}
            />
            <ContentEditor
              title="Section Description"
              content={getContentValue('featured_products', 'section_description') || 'Carefully curated products just for you'}
              placeholder="Enter section description..."
              isTextarea={true}
              sectionName="featured_products"
              contentKey="section_description"
              onSave={loadHomepageSections}
            />
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-medium text-gray-900 mb-4">Product Selection</h3>
              <p className="text-gray-600 text-sm mb-4">
                Featured products are automatically selected from your product catalog based on the 'is_featured' flag. 
                To modify which products appear here, update the product settings in the Products section.
              </p>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                <i className="ri-external-link-line w-4 h-4 mr-1"></i>
                Manage Products
              </button>
            </div>
          </div>
        )}

        {/* Electronics Bestsellers Section */}
        {activeTab === 'bestsellers_electronics' && (
          <div className="space-y-6">
            <ContentEditor
              title="Section Title"
              content={getSectionData('bestsellers_electronics')?.section_title || 'Bestsellers in Electronics'}
              placeholder="Enter section title..."
              sectionName="bestsellers_electronics"
              contentKey="section_title"
              onSave={loadHomepageSections}
            />
            <ContentEditor
              title="Section Description"
              content={getContentValue('bestsellers_electronics', 'section_description') || 'Most popular electronics this month'}
              placeholder="Enter section description..."
              isTextarea={true}
              sectionName="bestsellers_electronics"
              contentKey="section_description"
              onSave={loadHomepageSections}
            />
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-medium text-gray-900 mb-4">Bestseller Selection</h3>
              <p className="text-gray-600 text-sm mb-4">
                Bestselling electronics are automatically selected based on ratings and reviews from the electronics category. 
                Products with higher ratings and more reviews appear first.
              </p>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                <i className="ri-external-link-line w-4 h-4 mr-1"></i>
                View Electronics Category
              </button>
            </div>
          </div>
        )}

        {/* Prime Benefits Section */}
        {activeTab === 'prime_benefits' && (
          <div className="space-y-6">
            <ContentEditor
              title="Section Title"
              content={getSectionData('prime_benefits')?.section_title || 'Prime Benefits'}
              placeholder="Enter section title..."
              sectionName="prime_benefits"
              contentKey="section_title"
              onSave={loadHomepageSections}
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ContentEditor
                title="Fast Delivery Title"
                content={getContentValue('prime_benefits', 'delivery_title') || 'Fast, Free Delivery'}
                placeholder="Enter delivery benefit title..."
                sectionName="prime_benefits"
                contentKey="delivery_title"
                onSave={loadHomepageSections}
              />
              <ContentEditor
                title="Fast Delivery Description"
                content={getContentValue('prime_benefits', 'delivery_description') || 'Free One-Day, Two-Day, and Same-Day delivery on millions of items'}
                placeholder="Enter delivery benefit description..."
                isTextarea={true}
                sectionName="prime_benefits"
                contentKey="delivery_description"
                onSave={loadHomepageSections}
              />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ContentEditor
                title="Prime Video Title"
                content={getContentValue('prime_benefits', 'video_title') || 'Prime Video'}
                placeholder="Enter video benefit title..."
                sectionName="prime_benefits"
                contentKey="video_title"
                onSave={loadHomepageSections}
              />
              <ContentEditor
                title="Prime Video Description"
                content={getContentValue('prime_benefits', 'video_description') || 'Watch thousands of popular movies and TV shows with Prime Video'}
                placeholder="Enter video benefit description..."
                isTextarea={true}
                sectionName="prime_benefits"
                contentKey="video_description"
                onSave={loadHomepageSections}
              />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ContentEditor
                title="Prime Music Title"
                content={getContentValue('prime_benefits', 'music_title') || 'Prime Music'}
                placeholder="Enter music benefit title..."
                sectionName="prime_benefits"
                contentKey="music_title"
                onSave={loadHomepageSections}
              />
              <ContentEditor
                title="Prime Music Description"
                content={getContentValue('prime_benefits', 'music_description') || 'Listen to 2 million songs and thousands of playlists ad-free'}
                placeholder="Enter music benefit description..."
                isTextarea={true}
                sectionName="prime_benefits"
                contentKey="music_description"
                onSave={loadHomepageSections}
              />
            </div>
            <ContentEditor
              title="Call-to-Action Button Text"
              content={getContentValue('prime_benefits', 'cta_button_text') || 'Try Prime Free for 30 Days'}
              placeholder="Enter button text..."
              sectionName="prime_benefits"
              contentKey="cta_button_text"
              onSave={loadHomepageSections}
            />
          </div>
        )}

        <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
          <button 
            onClick={handleRefresh}
            className="px-6 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors whitespace-nowrap">
            <i className="ri-refresh-line w-4 h-4 mr-2"></i>
            Refresh Data
          </button>
          <button 
            onClick={handleBulkSave}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors whitespace-nowrap">
            <i className="ri-save-line w-4 h-4 mr-2"></i>
            All Changes Saved
          </button>
        </div>
      </div>
    </div>
  );
}