'use client';

export default function ProfileDashboard() {
  const stats = [
    {
      title: 'Total Orders',
      value: '12',
      icon: 'ri-shopping-bag-line',
      color: 'bg-blue-500',
      trend: '+2 this month'
    },
    {
      title: 'Active Deliveries',
      value: '3',
      icon: 'ri-truck-line',
      color: 'bg-green-500',
      trend: 'On the way'
    },
    {
      title: 'Wishlist Items',
      value: '8',
      icon: 'ri-heart-line',
      color: 'bg-red-500',
      trend: '2 new items'
    },
    {
      title: 'Cart Items',
      value: '5',
      icon: 'ri-shopping-cart-line',
      color: 'bg-orange-500',
      trend: 'Ready to checkout'
    }
  ];

  const recentOrders = [
    {
      id: '#RZ-001234',
      product: 'Apple MacBook Pro 14-inch',
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=100&h=100&fit=crop&crop=center',
      price: '$1,599.00',
      status: 'Delivered',
      date: 'Dec 15, 2023'
    },
    {
      id: '#RZ-001235',
      product: 'Nike Air Force 1 Sneakers',
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=100&h=100&fit=crop&crop=center',
      price: '$110.00',
      status: 'In Transit',
      date: 'Dec 18, 2023'
    },
    {
      id: '#RZ-001236',
      product: 'Sony WH-1000XM4 Headphones',
      image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=100&h=100&fit=crop&crop=center',
      price: '$248.00',
      status: 'Processing',
      date: 'Dec 20, 2023'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, John!</h1>
            <p className="text-gray-600">Here's what's happening with your account today.</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Member since</div>
            <div className="font-semibold text-gray-900">January 2023</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <i className={`${stat.icon} w-5 h-5 flex items-center justify-center text-white`}></i>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                </div>
              </div>
              <div className="text-sm font-medium text-gray-900 mb-1">{stat.title}</div>
              <div className="text-xs text-gray-600">{stat.trend}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
          <button className="text-blue-600 hover:underline text-sm font-medium">
            View All Orders
          </button>
        </div>

        <div className="space-y-4">
          {recentOrders.map((order, index) => (
            <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <img
                src={order.image}
                alt={order.product}
                className="w-16 h-16 object-cover rounded"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{order.product}</h3>
                    <p className="text-sm text-gray-600">Order {order.id}</p>
                    <p className="text-xs text-gray-500">{order.date}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900">{order.price}</div>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      order.status === 'Delivered' 
                        ? 'bg-green-100 text-green-800'
                        : order.status === 'In Transit'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              </div>
              <button className="text-blue-600 hover:text-blue-800 font-medium text-sm whitespace-nowrap">
                Track Order
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}