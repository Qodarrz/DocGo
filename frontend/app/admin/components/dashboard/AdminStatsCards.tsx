// app/admin/components/dashboard/AdminStatsCards.tsx
import React from 'react';
import { cn } from "@/lib/utils";
import { 
  IconUsers, 
  IconActivity,
  IconUser,
  IconStethoscope,
  IconCalendar,
  IconAlertTriangle,
  IconPills,
  IconHeart,
  IconUserCheck // Tambah icon untuk user-md
} from "@tabler/icons-react";

interface StatCard {
  title: string;
  value: number | string;
  description: string;
  icon: string;
}

interface AdminStatsCardsProps {
  statistics: StatCard[];
}

const iconMap: Record<string, React.ReactNode> = {
  users: <IconUsers className="h-6 w-6" />,
  activity: <IconActivity className="h-6 w-6" />,
  'user-md': <IconUserCheck className="h-6 w-6" />, // Ubah ke IconUserCheck
  stethoscope: <IconStethoscope className="h-6 w-6" />,
  calendar: <IconCalendar className="h-6 w-6" />,
  'alert-triangle': <IconAlertTriangle className="h-6 w-6" />,
  pills: <IconPills className="h-6 w-6" />,
  heart: <IconHeart className="h-6 w-6" />,
};

const getIconColor = (icon: string): string => {
  const colors: Record<string, string> = {
    users: 'bg-blue-500',
    activity: 'bg-green-500',
    'user-md': 'bg-purple-500',
    stethoscope: 'bg-orange-500',
    calendar: 'bg-red-500',
    'alert-triangle': 'bg-yellow-500',
    pills: 'bg-indigo-500',
    heart: 'bg-pink-500',
  };
  return colors[icon] || 'bg-gray-500';
};

const AdminStatsCards: React.FC<AdminStatsCardsProps> = ({ statistics }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statistics.map((stat, index) => (
        <div
          key={index}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-3">
            <div className={cn('p-2 rounded-lg', getIconColor(stat.icon))}>
              <div className="text-white">{iconMap[stat.icon]}</div>
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {stat.title}
          </h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {stat.description}
          </p>
        </div>
      ))}
    </div>
  );
};

export default AdminStatsCards;