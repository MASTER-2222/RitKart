'use client';
import React from 'react';

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  verifiedUsers: number;
  newUsersThisMonth: number;
  uniqueCustomers: number;
}

interface UserStatsCardsProps {
  stats: UserStats;
}

export default function UserStatsCards({ stats }: UserStatsCardsProps) {
  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: 'ri-group-line',
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: 'Active Users',
      value: stats.activeUsers,
      icon: 'ri-user-line',
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      title: 'Verified Users',
      value: stats.verifiedUsers,
      icon: 'ri-verified-badge-line',
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    {
      title: 'New This Month',
      value: stats.newUsersThisMonth,
      icon: 'ri-user-add-line',
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600'
    },
    {
      title: 'Customers',
      value: stats.uniqueCustomers,
      icon: 'ri-shopping-bag-line',
      color: 'bg-pink-500',
      bgColor: 'bg-pink-50',
      textColor: 'text-pink-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      {statCards.map((card, index) => (
        <div
          key={index}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center">
            <div className={`p-3 ${card.bgColor} rounded-lg`}>
              <i className={`${card.icon} w-6 h-6 ${card.textColor}`}></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{card.title}</p>
              <p className="text-2xl font-bold text-gray-900">
                {card.value.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}