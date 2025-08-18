'use client';
import React, { useState } from 'react';
import { UserReview, apiClient } from '../utils/api';
import StarRating from './StarRating';

interface UserReviewsListProps {
  reviews: UserReview[];
  onReviewUpdated: (review: UserReview) => void;
  onReviewDeleted: (reviewId: string) => void;
  currentUserId?: string;
}

export default function UserReviewsList({
  reviews,
  onReviewUpdated,
  onReviewDeleted,
  currentUserId
}: UserReviewsListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) {
      return;
    }

    setDeletingId(reviewId);
    try {
      const response = await apiClient.deleteReview(reviewId);
      if (response.success) {
        onReviewDeleted(reviewId);
      } else {
        alert('Failed to delete review: ' + response.message);
      }
    } catch (error: any) {
      console.error('Delete review error:', error);
      alert('Failed to delete review. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 text-4xl mb-2">💭</div>
        <p className="text-gray-600">No customer reviews yet</p>
        <p className="text-sm text-gray-500 mt-1">Be the first to share your experience!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review.id} className="border rounded-lg p-6">
          {/* Review Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {review.user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{review.user.name}</p>
                <p className="text-sm text-gray-500">{formatDate(review.created_at)}</p>
              </div>
            </div>
            
            {/* User Actions */}
            {currentUserId && currentUserId === review.user.id && (
              <div className="flex space-x-2">
                <button
                  onClick={() => {/* Handle edit - would need to implement edit modal/form */}}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(review.id)}
                  disabled={deletingId === review.id}
                  className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
                >
                  {deletingId === review.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            )}
          </div>

          {/* Rating */}
          <div className="mb-3">
            <StarRating
              rating={review.rating}
              onRatingChange={() => {}}
              readonly={true}
              showLabel={false}
            />
          </div>

          {/* Review Text */}
          <div className="mb-4">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {review.review_text}
            </p>
          </div>

          {/* Review Images */}
          {review.images && review.images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
              {review.images.map((image, index) => (
                <img
                  key={index}
                  src={`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8001'}${image}`}
                  alt={`Review image ${index + 1}`}
                  className="w-full h-20 object-cover rounded-md border hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    // Could open in modal for full view
                    window.open(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8001'}${image}`, '_blank');
                  }}
                />
              ))}
            </div>
          )}

          {/* Updated indicator */}
          {review.updated_at !== review.created_at && (
            <p className="text-xs text-gray-400">
              Last updated: {formatDate(review.updated_at)}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}