// app/admin/components/dashboard/PlatformStats.tsx
import React from 'react';
import {
  IconBell,
  IconMessageCircle,
  IconApple,
  IconUsers,
  IconClock,
} from '@tabler/icons-react';

interface PlatformStatsProps {
  data: {
    notifications: {
      total: number;
      unread: number;
      readRate: string;
    };
    chats: {
      total: number;
      active: number;
      inactive: number;
    };
    nutrition: {
      totalMealPlans: number;
      avgPlansPerUser: string;
    };
    emergency: {
      totalContacts: number;
      primaryContacts: number;
    };
    reminders: {
      total: number;
      active: number;
    };
  };
}

const PlatformStats: React.FC<PlatformStatsProps> = ({ data }) => {
  const stats = [
    {
      title: 'Notifications',
      icon: <IconBell className="h-5 w-5" />,
      items: [
        { label: 'Total', value: data.notifications.total },
        { label: 'Unread', value: data.notifications.unread },
        { label: 'Read Rate', value: `${data.notifications.readRate}%` },
      ],
      color: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-700 dark:text-blue-400',
    },
    {
      title: 'Chat Rooms',
      icon: <IconMessageCircle className="h-5 w-5" />,
      items: [
        { label: 'Total', value: data.chats.total },
        { label: 'Active', value: data.chats.active },
        { label: 'Inactive', value: data.chats.inactive },
      ],
      color: 'bg-purple-50 dark:bg-purple-900/20',
      textColor: 'text-purple-700 dark:text-purple-400',
    },
    {
      title: 'Nutrition',
      icon: <IconApple className="h-5 w-5" />,
      items: [
        { label: 'Meal Plans', value: data.nutrition.totalMealPlans },
        { label: 'Avg per User', value: data.nutrition.avgPlansPerUser },
      ],
      color: 'bg-green-50 dark:bg-green-900/20',
      textColor: 'text-green-700 dark:text-green-400',
    },
    {
      title: 'Emergency',
      icon: <IconUsers className="h-5 w-5" />,
      items: [
        { label: 'Contacts', value: data.emergency.totalContacts },
        { label: 'Primary', value: data.emergency.primaryContacts },
      ],
      color: 'bg-red-50 dark:bg-red-900/20',
      textColor: 'text-red-700 dark:text-red-400',
    },
    {
      title: 'Reminders',
      icon: <IconClock className="h-5 w-5" />,
      items: [
        { label: 'Total', value: data.reminders.total },
        { label: 'Active', value: data.reminders.active },
      ],
      color: 'bg-amber-50 dark:bg-amber-900/20',
      textColor: 'text-amber-700 dark:text-amber-400',
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        Platform Statistics
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg ${stat.color} border border-gray-200 dark:border-gray-700`}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className={`p-2 rounded-lg ${stat.textColor}`}>
                {stat.icon}
              </div>
              <h3 className="font-medium text-gray-900 dark:text-white">
                {stat.title}
              </h3>
            </div>
            <div className="space-y-2">
              {stat.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {item.label}
                  </span>
                  <span className={`font-medium ${stat.textColor}`}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlatformStats;