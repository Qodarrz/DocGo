// app/admin/components/dashboard/RecentActivities.tsx
import React from "react";
import { cn } from "@/lib/utils";
import { IconUsers, IconChevronRight } from "@tabler/icons-react";

interface Activity {
  id: number;
  patient: string;
  type: string;
  time: string;
  duration: string;
  status: "completed" | "in-progress" | "scheduled" | "pending";
  isNew: boolean;
}

interface RecentActivitiesProps {
  activities: Activity[];
}

const RecentActivities: React.FC<RecentActivitiesProps> = ({ activities }) => {
  // app/admin/components/dashboard/RecentActivities.tsx - Update bagian getStatusColor
  const getStatusColor = (type: string) => {
    switch (type) {
      case "USER":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "DOCTOR":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400";
      case "ADMIN":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400";
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "in-progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "scheduled":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400";
      case "pending":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  // Update di dalam component:
  {
    activities.map((activity) => (
      <div
        key={activity.id}
        className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <IconUsers className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            {activity.isNew && (
              <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500 border-2 border-white dark:border-gray-800"></div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-gray-900 dark:text-white">
                {activity.patient}
              </h4>
              <span
                className={cn(
                  "text-xs font-medium px-2 py-0.5 rounded-full",
                  getStatusColor(activity.type) // Gunakan type untuk warna role
                )}
              >
                {activity.type}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Joined • {activity.duration}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="font-medium text-gray-900 dark:text-white">
            {activity.time}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {new Date().toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </div>
        </div>
      </div>
    ));
  }

  const getStatusCounts = () => {
    const counts = {
      pending: 0,
      inProgress: 0,
      today: activities.length,
    };

    activities.forEach((activity) => {
      if (activity.status === "pending") counts.pending++;
      if (activity.status === "in-progress") counts.inProgress++;
    });

    return counts;
  };

  const counts = getStatusCounts();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Today's Activities
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Recent consultations and appointments
          </p>
        </div>
        <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium flex items-center gap-1">
          View All
          <IconChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-4">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <IconUsers className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                {activity.isNew && (
                  <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500 border-2 border-white dark:border-gray-800"></div>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {activity.patient}
                  </h4>
                  <span
                    className={cn(
                      "text-xs font-medium px-2 py-0.5 rounded-full",
                      getStatusColor(activity.status)
                    )}
                  >
                    {activity.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {activity.type} • {activity.duration}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium text-gray-900 dark:text-white">
                {activity.time}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Today
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {counts.pending}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Pending
          </div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {counts.inProgress}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            In Progress
          </div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {counts.today}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Today</div>
        </div>
      </div>
    </div>
  );
};

export default RecentActivities;
