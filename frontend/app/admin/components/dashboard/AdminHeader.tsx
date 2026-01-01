// app/admin/components/dashboard/AdminHeader.tsx
import React from 'react';
import { IconClock, IconRefresh } from '@tabler/icons-react';

interface AdminHeaderProps {
  title: string;
  subtitle: string;
  onRefresh?: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ title, subtitle, onRefresh }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          {title}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {subtitle}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
          <IconClock className="h-4 w-4" />
          Last updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            title="Refresh data"
          >
            <IconRefresh className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </button>
        )}
      </div>
    </div>
  );
};

export default AdminHeader;