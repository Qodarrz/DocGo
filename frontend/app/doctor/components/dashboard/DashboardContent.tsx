"use client";

import React, { useState } from "react";
import Header from "./Header";
import StatsCards from "./StatsCards";
import ConsultationChart from "./ConsultationChart";
import ScheduleList from "./ScheduleList";
import AgeDistribution from "./AgeDistribution";
import ConsultationTypes from "./ConsultationTypes";
import PeakHours from "./PeakHours";
import { cn } from "@/lib/utils";

export default function DashboardContent({ initialData }: {
  initialData: {
    cardsData: any[];
    consultationData: any;
    recentActivities: any[];
    ageDistribution: any[];
    consultationTypes: any[];
    peakHours: any[];
  }
}) {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');

  return (
    <div className="space-y-8 p-4 md:p-6">
      <Header />
      
      <StatsCards data={initialData.cardsData} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ConsultationChart 
          data={initialData.consultationData}
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
        />
        <ScheduleList activities={initialData.recentActivities} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AgeDistribution data={initialData.ageDistribution} />
        <ConsultationTypes data={initialData.consultationTypes} />
        <PeakHours data={initialData.peakHours} />
      </div>
    </div>
  );
}