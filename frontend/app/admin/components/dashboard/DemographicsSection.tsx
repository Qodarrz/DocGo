// app/admin/components/dashboard/DemographicsSection.tsx
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface DemographicsSectionProps {
  genderDistribution: Array<{ gender: string; count: number }>;
  ageDistribution: Array<{ range: string; count: number }>;
  usersByRole: Array<{ role: string; _count: number }>;
}

const COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444"];

// app/admin/components/dashboard/DemographicsSection.tsx - Update untuk handle empty data
const DemographicsSection: React.FC<DemographicsSectionProps> = ({
  genderDistribution = [],
  ageDistribution = [],
  usersByRole = [],
}) => {
  // Jika data kosong, tampilkan placeholder
  if (
    genderDistribution.length === 0 &&
    ageDistribution.length === 0 &&
    usersByRole.length === 0
  ) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {i === 1
                ? "Gender Distribution"
                : i === 2
                  ? "Age Distribution"
                  : "User Roles"}
            </h2>
            <div className="h-48 flex items-center justify-center text-gray-400 dark:text-gray-500">
              No data available
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Format data untuk chart
  const chartGenderData =
    genderDistribution.length > 0
      ? genderDistribution
      : [{ gender: "No Data", count: 1 }];

  const chartAgeData =
    ageDistribution.length > 0
      ? ageDistribution.filter((item) => item.count > 0)
      : [{ range: "No Data", count: 1 }];

  const chartRoleData =
    usersByRole.length > 0 ? usersByRole : [{ role: "No Data", _count: 1 }];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Gender Distribution */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Gender Distribution
        </h2>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartGenderData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(props) => {
                  const dataEntry = props.payload as {
                    gender: string;
                    count: number;
                  };
                  const total = chartGenderData.reduce(
                    (sum, d) => sum + d.count,
                    0
                  );
                  const percent = ((dataEntry.count / total) * 100).toFixed(0);
                  return `${dataEntry.gender}: ${percent}%`;
                }}
                outerRadius={70}
                fill="#8884d8"
                dataKey="count"
              />

              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Age Distribution */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Age Distribution
        </h2>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartAgeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="range" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip />
              <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* User Roles */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          User Roles
        </h2>
        <div className="space-y-3">
          {chartRoleData.map((role, index) => (
            <div key={role.role} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {role.role}
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {role._count}
                </span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(role._count / chartRoleData.reduce((sum, r) => sum + r._count, 0)) * 100}%`,
                    backgroundColor: COLORS[index % COLORS.length],
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default DemographicsSection;
