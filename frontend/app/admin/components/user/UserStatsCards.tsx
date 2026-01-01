"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Users,
  Stethoscope,
  Activity,
  Pill,
  Heart,
  AlertTriangle,
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  FileText,
  MessageSquare,
  Bell,
  Zap,
  Eye,
  UserCheck,
  ShieldAlert,
  Thermometer,
  Droplets,
  Moon,
  Weight,
  Package,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { adminUserApi } from "@/client/adminuser";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface UserStatsCardsProps {
  stats: any;
}

export default function UserStatsCards({ stats }: UserStatsCardsProps) {
  const [loading, setLoading] = useState(false);
  const [trendData, setTrendData] = useState<any>(null);

  useEffect(() => {
    // Load additional trend data if needed
    // You can fetch this from your API
  }, []);

  // Calculate engagement score (0-100)
  function calculateEngagementScore(stats?: Record<string, number>) {
    if (!stats) return 0;

    const weights = {
      consultations: 3,
      symptomChecks: 2,
      healthMetrics: 2,
      medications: 1,
      reminders: 1,
      notifications: 1,
    };

    let score = 0;
    let maxScore = 0;

    Object.entries(weights).forEach(([key, weight]) => {
      maxScore += weight;
      const value = stats[key] ?? 0;
      const normalized = Math.min(value, 10) / 10;
      score += normalized * weight;
    });

    return Math.round((score / maxScore) * 100);
  }

  // Determine engagement level
  const getEngagementLevel = (score: number) => {
    if (score >= 80)
      return { level: "Tinggi", color: "text-green-600", bg: "bg-green-100" };
    if (score >= 50)
      return { level: "Sedang", color: "text-amber-600", bg: "bg-amber-100" };
    return { level: "Rendah", color: "text-red-600", bg: "bg-red-100" };
  };

  const engagementScore = calculateEngagementScore();
  const engagementLevel = getEngagementLevel(engagementScore);

  // Statistik cards data
  const statCards = [
    // Health & Medical
    {
      title: "Konsultasi",
      value: stats.consultations || 0,
      description: "Total konsultasi dengan dokter",
      icon: <Stethoscope className="h-6 w-6 text-blue-600" />,
      color: "bg-blue-50 border-blue-100",
      trend:
        stats.consultations > 5
          ? "up"
          : stats.consultations > 0
            ? "stable"
            : "down",
      trendValue: stats.consultations > 0 ? "+2 minggu ini" : "Belum ada",
      detail: "Konsultasi online dan offline",
    },
    {
      title: "Cek Gejala",
      value: stats.symptomChecks || 0,
      description: "Pengecekan gejala mandiri",
      icon: <Activity className="h-6 w-6 text-amber-600" />,
      color: "bg-amber-50 border-amber-100",
      trend:
        stats.symptomChecks > 3
          ? "up"
          : stats.symptomChecks > 0
            ? "stable"
            : "down",
      trendValue: stats.symptomChecks > 0 ? "+1 bulan ini" : "Belum ada",
      detail: "Analisis gejala menggunakan AI",
    },
    {
      title: "Data Kesehatan",
      value: stats.healthMetrics || 0,
      description: "Catatan kesehatan pribadi",
      icon: <Heart className="h-6 w-6 text-red-600" />,
      color: "bg-red-50 border-red-100",
      trend:
        stats.healthMetrics > 10
          ? "up"
          : stats.healthMetrics > 0
            ? "stable"
            : "down",
      trendValue: stats.healthMetrics > 0 ? "Aktif" : "Belum ada",
      detail: "Tekanan darah, gula darah, dll.",
    },
    {
      title: "Pengobatan Aktif",
      value: stats.medications || 0,
      description: "Obat yang sedang dikonsumsi",
      icon: <Pill className="h-6 w-6 text-purple-600" />,
      color: "bg-purple-50 border-purple-100",
      trend: stats.medications > 0 ? "stable" : "down",
      trendValue: stats.medications > 0 ? "Aktif" : "Tidak ada",
      detail: "Jadwal dan instruksi pengobatan",
    },
    // User Activity
    {
      title: "Pengingat",
      value: stats.reminders || 0,
      description: "Pengingat kesehatan aktif",
      icon: <Bell className="h-6 w-6 text-indigo-600" />,
      color: "bg-indigo-50 border-indigo-100",
      trend:
        stats.reminders > 2 ? "up" : stats.reminders > 0 ? "stable" : "down",
      trendValue: stats.reminders > 0 ? "Aktif" : "Tidak ada",
      detail: "Obat, konsultasi, cek rutin",
    },
    {
      title: "Notifikasi",
      value: stats.notifications || 0,
      description: "Total notifikasi terkirim",
      icon: <MessageSquare className="h-6 w-6 text-gray-600" />,
      color: "bg-gray-50 border-gray-100",
      trend:
        stats.notifications > 20
          ? "up"
          : stats.notifications > 5
            ? "stable"
            : "down",
      trendValue: "Sistem & kesehatan",
      detail: "Semua jenis notifikasi",
    },
    // Profile Completeness
    {
      title: "Profil Medis",
      value: stats.medicalProfile ? "Lengkap" : "Belum",
      description: "Kelengkapan profil medis",
      icon: <FileText className="h-6 w-6 text-green-600" />,
      color: stats.medicalProfile
        ? "bg-green-50 border-green-100"
        : "bg-yellow-50 border-yellow-100",
      trend: stats.medicalProfile ? "up" : "down",
      trendValue: stats.medicalProfile ? "100%" : "0%",
      detail: "Data kesehatan dasar",
    },
    {
      title: "Kontak Darurat",
      value: stats.emergencyContacts || 0,
      description: "Kontak darurat terdaftar",
      icon: <ShieldAlert className="h-6 w-6 text-rose-600" />,
      color:
        stats.emergencyContacts > 0
          ? "bg-rose-50 border-rose-100"
          : "bg-gray-50 border-gray-100",
      trend: stats.emergencyContacts > 0 ? "stable" : "down",
      trendValue: stats.emergencyContacts > 0 ? "Ada" : "Belum",
      detail: "Minimal 1 kontak disarankan",
    },
  ];

  // Health metrics breakdown
  const healthMetricsBreakdown = [
    {
      type: "BLOOD_PRESSURE",
      label: "Tekanan Darah",
      icon: <Thermometer size={14} />,
      count: 0,
    },
    {
      type: "BLOOD_SUGAR",
      label: "Gula Darah",
      icon: <Droplets size={14} />,
      count: 0,
    },
    {
      type: "HEART_RATE",
      label: "Denyut Jantung",
      icon: <Heart size={14} />,
      count: 0,
    },
    {
      type: "WEIGHT",
      label: "Berat Badan",
      icon: <Weight size={14} />,
      count: 0,
    },
    { type: "SLEEP", label: "Tidur", icon: <Moon size={14} />, count: 0 },
  ];

  // Quick stats summary
  const quickStats = [
    {
      label: "Device Tokens",
      value: stats.deviceTokens || 0,
      icon: <Package size={16} />,
    },
    {
      label: "Penyakit Aktif",
      value: stats.diseases || 0,
      icon: <AlertTriangle size={16} />,
    },
    {
      label: "Total Aktivitas",
      value: (stats.consultations || 0) + (stats.symptomChecks || 0),
      icon: <Zap size={16} />,
    },
    {
      label: "Keaktifan",
      value: `${engagementScore}%`,
      icon: <UserCheck size={16} />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Engagement Score & Overview */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Eye size={20} />
                Overview Aktivitas Pengguna
              </CardTitle>
              <CardDescription>
                Ringkasan aktivitas dan interaksi dengan sistem kesehatan
              </CardDescription>
            </div>
            <Badge
              className={`${engagementLevel.bg} ${engagementLevel.color} border-0`}
            >
              {engagementLevel.level} Engagement
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Engagement Progress */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">Skor Keaktifan</span>
                <span className="font-bold">{engagementScore}%</span>
              </div>
              <Progress value={engagementScore} className="h-2" />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>Rendah</span>
                <span>Sedang</span>
                <span>Tinggi</span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {quickStats.map((stat, index) => (
                <TooltipProvider key={index}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="bg-gray-50 p-3 rounded-lg border text-center cursor-help">
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <span className="text-gray-500">{stat.icon}</span>
                          <div className="text-xl font-bold">{stat.value}</div>
                        </div>
                        <div className="text-xs text-gray-600 truncate">
                          {stat.label}
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {stat.label}: {stat.value}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <Card
            key={index}
            className={`${stat.color} hover:shadow-md transition-shadow`}
          >
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 rounded-lg bg-white border">
                      {stat.icon}
                    </div>
                    {stat.trend === "up" && (
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        <TrendingUp size={12} className="mr-1" />
                        Naik
                      </Badge>
                    )}
                    {stat.trend === "down" && (
                      <Badge className="bg-red-100 text-red-800 border-red-200">
                        <TrendingDown size={12} className="mr-1" />
                        Turun
                      </Badge>
                    )}
                    {stat.trend === "stable" && (
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                        <CheckCircle size={12} className="mr-1" />
                        Stabil
                      </Badge>
                    )}
                  </div>

                  <h3 className="text-2xl font-bold mb-1">
                    {typeof stat.value === "number"
                      ? stat.value.toLocaleString("id-ID")
                      : stat.value}
                  </h3>

                  <p className="text-sm text-gray-600 mb-2">
                    {stat.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {stat.trendValue}
                    </span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="text-xs text-gray-400 cursor-help">
                            ⓘ
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-sm">{stat.detail}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Timeline */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock size={16} />
              Timeline Aktivitas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">30 Hari Terakhir</span>
                <Badge variant="outline" className="text-xs">
                  {stats.consultations + stats.symptomChecks} aktivitas
                </Badge>
              </div>

              <div className="space-y-2">
                {/* Activity bars */}
                {[
                  {
                    label: "Konsultasi",
                    count: stats.consultations,
                    color: "bg-blue-500",
                  },
                  {
                    label: "Cek Gejala",
                    count: stats.symptomChecks,
                    color: "bg-amber-500",
                  },
                  {
                    label: "Data Kesehatan",
                    count: stats.healthMetrics,
                    color: "bg-green-500",
                  },
                  {
                    label: "Pengobatan",
                    count: stats.medications,
                    color: "bg-purple-500",
                  },
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 w-24 truncate">
                      {item.label}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-2 rounded-full ${item.color} transition-all duration-300`}
                          style={{
                            width: `${Math.min(100, (item.count / Math.max(1, stats.consultations + stats.symptomChecks)) * 100)}%`,
                          }}
                        ></div>
                        <span className="text-xs font-medium">
                          {item.count}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Rata-rata per bulan:</span>
                  <span className="font-medium">
                    {Math.round(
                      (stats.consultations + stats.symptomChecks) / 3
                    )}{" "}
                    aktivitas
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Health Metrics Breakdown */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity size={16} />
              Detail Data Kesehatan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {healthMetricsBreakdown.map((metric, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded border">
                      {metric.icon}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{metric.label}</p>
                      <p className="text-xs text-gray-500">
                        {metric.count > 0
                          ? `${metric.count} entri`
                          : "Belum ada data"}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {metric.count > 0 ? "Aktif" : "Kosong"}
                  </Badge>
                </div>
              ))}

              <div className="pt-3 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Entri:</span>
                  <span className="font-medium">
                    {stats.healthMetrics || 0}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {stats.healthMetrics > 10
                    ? "Sangat aktif"
                    : stats.healthMetrics > 5
                      ? "Aktif"
                      : stats.healthMetrics > 0
                        ? "Minimal"
                        : "Belum mulai"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Usage */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap size={16} />
              Penggunaan Sistem
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Kepuasan Fitur</span>
                  <span className="font-medium">85%</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Retensi Pengguna</span>
                  <span className="font-medium">92%</span>
                </div>
                <Progress value={92} className="h-2" />
              </div>

              <div className="pt-3 border-t space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Waktu Rata-rata Sesi</span>
                  <span className="font-medium">12 menit</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Fitur Paling Digunakan</span>
                  <span className="font-medium">Cek Gejala</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Frekuensi Login</span>
                  <span className="font-medium">3x/minggu</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights & Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <AlertTriangle size={16} />
            Insights & Rekomendasi
          </CardTitle>
          <CardDescription>
            Analisis otomatis berdasarkan data pengguna
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CheckCircle size={20} className="text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-blue-800 mb-2">
                    Kinerja Baik
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    {stats.consultations > 2 && (
                      <li>
                        • Aktif dalam konsultasi ({stats.consultations} sesi)
                      </li>
                    )}
                    {stats.symptomChecks > 3 && (
                      <li>
                        • Rajin memantau gejala ({stats.symptomChecks} kali)
                      </li>
                    )}
                    {stats.medicalProfile && (
                      <li>• Profil medis sudah lengkap</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            <div
              className={`p-4 rounded-lg border ${
                engagementScore < 50
                  ? "bg-amber-50 border-amber-200"
                  : "bg-green-50 border-green-200"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    engagementScore < 50 ? "bg-amber-100" : "bg-green-100"
                  }`}
                >
                  {engagementScore < 50 ? (
                    <TrendingDown size={20} className="text-amber-600" />
                  ) : (
                    <TrendingUp size={20} className="text-green-600" />
                  )}
                </div>
                <div>
                  <h4
                    className={`font-medium mb-2 ${
                      engagementScore < 50 ? "text-amber-800" : "text-green-800"
                    }`}
                  >
                    {engagementScore < 50
                      ? "Perlu Ditingkatkan"
                      : "Engagement Tinggi"}
                  </h4>
                  <ul
                    className={`text-sm space-y-1 ${
                      engagementScore < 50 ? "text-amber-700" : "text-green-700"
                    }`}
                  >
                    {engagementScore < 50 ? (
                      <>
                        <li>• Aktivitas penggunaan masih rendah</li>
                        <li>• Rekomendasi: Notifikasi pengingat</li>
                        <li>• Edukasi fitur yang tersedia</li>
                      </>
                    ) : (
                      <>
                        <li>• Pengguna sangat aktif</li>
                        <li>• Potensi untuk program loyalitas</li>
                        <li>• Kandidat user ambassador</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            {/* Additional recommendations based on data */}
            <div className="md:col-span-2">
              <div className="bg-gray-50 p-4 rounded-lg border">
                <h4 className="font-medium mb-3">Rekomendasi Spesifik</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {stats.emergencyContacts === 0 && (
                    <div className="flex items-center gap-2 p-3 bg-white rounded border">
                      <ShieldAlert size={16} className="text-rose-600" />
                      <span className="text-sm">Tambahkan kontak darurat</span>
                    </div>
                  )}
                  {stats.healthMetrics < 5 && stats.healthMetrics > 0 && (
                    <div className="flex items-center gap-2 p-3 bg-white rounded border">
                      <Activity size={16} className="text-green-600" />
                      <span className="text-sm">
                        Tambah data kesehatan rutin
                      </span>
                    </div>
                  )}
                  {stats.medications === 0 &&
                    stats.medicalProfile?.medications && (
                      <div className="flex items-center gap-2 p-3 bg-white rounded border">
                        <Pill size={16} className="text-purple-600" />
                        <span className="text-sm">Atur pengingat obat</span>
                      </div>
                    )}
                  {stats.consultations === 0 && stats.symptomChecks > 0 && (
                    <div className="flex items-center gap-2 p-3 bg-white rounded border">
                      <Stethoscope size={16} className="text-blue-600" />
                      <span className="text-sm">
                        Jadwalkan konsultasi pertama
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Progress Component (jika belum ada)
// app/components/ui/progress.tsx
