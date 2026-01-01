"use client";

import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from "@/lib/utils";

export default function ConsultationChart({ 
  data, 
  timeRange, 
  onTimeRangeChange 
}: { 
  data: any;
  timeRange: 'week' | 'month' | 'year';
  onTimeRangeChange: (range: 'week' | 'month' | 'year') => void;
}) {
  const getAverage = () => {
    const currentData = data[timeRange];
    const total = currentData.reduce((sum: number, item: any) => sum + item.consultations, 0);
    const avg = total / currentData.length;
    return timeRange === 'week' ? avg.toFixed(1) : timeRange === 'month' ? (avg / 7).toFixed(1) : (avg / 30).toFixed(1);
  };

  const getFollowupAvg = () => {
    const currentData = data[timeRange];
    const total = currentData.reduce((sum: number, item: any) => sum + item.followups, 0);
    const avg = total / currentData.length;
    return timeRange === 'week' ? avg.toFixed(1) : timeRange === 'month' ? (avg / 7).toFixed(1) : (avg / 30).toFixed(1);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Consultation Trends
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Overview of patient consultations
          </p>
        </div>
        <div className="flex gap-2">
          {(['week', 'month', 'year'] as const).map((range) => (
            <button
              key={range}
              onClick={() => onTimeRangeChange(range)}
              className={cn(
                "px-3 py-1.5 text-sm rounded-lg transition-colors",
                timeRange === range
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              )}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data[timeRange]}
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey={timeRange === 'week' ? 'day' : timeRange === 'month' ? 'week' : 'month'} 
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis stroke="#6b7280" fontSize={12} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem'
              }}
            />
            <Area 
              type="monotone" 
              dataKey="consultations" 
              stroke="#3b82f6" 
              fill="#93c5fd" 
              fillOpacity={0.3}
              strokeWidth={2}
              name="Consultations"
            />
            <Area 
              type="monotone" 
              dataKey="followups" 
              stroke="#8b5cf6" 
              fill="#a78bfa" 
              fillOpacity={0.3}
              strokeWidth={2}
              name="Follow-ups"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="text-lg font-semibold text-blue-700 dark:text-blue-400">
            {getAverage()}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Avg Daily</div>
        </div>
        <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <div className="text-lg font-semibold text-purple-700 dark:text-purple-400">
            {getFollowupAvg()}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Avg Follow-ups</div>
        </div>
        <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="text-lg font-semibold text-green-700 dark:text-green-400">
            {timeRange === 'week' ? '+15.2%' : timeRange === 'month' ? '+12.8%' : '+8.4%'}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Growth</div>
        </div>
      </div>
    </div>
  );
}