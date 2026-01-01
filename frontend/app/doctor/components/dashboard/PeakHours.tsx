"use client";

import React from "react";
import { cn } from "@/lib/utils";

export default function PeakHours({ data }: { data: any[] }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Peak Consultation Hours
      </h2>
      <div className="space-y-4">
        {data.map((hour, index) => (
          <div key={index} className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">{hour.time}</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{hour.percentage}%</span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full rounded-full",
                  hour.percentage >= 80 ? 'bg-red-500' :
                  hour.percentage >= 60 ? 'bg-amber-500' : 'bg-green-500'
                )}
                style={{ width: `${hour.percentage}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {hour.patients}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}