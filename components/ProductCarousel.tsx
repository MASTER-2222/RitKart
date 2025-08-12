
'use client';
import { useState } from 'react';
import ProductCard from './ProductCard';

interface Product {
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

interface ProductCarouselProps {
  title: string;
  products: Product[];
}

export default function ProductCarousel({ title, products }: ProductCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = 4;
  const maxIndex = Math.max(0, products.length - itemsPerPage);

  const nextSlide = () => {
    setCurrentIndex(prev => Math.min(prev + 1, maxIndex));
  };

  const prevSlide = () => {
    setCurrentIndex(prev => Math.max(prev - 1, 0));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        <div className="flex space-x-2">
          <button
            onClick={prevSlide}
            disabled={currentIndex === 0}
            className="p-2 rounded-full border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i className="ri-arrow-left-line w-5 h-5 flex items-center justify-center"></i>
          </button>
          <button
            onClick={nextSlide}
            disabled={currentIndex >= maxIndex}
            className="p-2 rounded-full border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i className="ri-arrow-right-line w-5 h-5 flex items-center justify-center"></i>
          </button>
        </div>
      </div>
      
      <div className="relative overflow-hidden">
        <div 
          className="flex transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * (100 / itemsPerPage)}%)` }}
        >
          {products.map((product) => (
            <div key={product.id} className="w-1/4 flex-shrink-0 px-2">
              <ProductCard {...product} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
