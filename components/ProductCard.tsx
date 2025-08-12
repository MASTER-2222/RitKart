
'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrency } from '../contexts/CurrencyContext';

interface ProductCardProps {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  image: string;
  isPrime?: boolean;
  isDeliveryTomorrow?: boolean;
  discount?: number;
  // NEW: Backend-provided currency fields
  currency?: string;
  currency_symbol?: string;
  formatted_price?: string;
  formatted_original_price?: string;
}

export default function ProductCard({ 
  id, 
  title, 
  price, 
  originalPrice, 
  rating, 
  reviewCount, 
  image, 
  isPrime = false,
  isDeliveryTomorrow = false,
  discount,
  // NEW: Backend currency fields
  currency = 'INR',
  currency_symbol = '₹',
  formatted_price,
  formatted_original_price
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();
  const { selectedCurrency } = useCurrency();

  // NEW: Use backend-formatted prices if available, fallback to manual formatting with selected currency
  const displayPrice = formatted_price || `${selectedCurrency.symbol}${price.toFixed(2)}`;
  const displayOriginalPrice = formatted_original_price || 
    (originalPrice ? `${selectedCurrency.symbol}${originalPrice.toFixed(2)}` : null);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // TODO: Add cart functionality here
    console.log(`Adding product ${id} to cart`);
    
    // Navigate to product page after adding to cart
    router.push(`/product/${id}`);
  };

  const handleCardClick = () => {
    router.push(`/product/${id}`);
  };

  // Show currency badge if displaying non-INR currency
  const showCurrencyBadge = currency !== 'INR' && currency !== selectedCurrency.code;

  return (
    <div 
      className="bg-white rounded-lg shadow-sm border hover:shadow-lg transition-shadow duration-200 p-4 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      <div className="relative mb-3">
        <img 
          src={image}
          alt={title}
          className="w-full h-48 object-cover rounded"
        />
        {discount && (
          <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 text-xs font-bold rounded">
            -{discount}%
          </div>
        )}
        {isPrime && (
          <div className="absolute top-2 right-2">
            <div className="bg-blue-500 text-white px-2 py-1 text-xs font-bold rounded">
              Prime
            </div>
          </div>
        )}
        {/* NEW: Currency indicator badge */}
        {showCurrencyBadge && (
          <div className="absolute bottom-2 left-2 bg-orange-500 text-white px-2 py-1 text-xs font-bold rounded">
            {currency}
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 hover:text-blue-600">
          {title}
        </h3>
        
        <div className="flex items-center space-x-1">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <i 
                key={star}
                className={`w-4 h-4 flex items-center justify-center ${
                  star <= Math.floor(rating) 
                    ? 'ri-star-fill text-yellow-400' 
                    : star - 0.5 <= rating 
                      ? 'ri-star-half-fill text-yellow-400'
                      : 'ri-star-line text-gray-300'
                }`}
              ></i>
            ))}
          </div>
          <span className="text-sm text-gray-600">({reviewCount})</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-lg font-bold text-gray-900">
            {displayPrice}
          </span>
          {displayOriginalPrice && originalPrice && originalPrice > price && (
            <span className="text-sm text-gray-500 line-through">
              {displayOriginalPrice}
            </span>
          )}
        </div>
        
        {isDeliveryTomorrow && (
          <div className="text-sm text-green-600">
            <i className="ri-truck-line w-4 h-4 inline-flex items-center justify-center mr-1"></i>
            FREE delivery tomorrow
          </div>
        )}
      </div>
      
      {isHovered && (
        <div className="mt-3">
          <button 
            onClick={handleAddToCart}
            className="w-full bg-[#febd69] hover:bg-[#f3a847] text-black font-medium py-2 px-4 rounded whitespace-nowrap"
          >
            Add to Cart
          </button>
        </div>
      )}
    </div>
  );
}
