'use client';

export default function RecentOrders() {
  const recentOrders = [
    {
      id: '#12847',
      customer: 'John Smith',
      product: 'iPhone 15 Pro Max',
      amount: '$1,299.00',
      status: 'completed',
      date: '2024-01-15'
    },
    {
      id: '#12846',
      customer: 'Sarah Johnson',
      product: 'MacBook Air M2',
      amount: '$1,199.00',
      status: 'processing',
      date: '2024-01-15'
    },
    {
      id: '#12845',
      customer: 'Mike Davis',
      product: 'AirPods Pro',
      amount: '$249.00',
      status: 'shipped',
      date: '2024-01-14'
    },
    {
      id: '#12844',
      customer: 'Emily Wilson',
      product: 'iPad Pro 11"',
      amount: '$899.00',
      status: 'completed',
      date: '2024-01-14'
    },
    {
      id: '#12843',
      customer: 'David Brown',
      product: 'Apple Watch Series 9',
      amount: '$399.00',
      status: 'cancelled',
      date: '2024-01-13'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium whitespace-nowrap">
          View All Orders
        </button>
      </div>
      
      <div className="space-y-4">
        {recentOrders.map((order) => (
          <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-gray-900">{order.id}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>
              <div className="text-sm text-gray-600">{order.customer}</div>
              <div className="text-sm text-gray-500">{order.product}</div>
              <div className="flex items-center justify-between mt-2">
                <span className="font-semibold text-gray-900">{order.amount}</span>
                <span className="text-xs text-gray-500">{order.date}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}