'use client';
import { useState, useEffect } from 'react';
import { apiClient, PaymentMethod } from '../../utils/api';

export default function PaymentMethods() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [paymentType, setPaymentType] = useState<'card' | 'upi'>('card');
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    upiId: ''
  });

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await apiClient.getPaymentMethods();
        
        if (response.success) {
          setPaymentMethods(response.data.paymentMethods || response.data || []);
        } else {
          setError(response.message || 'Failed to load payment methods');
        }
      } catch (err) {
        console.error('Error fetching payment methods:', err);
        setError('Failed to load payment methods. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentMethods();
  }, []);

  const handleAddPaymentMethod = async () => {
    try {
      setSaving(true);
      setError(null);
      
      const paymentData = {
        type: paymentType,
        name: paymentType === 'card' 
          ? `Card ending in ${formData.cardNumber.slice(-4)}`
          : `UPI - ${formData.upiId}`,
        details: paymentType === 'card'
          ? `**** **** **** ${formData.cardNumber.slice(-4)}`
          : formData.upiId,
        lastFour: paymentType === 'card' ? formData.cardNumber.slice(-4) : undefined,
        expiryDate: paymentType === 'card' ? formData.expiryDate : undefined,
        isDefault: paymentMethods.length === 0
      };

      const response = await apiClient.createPaymentMethod(paymentData);
      
      if (response.success) {
        setPaymentMethods(prev => [...prev, response.data.paymentMethod]);
        closeModal();
      } else {
        setError(response.message || 'Failed to add payment method');
      }
    } catch (err) {
      console.error('Error adding payment method:', err);
      setError('Failed to add payment method. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleEditPaymentMethod = (method: PaymentMethod) => {
    setEditingMethod(method);
    setPaymentType(method.type);
    if (method.type === 'card') {
      setFormData({
        cardNumber: '**** **** **** ' + method.lastFour,
        expiryDate: method.expiryDate || '',
        cvv: '',
        cardholderName: '',
        upiId: ''
      });
    } else {
      setFormData({
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        cardholderName: '',
        upiId: method.details
      });
    }
    setShowAddModal(true);
  };

  const handleUpdatePaymentMethod = async () => {
    if (!editingMethod) return;
    
    try {
      setSaving(true);
      setError(null);
      
      const paymentData = {
        type: paymentType,
        name: paymentType === 'card' 
          ? `Card ending in ${formData.cardNumber.slice(-4)}`
          : `UPI - ${formData.upiId}`,
        details: paymentType === 'card'
          ? `**** **** **** ${formData.cardNumber.slice(-4)}`
          : formData.upiId,
        lastFour: paymentType === 'card' ? formData.cardNumber.slice(-4) : undefined,
        expiryDate: paymentType === 'card' ? formData.expiryDate : undefined
      };

      const response = await apiClient.updatePaymentMethod(editingMethod.id, paymentData);
      
      if (response.success) {
        setPaymentMethods(prev => 
          prev.map(method => 
            method.id === editingMethod.id 
              ? { ...method, ...paymentData }
              : method
          )
        );
        closeModal();
      } else {
        setError(response.message || 'Failed to update payment method');
      }
    } catch (err) {
      console.error('Error updating payment method:', err);
      setError('Failed to update payment method. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePaymentMethod = async (methodId: string) => {
    try {
      const response = await apiClient.deletePaymentMethod(methodId);
      
      if (response.success) {
        setPaymentMethods(prev => prev.filter(method => method.id !== methodId));
      } else {
        setError(response.message || 'Failed to delete payment method');
      }
    } catch (err) {
      console.error('Error deleting payment method:', err);
      setError('Failed to delete payment method. Please try again.');
    }
  };

  const handleSetDefault = async (methodId: string) => {
    try {
      const response = await apiClient.updatePaymentMethod(methodId, { isDefault: true });
      
      if (response.success) {
        setPaymentMethods(prev => 
          prev.map(method => ({
            ...method,
            isDefault: method.id === methodId
          }))
        );
      } else {
        setError(response.message || 'Failed to set default payment method');
      }
    } catch (err) {
      console.error('Error setting default payment method:', err);
      setError('Failed to set default payment method. Please try again.');
    }
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingMethod(null);
    setPaymentType('card');
    setFormData({
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardholderName: '',
      upiId: ''
    });
  };

  const getPaymentIcon = (type: 'card' | 'upi', details: string) => {
    if (type === 'card') {
      if (details.includes('4567')) return 'ri-visa-line';
      if (details.includes('9012')) return 'ri-mastercard-line';
      return 'ri-bank-card-line';
    }
    return 'ri-smartphone-line';
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Payment Methods</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 whitespace-nowrap"
          >
            <i className="ri-add-line w-4 h-4 flex items-center justify-center"></i>
            <span>Add Payment Method</span>
          </button>
        </div>

        {paymentMethods.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <i className="ri-credit-card-line text-6xl"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No payment methods saved</h3>
            <p className="text-gray-600 mb-4">
              Add your preferred payment methods for faster checkout.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium whitespace-nowrap"
            >
              Add Payment Method
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {paymentMethods.map((method) => (
              <div key={method.id} className="border rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <i className={`${getPaymentIcon(method.type, method.details)} w-6 h-6 flex items-center justify-center text-gray-600`}></i>
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-gray-900">{method.name}</h3>
                      {method.isDefault && (
                        <span className="bg-green-100 text-green-800 px-2 py-1 text-xs font-medium rounded">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="text-gray-600">{method.details}</div>
                    {method.expiryDate && (
                      <div className="text-sm text-gray-500">Expires {method.expiryDate}</div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEditPaymentMethod(method)}
                    className="text-blue-600 hover:text-blue-800 font-medium text-sm whitespace-nowrap"
                  >
                    Edit
                  </button>
                  {!method.isDefault && (
                    <button
                      onClick={() => handleSetDefault(method.id)}
                      className="text-green-600 hover:text-green-800 font-medium text-sm whitespace-nowrap"
                    >
                      Set Default
                    </button>
                  )}
                  {paymentMethods.length > 1 && (
                    <button
                      onClick={() => handleDeletePaymentMethod(method.id)}
                      className="text-red-600 hover:text-red-800 font-medium text-sm whitespace-nowrap"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start space-x-3">
            <i className="ri-information-line w-5 h-5 flex items-center justify-center text-blue-600 mt-0.5"></i>
            <div className="text-sm">
              <div className="font-medium text-blue-900 mb-1">Security Notice</div>
              <div className="text-blue-800">
                Your payment information is encrypted and secure. We never store your complete card details or CVV numbers.
              </div>
            </div>
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-screen overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editingMethod ? 'Edit Payment Method' : 'Add Payment Method'}
            </h3>

            <div className="mb-4">
              <div className="flex space-x-4">
                <button
                  onClick={() => setPaymentType('card')}
                  className={`flex-1 p-3 rounded-lg border-2 transition-colors ${
                    paymentType === 'card'
                      ? 'border-blue-500 bg-blue-50 text-blue-900'
                      : 'border-gray-300 text-gray-600 hover:border-gray-400'
                  }`}
                >
                  <i className="ri-bank-card-line w-6 h-6 flex items-center justify-center mx-auto mb-2"></i>
                  <div className="text-sm font-medium">Credit/Debit Card</div>
                </button>
                <button
                  onClick={() => setPaymentType('upi')}
                  className={`flex-1 p-3 rounded-lg border-2 transition-colors ${
                    paymentType === 'upi'
                      ? 'border-blue-500 bg-blue-50 text-blue-900'
                      : 'border-gray-300 text-gray-600 hover:border-gray-400'
                  }`}
                >
                  <i className="ri-smartphone-line w-6 h-6 flex items-center justify-center mx-auto mb-2"></i>
                  <div className="text-sm font-medium">UPI</div>
                </button>
              </div>
            </div>

            {paymentType === 'card' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Card Number
                  </label>
                  <input
                    type="text"
                    value={formData.cardNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, cardNumber: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="1234 5678 9012 3456"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    value={formData.cardholderName}
                    onChange={(e) => setFormData(prev => ({ ...prev, cardholderName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="MM/YY"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CVV
                    </label>
                    <input
                      type="text"
                      value={formData.cvv}
                      onChange={(e) => setFormData(prev => ({ ...prev, cvv: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="123"
                      required
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  UPI ID
                </label>
                <input
                  type="text"
                  value={formData.upiId}
                  onChange={(e) => setFormData(prev => ({ ...prev, upiId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="username@paytm"
                  required
                />
              </div>
            )}

            <div className="flex space-x-3 mt-6">
              <button
                onClick={closeModal}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg whitespace-nowrap"
              >
                Cancel
              </button>
              <button
                onClick={editingMethod ? handleUpdatePaymentMethod : handleAddPaymentMethod}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg whitespace-nowrap"
              >
                {editingMethod ? 'Update Method' : 'Add Method'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}