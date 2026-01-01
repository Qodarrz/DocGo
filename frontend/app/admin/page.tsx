// app/admin/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import AdminHeader from "@/app/admin/components/dashboard/AdminHeader";
import AdminStatsCards from "@/app/admin/components/dashboard/AdminStatsCards";
import ConsultationTrendsChart from "@/app/admin/components/dashboard/ConsultationTrendsChart";
import RecentActivities from "@/app/admin/components/dashboard/RecentActivities";
import DemographicsSection from "@/app/admin/components/dashboard/DemographicsSection";
import PlatformStats from "@/app/admin/components/dashboard/PlatformStats";
import SystemHealth from "@/app/admin/components/dashboard/SystemHealth";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import ErrorMessage from "@/components/ui/ErrorMessage";
import { getAdminDashboard } from "@/client/admin";

export default function AdminDashboardPage() {
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("week");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  // Fetch data langsung di root
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Panggil API langsung
        const result = await getAdminDashboard();

        if (result.success) {
          setDashboardData(result.data);
        } else {
          throw new Error(result.message || "Failed to fetch data");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        console.error("Error fetching dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [refreshKey]);
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorMessage message={error} />
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="p-6">
        <ErrorMessage message="No data available" />
      </div>
    );
  }

  // Format data untuk chart consultation trends
  const formatConsultationData = (range: "week" | "month" | "year") => {
    const trends = dashboardData.overview.consultationTrends;

    if (range === "week") {
      // Ambil 7 hari terakhir
      return trends.slice(-7).map((item: any) => ({
        day: new Date(item.date).toLocaleDateString("en-US", {
          weekday: "short",
        }),
        consultations: item.total,
        followups: item.COMPLETED || 0,
      }));
    } else if (range === "month") {
      // Group by week
      const weeklyData = [];
      for (let i = 0; i < Math.min(4, trends.length); i++) {
        const weekData = trends.slice(i * 7, (i + 1) * 7);
        const total = weekData.reduce(
          (sum: number, item: any) => sum + item.total,
          0
        );
        const completed = weekData.reduce(
          (sum: number, item: any) => sum + (item.COMPLETED || 0),
          0
        );
        weeklyData.push({
          week: `Week ${i + 1}`,
          consultations: total,
          followups: completed,
        });
      }
      return weeklyData;
    } else {
      // Group by month
      const monthlyData = [];
      const currentDate = new Date();
      for (let i = 5; i >= 0; i--) {
        const month = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - i,
          1
        );
        const monthName = month.toLocaleDateString("en-US", { month: "short" });

        // Filter data untuk bulan ini
        const monthData = trends.filter((item: any) => {
          const itemDate = new Date(item.date);
          return (
            itemDate.getMonth() === month.getMonth() &&
            itemDate.getFullYear() === month.getFullYear()
          );
        });

        const total = monthData.reduce(
          (sum: number, item: any) => sum + item.total,
          0
        );
        const completed = monthData.reduce(
          (sum: number, item: any) => sum + (item.COMPLETED || 0),
          0
        );

        monthlyData.push({
          month: monthName,
          consultations: total,
          followups: completed,
        });
      }
      return monthlyData;
    }
  };

  const consultationData = {
    week: formatConsultationData("week"),
    month: formatConsultationData("month"),
    year: formatConsultationData("year"),
  };

  // Format data untuk recent activities dari recent consultations
  const formatRecentActivities = () => {
    const recentConsults =
      dashboardData.detailedData.recentConsultations?.slice(0, 5) || [];

    return recentConsults.map((consult: any, index: number) => ({
      id: consult.id,
      patient:
        consult.user?.fullName || consult.user?.email || "Unknown Patient",
      type: consult.type,
      time: new Date(
        consult.scheduledAt || consult.createdAt
      ).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      duration: `${consult.duration || 30} minutes`,
      status: consult.status.toLowerCase(),
      isNew: index < 2, // Mark first 2 as new
    }));
  };

  // Format user activities untuk component RecentActivities
  const formatUserActivities = () => {
    const recentUsers =
      dashboardData.detailedData.recentUsers?.slice(0, 5) || [];

    return recentUsers.map((user: any, index: number) => ({
      id: user.id,
      patient: user.fullName || user.email,
      type: user.role,
      time: new Date(user.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      duration: `${user._count?.consultations || 0} consults`,
      status: "active",
      isNew: index < 2,
    }));
  };

  return (
    <div className="space-y-8 p-4 md:p-6">
      {/* Header */}
      <AdminHeader
        title={`Welcome back, ${dashboardData.adminInfo.name || dashboardData.adminInfo.email?.split("@")[0] || "Admin"}`}
        subtitle="Dashboard overview and analytics for your platform"
        onRefresh={handleRefresh}
      />

      {/* Stats Cards - Langsung pass data dari API */}
      <AdminStatsCards statistics={dashboardData.statistics} />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ConsultationTrendsChart
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
          data={consultationData[timeRange]}
        />

        <RecentActivities
          activities={formatUserActivities()}
        />
      </div>

      {/* Platform Stats */}
      <PlatformStats data={dashboardData.platformStats} />

      {/* Demographics */}
      <DemographicsSection
        genderDistribution={dashboardData.demographics.genderDistribution}
        ageDistribution={dashboardData.demographics.ageDistribution}
        usersByRole={dashboardData.demographics.usersByRole}
      />

      {/* Doctor Performance */}
      {dashboardData.detailedData.doctors &&
        dashboardData.detailedData.doctors.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Doctor Performance
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {dashboardData.detailedData.doctors.map((doctor: any) => (
                <div
                  key={doctor.id}
                  className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                      <span className="font-semibold text-purple-700 dark:text-purple-400">
                        {doctor.name?.charAt(0) || "D"}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {doctor.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {doctor.specialization}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">
                        {doctor.totalConsultations}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Consults
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">
                        {doctor.rating?.toFixed(1) || "4.5"}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Rating
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">
                        {doctor.experience || 0}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Years
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* Quick Stats & System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Last 24 Hours Activity
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-lg font-semibold text-blue-700 dark:text-blue-400">
                {dashboardData.quickStats.last24Hours.newUsers}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                New Users
              </div>
            </div>
            <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-lg font-semibold text-purple-700 dark:text-purple-400">
                {dashboardData.quickStats.last24Hours.newConsultations}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Consultations
              </div>
            </div>
            <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-lg font-semibold text-green-700 dark:text-green-400">
                {dashboardData.quickStats.last24Hours.completedConsultations}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Completed
              </div>
            </div>
            <div className="text-center p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <div className="text-lg font-semibold text-amber-700 dark:text-amber-400">
                {dashboardData.quickStats.last24Hours.newSymptoms}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Symptoms
              </div>
            </div>
            <div className="text-center p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
              <div className="text-lg font-semibold text-pink-700 dark:text-pink-400">
                {dashboardData.quickStats.last24Hours.newMetrics}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Metrics
              </div>
            </div>
          </div>
        </div>

        <SystemHealth data={dashboardData.systemHealth} />
      </div>

      {/* Additional Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        {dashboardData.charts.userGrowthChart &&
          dashboardData.charts.userGrowthChart.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                User Growth
              </h2>
              <div className="h-64">
                <div className="space-y-3">
                  {dashboardData.charts.userGrowthChart.map((item: any) => (
                    <div
                      key={item.date}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {new Date(item.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {item.users} total
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {item.patients} patients, {item.doctors} doctors,{" "}
                            {item.admins} admins
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        {/* Consultation Types */}
        {dashboardData.charts.consultationTypeChart &&
          dashboardData.charts.consultationTypeChart.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Consultation Types
              </h2>
              <div className="space-y-3">
                {dashboardData.charts.consultationTypeChart.map(
                  (item: any, index: number) => {
                    const colors = [
                      "bg-blue-500",
                      "bg-purple-500",
                      "bg-green-500",
                      "bg-amber-500",
                      "bg-red-500",
                    ];
                    return (
                      <div key={index} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {item.type}
                          </span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {item.count}
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${colors[index % colors.length]} rounded-full`}
                            style={{
                              width: `${(item.count / Math.max(...dashboardData.charts.consultationTypeChart.map((c: any) => c.count))) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
