'use client';
import React, { useState } from 'react';
import { apiClient, UserReview } from '../utils/api';
import StarRating from './StarRating';
import ImageUpload from './ImageUpload';

interface UserReviewFormProps {
  productId: string;
  onReviewSubmitted: (review: UserReview) => void;
  existingReview?: UserReview;
  onCancel?: () => void;
}

export default function UserReviewForm({
  productId,
  onReviewSubmitted,
  existingReview,
  onCancel
}: UserReviewFormProps) {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [reviewText, setReviewText] = useState(existingReview?.review_text || '');
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!existingReview;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    if (reviewText.length < 10) {
      setError('Review must be at least 10 characters long');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('productId', productId);
      formData.append('rating', rating.toString());
      formData.append('reviewText', reviewText);

      // Append images
      images.forEach((image) => {
        formData.append('images', image);
      });

      // If editing, add images to remove (if any)
      if (isEditing && existingReview) {
        // For now, we'll keep existing images and just add new ones
        // In a full implementation, you'd handle removing specific images
      }

      let response;
      if (isEditing && existingReview) {
        response = await apiClient.updateReview(existingReview.id, formData);
      } else {
        response = await apiClient.createReview(formData);
      }

      if (response.success) {
        onReviewSubmitted(response.data);
        // Reset form if creating new review
        if (!isEditing) {
          setRating(0);
          setReviewText('');
          setImages([]);
        }
      } else {
        setError(response.message || 'Failed to submit review');
      }
    } catch (error: any) {
      console.error('Review submission error:', error);
      setError(error.message || 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white border rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">
        {isEditing ? 'Edit Your Review' : 'Write a Review'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Rating *
          </label>
          <StarRating
            rating={rating}
            onRatingChange={setRating}
            size="lg"
            showLabel={true}
          />
        </div>

        {/* Review Text */}
        <div>
          <label htmlFor="reviewText" className="block text-sm font-medium text-gray-700 mb-2">
            Your Review *
          </label>
          <textarea
            id="reviewText"
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="Share your experience with this product..."
            minLength={10}
            maxLength={2000}
            required
          />
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>Minimum 10 characters</span>
            <span>{reviewText.length}/2000</span>
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Add Photos (Optional)
          </label>
          <ImageUpload
            images={images}
            onImagesChange={setImages}
            maxImages={5}
            maxSizePerFile={20}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={isSubmitting || rating === 0}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              isSubmitting || rating === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isEditing ? 'Updating...' : 'Submitting...'}
              </span>
            ) : (
              isEditing ? 'Update Review' : 'Submit Review'
            )}
          </button>
          
          {(isEditing || onCancel) && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}