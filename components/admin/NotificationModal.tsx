'use client';
import React, { useState } from 'react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

interface NotificationModalProps {
  users: string[]; // Array of user IDs
  isBulk: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function NotificationModal({
  users,
  isBulk,
  onClose,
  onSuccess
}: NotificationModalProps) {
  const { adminUser } = useAdminAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: 'general',
    title: '',
    message: '',
    orderId: ''
  });

  const notificationTypes = [
    { value: 'general', label: 'General Announcement', icon: 'ri-notification-line' },
    { value: 'order_update', label: 'Order Update', icon: 'ri-shopping-bag-line' },
    { value: 'promotion', label: 'Promotion/Deal', icon: 'ri-gift-line' },
    { value: 'security', label: 'Security Alert', icon: 'ri-shield-line' },
    { value: 'welcome', label: 'Welcome Message', icon: 'ri-user-heart-line' },
    { value: 'reminder', label: 'Reminder', icon: 'ri-alarm-line' }
  ];

  const predefinedTemplates = {
    order_dispatched: {
      title: 'Your Order Has Been Dispatched!',
      message: 'Great news! Your order has been dispatched and is on its way to you. You can track your order using the tracking information provided.'
    },
    order_delivered: {
      title: 'Order Delivered Successfully',
      message: 'Your order has been delivered successfully. We hope you enjoy your purchase! Please rate your experience if you have a moment.'
    },
    order_cancelled: {
      title: 'Order Cancellation Notice',
      message: 'We regret to inform you that your order has been cancelled. If you have any questions, please contact our customer support team.'
    },
    welcome_new_user: {
      title: 'Welcome to RitZone!',
      message: 'Welcome to RitZone! We\'re excited to have you as part of our community. Explore our wide range of products and enjoy exclusive deals.'
    },
    account_verification: {
      title: 'Please Verify Your Account',
      message: 'To complete your registration and access all features, please verify your email address by clicking the verification link sent to your email.'
    },
    promotional_offer: {
      title: 'Special Offer Just for You!',
      message: 'Don\'t miss out on our exclusive offers! Get up to 50% off on selected items. Limited time only!'
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isBulk ? '/api/admin/users/bulk-notify' : `/api/admin/users/${users[0]}/notify`;
      const body = isBulk 
        ? { userIds: users, ...formData }
        : formData;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminUser?.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();
      if (data.success) {
        onSuccess();
      } else {
        throw new Error(data.message || 'Failed to send notification');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      alert(error instanceof Error ? error.message : 'Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleTemplateSelect = (templateKey: string) => {
    const template = predefinedTemplates[templateKey as keyof typeof predefinedTemplates];
    if (template) {
      setFormData({
        ...formData,
        title: template.title,
        message: template.message
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Send Notification</h2>
              <p className="text-white/80">
                {isBulk 
                  ? `Send notification to ${users.length} selected users`
                  : 'Send notification to user'
                }
              </p>
            </div>
            <button
              onClick={onClose}
              className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition-colors"
              disabled={loading}
            >
              <i className="ri-close-line w-5 h-5"></i>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Quick Templates */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Quick Templates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(predefinedTemplates).map(([key, template]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleTemplateSelect(key)}
                  className="p-3 text-left border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="font-medium text-gray-900 text-sm">{template.title}</div>
                  <div className="text-xs text-gray-500 truncate">{template.message}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Notification Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notification Type
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {notificationTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notification Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              maxLength={100}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter notification title"
            />
            <div className="text-xs text-gray-500 mt-1">
              {formData.title.length}/100 characters
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message *
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              required
              rows={5}
              maxLength={500}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              placeholder="Enter your message here..."
            />
            <div className="text-xs text-gray-500 mt-1">
              {formData.message.length}/500 characters
            </div>
          </div>

          {/* Order ID (optional) */}
          {formData.type === 'order_update' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Related Order ID (Optional)
              </label>
              <input
                type="text"
                name="orderId"
                value={formData.orderId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter order ID if this is related to a specific order"
              />
            </div>
          )}

          {/* Preview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Preview</h4>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <i className={`${notificationTypes.find(t => t.value === formData.type)?.icon || 'ri-notification-line'} w-5 h-5 text-purple-600`}></i>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">
                    {formData.title || 'Notification Title'}
                  </div>
                  <div className="text-gray-600 text-sm mt-1">
                    {formData.message || 'Your notification message will appear here...'}
                  </div>
                  <div className="text-xs text-gray-400 mt-2">
                    Just now • RitZone Admin
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.title || !formData.message}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <i className="ri-send-plane-line w-4 h-4 mr-2"></i>
                  {isBulk ? `Send to ${users.length} Users` : 'Send Notification'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}