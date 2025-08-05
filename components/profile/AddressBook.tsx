'use client';
import { useState } from 'react';

interface Address {
  id: string;
  type: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
}

export default function AddressBook() {
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: '1',
      type: 'Home',
      name: 'John Doe',
      street: '123 Main Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'United States',
      phone: '+1 (555) 123-4567',
      isDefault: true
    },
    {
      id: '2',
      type: 'Office',
      name: 'John Doe',
      street: '456 Business Ave, Suite 200',
      city: 'New York',
      state: 'NY',
      zipCode: '10002',
      country: 'United States',
      phone: '+1 (555) 987-6543',
      isDefault: false
    }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState<Omit<Address, 'id' | 'isDefault'>>({
    type: 'Home',
    name: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    phone: ''
  });

  const handleAddAddress = () => {
    const newAddress: Address = {
      ...formData,
      id: Date.now().toString(),
      isDefault: addresses.length === 0
    };
    setAddresses(prev => [...prev, newAddress]);
    setShowAddModal(false);
    resetForm();
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setFormData({
      type: address.type,
      name: address.name,
      street: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country,
      phone: address.phone || ''
    });
    setShowAddModal(true);
  };

  const handleUpdateAddress = () => {
    if (!editingAddress) return;
    
    setAddresses(prev => 
      prev.map(addr => 
        addr.id === editingAddress.id 
          ? { ...formData, id: addr.id, isDefault: addr.isDefault }
          : addr
      )
    );
    setShowAddModal(false);
    setEditingAddress(null);
    resetForm();
  };

  const handleDeleteAddress = (addressId: string) => {
    const addressToDelete = addresses.find(addr => addr.id === addressId);
    if (!addressToDelete) return;

    if (addressToDelete.isDefault && addresses.length > 1) {
      const remainingAddresses = addresses.filter(addr => addr.id !== addressId);
      remainingAddresses[0].isDefault = true;
      setAddresses(remainingAddresses);
    } else {
      setAddresses(prev => prev.filter(addr => addr.id !== addressId));
    }
  };

  const handleSetDefault = (addressId: string) => {
    setAddresses(prev => 
      prev.map(addr => ({
        ...addr,
        isDefault: addr.id === addressId
      }))
    );
  };

  const resetForm = () => {
    setFormData({
      type: 'Home',
      name: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States',
      phone: ''
    });
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingAddress(null);
    resetForm();
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Address Book</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 whitespace-nowrap"
          >
            <i className="ri-add-line w-4 h-4 flex items-center justify-center"></i>
            <span>Add New Address</span>
          </button>
        </div>

        {addresses.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <i className="ri-map-pin-line text-6xl"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No addresses saved</h3>
            <p className="text-gray-600 mb-4">
              Add your first address to make checkout faster.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium whitespace-nowrap"
            >
              Add Address
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {addresses.map((address) => (
              <div key={address.id} className="border rounded-lg p-4 relative">
                {address.isDefault && (
                  <div className="absolute top-4 right-4">
                    <span className="bg-green-100 text-green-800 px-2 py-1 text-xs font-medium rounded">
                      Default
                    </span>
                  </div>
                )}

                <div className="mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-semibold text-gray-900">{address.type}</h3>
                    <span className="text-gray-600">•</span>
                    <span className="text-gray-600">{address.name}</span>
                  </div>
                  
                  <div className="text-gray-700 space-y-1">
                    <div>{address.street}</div>
                    <div>{address.city}, {address.state} {address.zipCode}</div>
                    <div>{address.country}</div>
                    {address.phone && (
                      <div className="flex items-center space-x-1">
                        <i className="ri-phone-line w-4 h-4 flex items-center justify-center"></i>
                        <span>{address.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditAddress(address)}
                    className="text-blue-600 hover:text-blue-800 font-medium text-sm whitespace-nowrap"
                  >
                    Edit
                  </button>
                  {!address.isDefault && (
                    <button
                      onClick={() => handleSetDefault(address.id)}
                      className="text-green-600 hover:text-green-800 font-medium text-sm whitespace-nowrap"
                    >
                      Set as Default
                    </button>
                  )}
                  {addresses.length > 1 && (
                    <button
                      onClick={() => handleDeleteAddress(address.id)}
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
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-screen overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editingAddress ? 'Edit Address' : 'Add New Address'}
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-8"
                  >
                    <option value="Home">Home</option>
                    <option value="Office">Office</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter full name"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address
                </label>
                <input
                  type="text"
                  value={formData.street}
                  onChange={(e) => setFormData(prev => ({ ...prev, street: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter street address"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter city"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter state"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    value={formData.zipCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter ZIP code"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <select
                    value={formData.country}
                    onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-8"
                  >
                    <option value="United States">United States</option>
                    <option value="Canada">Canada</option>
                    <option value="Mexico">Mexico</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={closeModal}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg whitespace-nowrap"
              >
                Cancel
              </button>
              <button
                onClick={editingAddress ? handleUpdateAddress : handleAddAddress}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg whitespace-nowrap"
              >
                {editingAddress ? 'Update Address' : 'Add Address'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}