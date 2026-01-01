// app/admin/components/dashboard/SystemHealth.tsx
import React from 'react';

interface SystemHealthProps {
  data: {
    activityLastHour: {
      consultations: number;
      messages: number;
      healthMetrics: number;
    };
    database: {
      status: string;
      timestamp: string;
    };
    apiResponseTime: string;
    systemLoad: string;
  };
}

const SystemHealth: React.FC<SystemHealthProps> = ({ data }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        System Health
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Database</span>
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
              data.database.status === 'connected'
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
            }`}>
              {data.database.status}
            </span>
          </div>
        </div>
        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400">API Response</div>
          <div className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
            {data.apiResponseTime}
          </div>
        </div>
        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400">System Load</div>
          <div className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
            {data.systemLoad}
          </div>
        </div>
        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400">Active Sessions</div>
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {data.activityLastHour.consultations +
              data.activityLastHour.messages +
              data.activityLastHour.healthMetrics}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemHealth;