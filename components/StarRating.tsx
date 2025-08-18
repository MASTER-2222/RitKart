'use client';
import React, { useState } from 'react';

interface StarRatingProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6'
};

const ratingLabels = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Very Good',
  5: 'Excellent'
};

export default function StarRating({ 
  rating, 
  onRatingChange, 
  readonly = false, 
  size = 'md',
  showLabel = false 
}: StarRatingProps) {
  const [hover, setHover] = useState(0);

  const handleClick = (value: number) => {
    if (!readonly) {
      onRatingChange(value);
    }
  };

  const handleMouseEnter = (value: number) => {
    if (!readonly) {
      setHover(value);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHover(0);
    }
  };

  const getStarClass = (starValue: number) => {
    const currentRating = hover || rating;
    const baseClasses = `${sizeClasses[size]} transition-colors duration-150`;
    
    if (readonly) {
      if (starValue <= Math.floor(currentRating)) {
        return `${baseClasses} ri-star-fill text-yellow-400`;
      } else if (starValue - 0.5 <= currentRating) {
        return `${baseClasses} ri-star-half-fill text-yellow-400`;
      } else {
        return `${baseClasses} ri-star-line text-gray-300`;
      }
    } else {
      // Interactive mode
      if (starValue <= currentRating) {
        return `${baseClasses} ri-star-fill text-yellow-400 cursor-pointer hover:text-yellow-500`;
      } else {
        return `${baseClasses} ri-star-line text-gray-300 cursor-pointer hover:text-yellow-300`;
      }
    }
  };

  return (
    <div className="flex items-center space-x-1">
      <div className="flex items-center space-x-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <i
            key={star}
            className={getStarClass(star)}
            onClick={() => handleClick(star)}
            onMouseEnter={() => handleMouseEnter(star)}
            onMouseLeave={handleMouseLeave}
          />
        ))}
      </div>
      
      {showLabel && (
        <span className="text-sm text-gray-600 ml-2">
          {readonly 
            ? `${rating} out of 5`
            : (hover ? ratingLabels[hover as keyof typeof ratingLabels] : ratingLabels[rating as keyof typeof ratingLabels] || 'Rate this product')
          }
        </span>
      )}
    </div>
  );
}