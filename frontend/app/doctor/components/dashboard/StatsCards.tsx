"use client";

import React from "react";
import { 
  IconUsers, 
  IconCalendarStats, 
  IconClock, 
  IconTrendingUp,
  IconCalendar,
  IconActivity,
  IconArrowUpRight,
  IconArrowDownRight
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

const iconMap = {
  'users': IconUsers,
  'activity': IconActivity,
  'clock': IconClock,
  'calendar': IconCalendar,
  'trending-up': IconTrendingUp,
};

export default function StatsCards({ data }: { data: any[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {data.map((card, index) => {
        const IconComponent = iconMap[card.icon as keyof typeof iconMap] || IconUsers;
        
        return (
          <div 
            key={index}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={cn("p-2 rounded-lg", card.color)}>
                <div className="text-white">
                  <IconComponent className="h-6 w-6" />
                </div>
              </div>
              <div className={cn(
                "flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full",
                card.isPositive 
                  ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400" 
                  : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
              )}>
                {card.isPositive ? (
                  <IconArrowUpRight className="h-3 w-3" />
                ) : (
                  <IconArrowDownRight className="h-3 w-3" />
                )}
                {card.change}
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {card.title}
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {card.value}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {card.description}
            </p>
          </div>
        );
      })}
    </div>
  );
}