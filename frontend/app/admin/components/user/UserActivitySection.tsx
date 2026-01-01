"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Clock,
  Stethoscope,
  Activity,
  Pill,
  Bell,
  MessageSquare,
  TrendingUp,
  FileText,
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Filter,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import { adminUserApi } from "@/client/adminuser";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface UserActivitySectionProps {
  userId: string;
}

interface ActivityItem {
  id: string;
  activityType: string;
  description: string;
  createdAt?: string;
  recordedAt?: string;
  takenAt?: string;
  startAt?: string;
  status?: string;
  type?: string;
  [key: string]: any;
}

export default function UserActivitySection({
  userId,
}: UserActivitySectionProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("ALL");
  const [expandedActivity, setExpandedActivity] = useState<string | null>(null);
  const [activitySummary, setActivitySummary] = useState<any>(null);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const response = await adminUserApi.getUserActivity(userId, 50);
      setActivities(response.data);
      setActivitySummary(response.summary);
    } catch (error) {
      console.error("Error loading activities:", error);
      toast.error("Gagal memuat aktivitas pengguna");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      loadActivities();
    }
  }, [userId]);

  const filteredActivities = activities.filter((activity) => {
    if (filterType === "ALL") return true;
    return activity.activityType === filterType;
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "CONSULTATION":
        return <Stethoscope size={16} className="text-blue-600" />;
      case "SYMPTOM_CHECK":
        return <Activity size={16} className="text-amber-600" />;
      case "HEALTH_METRIC":
        return <TrendingUp size={16} className="text-green-600" />;
      case "MEDICATION":
        return <Pill size={16} className="text-purple-600" />;
      case "REMINDER":
        return <Bell size={16} className="text-indigo-600" />;
      case "NOTIFICATION":
        return <MessageSquare size={16} className="text-gray-600" />;
      default:
        return <FileText size={16} className="text-gray-400" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "CONSULTATION":
        return "bg-blue-50 text-blue-800 border-blue-200";
      case "SYMPTOM_CHECK":
        return "bg-amber-50 text-amber-800 border-amber-200";
      case "HEALTH_METRIC":
        return "bg-green-50 text-green-800 border-green-200";
      case "MEDICATION":
        return "bg-purple-50 text-purple-800 border-purple-200";
      case "REMINDER":
        return "bg-indigo-50 text-indigo-800 border-indigo-200";
      case "NOTIFICATION":
        return "bg-gray-50 text-gray-800 border-gray-200";
      default:
        return "bg-gray-50 text-gray-800 border-gray-200";
    }
  };

  const getStatusBadge = (activity: ActivityItem) => {
    if (activity.status) {
      let color = "bg-gray-100 text-gray-800";
      let icon = null;

      switch (activity.status) {
        case "COMPLETED":
        case "TAKEN":
          color = "bg-green-100 text-green-800";
          icon = <CheckCircle size={12} className="mr-1" />;
          break;
        case "PENDING":
          color = "bg-yellow-100 text-yellow-800";
          icon = <Clock size={12} className="mr-1" />;
          break;
        case "CANCELLED":
        case "MISSED":
          color = "bg-red-100 text-red-800";
          icon = <XCircle size={12} className="mr-1" />;
          break;
        case "ONGOING":
          color = "bg-blue-100 text-blue-800";
          icon = <Activity size={12} className="mr-1" />;
          break;
      }

      return (
        <Badge className={`text-xs ${color}`}>
          {icon}
          {activity.status}
        </Badge>
      );
    }
    return null;
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatRelativeTime = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) {
      return "Baru saja";
    } else if (diffInHours < 24) {
      return `${diffInHours} jam yang lalu`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} hari yang lalu`;
    }
  };

  const renderActivityDetails = (activity: ActivityItem) => {
    switch (activity.activityType) {
      case "CONSULTATION":
        return (
          <div className="space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-gray-500">Tipe:</span>
                <Badge variant="outline" className="ml-2">
                  {activity.type}
                </Badge>
              </div>
              <div>
                <span className="text-gray-500">Dokter:</span>
                <span className="ml-2 font-medium">
                  {activity.doctor?.user?.fullName || "Tidak diketahui"}
                </span>
              </div>
            </div>
            {activity.notes && (
              <div>
                <span className="text-gray-500">Catatan:</span>
                <p className="mt-1 text-gray-700">{activity.notes}</p>
              </div>
            )}
          </div>
        );

      case "SYMPTOM_CHECK":
        return (
          <div className="space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-gray-500">Keluhan:</span>
                <p className="font-medium truncate">{activity.complaint}</p>
              </div>
              <div>
                <span className="text-gray-500">Level:</span>
                <Badge
                  className={`ml-2 ${
                    activity.triageLevel === "EMERGENCY"
                      ? "bg-red-100 text-red-800"
                      : activity.triageLevel === "HIGH"
                        ? "bg-orange-100 text-orange-800"
                        : activity.triageLevel === "MEDIUM"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                  }`}
                >
                  {activity.triageLevel}
                </Badge>
              </div>
            </div>
            {activity.severityHint && (
              <div>
                <span className="text-gray-500">Tingkat Keparahan:</span>
                <Badge variant="outline" className="ml-2">
                  {activity.severityHint}
                </Badge>
              </div>
            )}
            {activity.shouldSeeDoctor && (
              <div className="flex items-center text-amber-600">
                <AlertTriangle size={14} className="mr-2" />
                <span className="text-sm font-medium">
                  Disarankan untuk ke dokter
                </span>
              </div>
            )}
          </div>
        );

      case "HEALTH_METRIC":
        return (
          <div className="space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-gray-500">Jenis:</span>
                <Badge variant="outline" className="ml-2">
                  {activity.type}
                </Badge>
              </div>
              <div>
                <span className="text-gray-500">Nilai:</span>
                <span className="ml-2 font-medium">
                  {activity.value} {activity.unit}
                </span>
              </div>
            </div>
            {activity.notes && (
              <div>
                <span className="text-gray-500">Catatan:</span>
                <p className="mt-1 text-gray-700">{activity.notes}</p>
              </div>
            )}
          </div>
        );

      case "MEDICATION":
        return (
          <div className="space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-gray-500">Obat:</span>
                <span className="ml-2 font-medium">
                  {activity.medication?.name}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Waktu:</span>
                <span className="ml-2 font-medium">
                  {activity.takenAt
                    ? new Date(activity.takenAt).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "N/A"}
                </span>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-sm text-gray-500">{activity.description}</div>
        );
    }
  };

  if (loading && activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity size={20} />
              Aktivitas Pengguna
            </CardTitle>
            <CardDescription>
              Log aktivitas dan interaksi pengguna dengan sistem
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <Filter size={16} className="mr-2" />
                <SelectValue placeholder="Filter aktivitas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua Aktivitas</SelectItem>
                <SelectItem value="CONSULTATION">Konsultasi</SelectItem>
                <SelectItem value="SYMPTOM_CHECK">Cek Gejala</SelectItem>
                <SelectItem value="HEALTH_METRIC">Data Kesehatan</SelectItem>
                <SelectItem value="MEDICATION">Pengobatan</SelectItem>
                <SelectItem value="REMINDER">Pengingat</SelectItem>
                <SelectItem value="NOTIFICATION">Notifikasi</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={loadActivities}>
              <RefreshCw size={16} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Activity Summary */}
        {activitySummary && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.entries(activitySummary).map(([key, value]) => (
                <div key={key} className="text-center">
                  <div className="text-2xl font-bold text-gray-800">
                    {value as number}
                  </div>
                  <div className="text-xs text-gray-600 capitalize">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Activities Timeline */}
        <div className="space-y-4">
          {filteredActivities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText size={48} className="mx-auto mb-4 text-gray-300" />
              <p>
                Tidak ada aktivitas{" "}
                {filterType !== "ALL" ? `dengan filter ${filterType}` : ""}
              </p>
            </div>
          ) : (
            filteredActivities.map((activity, index) => (
              <Collapsible
                key={`${activity.id}-${index}`}
                open={expandedActivity === activity.id}
                onOpenChange={(open) =>
                  setExpandedActivity(open ? activity.id : null)
                }
              >
                <div className="border rounded-lg hover:border-gray-300 transition-colors">
                  <CollapsibleTrigger asChild>
                    <div className="p-4 cursor-pointer">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="p-2 rounded-lg bg-white border">
                            {getActivityIcon(activity.activityType)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium truncate">
                                {activity.description}
                              </h4>
                              <Badge
                                className={getActivityColor(
                                  activity.activityType
                                )}
                              >
                                {activity.activityType.replace("_", " ")}
                              </Badge>
                              {getStatusBadge(activity)}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar size={14} />
                                {formatDateTime(
                                  activity.createdAt ||
                                    activity.recordedAt ||
                                    activity.takenAt ||
                                    activity.startAt
                                )}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock size={14} />
                                {formatRelativeTime(
                                  activity.createdAt ||
                                    activity.recordedAt ||
                                    activity.takenAt ||
                                    activity.startAt
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          {expandedActivity === activity.id ? (
                            <ChevronUp size={20} className="text-gray-400" />
                          ) : (
                            <ChevronDown size={20} className="text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <Separator />
                    <div className="p-4 bg-gray-50 rounded-b-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <Eye size={16} className="text-gray-400" />
                        <span className="text-sm font-medium text-gray-600">
                          Detail Aktivitas
                        </span>
                      </div>
                      {renderActivityDetails(activity)}

                      {/* Additional Metadata */}
                      {Object.keys(activity).some(
                        (key) =>
                          ["meta", "data", "additionalInfo"].includes(key) &&
                          activity[key] &&
                          Object.keys(activity[key]).length > 0
                      ) && (
                        <div className="mt-4 pt-4 border-t">
                          <h5 className="text-sm font-medium text-gray-600 mb-2">
                            Metadata Tambahan
                          </h5>
                          <div className="bg-white p-3 rounded border text-sm">
                            <pre className="whitespace-pre-wrap text-xs">
                              {JSON.stringify(
                                activity.meta ||
                                  activity.data ||
                                  activity.additionalInfo,
                                null,
                                2
                              )}
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            ))
          )}
        </div>

        {/* Activity Timeline View (Alternative) */}
        <div className="mt-8 pt-6 border-t">
          <h3 className="text-lg font-semibold mb-4">Timeline Aktivitas</h3>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

            <div className="space-y-8">
              {filteredActivities.slice(0, 10).map((activity, index) => (
                <div key={`timeline-${index}`} className="relative flex">
                  {/* Timeline dot */}
                  <div className="absolute left-5 transform -translate-x-1/2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        activity.activityType === "CONSULTATION"
                          ? "bg-blue-500"
                          : activity.activityType === "SYMPTOM_CHECK"
                            ? "bg-amber-500"
                            : activity.activityType === "HEALTH_METRIC"
                              ? "bg-green-500"
                              : activity.activityType === "MEDICATION"
                                ? "bg-purple-500"
                                : "bg-gray-400"
                      }`}
                    ></div>
                  </div>

                  {/* Activity content */}
                  <div className="ml-12 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getActivityIcon(activity.activityType)}
                      <span className="text-sm font-medium">
                        {activity.activityType.replace("_", " ")}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatRelativeTime(
                          activity.createdAt ||
                            activity.recordedAt ||
                            activity.takenAt ||
                            activity.startAt
                        )}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {activity.description.substring(0, 100)}
                      {activity.description.length > 100 && "..."}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
