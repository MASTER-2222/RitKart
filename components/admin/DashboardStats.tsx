'use client';

export default function DashboardStats() {
  const stats = [
    {
      title: 'Total Sales',
      value: '$124,532',
      change: '+12.5%',
      changeType: 'positive',
      icon: 'ri-money-dollar-circle-line',
      color: 'green'
    },
    {
      title: 'Total Orders',
      value: '1,428',
      change: '+8.2%',
      changeType: 'positive',
      icon: 'ri-shopping-bag-line',
      color: 'blue'
    },
    {
      title: 'Active Users',
      value: '3,842',
      change: '-2.1%',
      changeType: 'negative',
      icon: 'ri-user-line',
      color: 'purple'
    },
    {
      title: 'Products',
      value: '2,156',
      change: '+15.3%',
      changeType: 'positive',
      icon: 'ri-box-line',
      color: 'orange'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <div key={stat.title} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
              <div className="flex items-center mt-2">
                <span className={`text-sm font-medium ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
                <span className="text-sm text-gray-500 ml-1">vs last month</span>
              </div>
            </div>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              stat.color === 'green' ? 'bg-green-100' :
              stat.color === 'blue' ? 'bg-blue-100' :
              stat.color === 'purple' ? 'bg-purple-100' :
              'bg-orange-100'
            }`}>
              <i className={`${stat.icon} w-6 h-6 flex items-center justify-center ${
                stat.color === 'green' ? 'text-green-600' :
                stat.color === 'blue' ? 'text-blue-600' :
                stat.color === 'purple' ? 'text-purple-600' :
                'text-orange-600'
              }`}></i>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}