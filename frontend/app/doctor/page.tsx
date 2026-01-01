import DashboardContent from "@/app/doctor/components/dashboard/DashboardContent";
import { getAccessToken } from "../../client/server-auth";

export default async function DoctorDashboardPage() {
  const dashboardData = await getDashboardData();
  return <DashboardContent initialData={dashboardData} />;
}

async function getDashboardData() {
  try {
    const token = await getAccessToken();

    if (!token) {
      throw new Error("Missing access token");
    }

    const res = await fetch("http://localhost:3000/doctor/dashboard", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`API error ${res.status}`);
    }

    const result = await res.json();
    return transformApiData(result.data);
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return getFallbackData();
  }
}

// Fungsi untuk transform data dari API ke format frontend
function transformApiData(apiData: any) {
  const {
    statistics,
    trends,
    patientDemographics,
    upcomingConsultations,
    recentActivities,
    recentCompletedConsultations,
    doctorInfo,
  } = apiData;

  // Transform statistics ke cardsData
  const cardsData = statistics.map((stat: any) => {
    const getColor = (title: string) => {
      switch (title) {
        case "Total Consultations":
          return "bg-blue-500";
        case "Active Patients":
          return "bg-green-500";
        case "Pending Medications":
          return "bg-amber-500";
        case "Appointments Today":
          return "bg-purple-500";
        case "Avg. Session Time":
          return "bg-indigo-500";
        case "Satisfaction Rate":
          return "bg-emerald-500";
        default:
          return "bg-gray-500";
      }
    };

    // Format value dengan unit
    const formatValue = (value: any, title: string, unit?: string) => {
      if (unit === "%") return `${value}%`;
      if (typeof value === "number") {
        if (title === "Avg. Session Time") return `${value}m`;
        return value.toString();
      }
      return value.toString();
    };

    return {
      title: stat.title,
      value: formatValue(stat.value, stat.unit || ""),
      change: stat.change || "0%",
      isPositive: stat.change?.includes("+") || false,
      icon: stat.icon,
      color: getColor(stat.title),
      description: stat.description,
    };
  });

  // Transform trends
  const consultationData = {
    week: trends.weekly.map((week: any) => ({
      day: week.day,
      consultations: week.consultations,
      followups: week.followups,
    })),
    month: trends.monthly.map((month: any) => ({
      week: `Week ${month.weekNumber}`,
      consultations: month.consultations,
      followups: month.followups,
    })),
    year: trends.yearly.map((year: any) => ({
      month: year.monthName,
      consultations: year.consultations,
      followups: year.followups,
    })),
  };

  // Transform recent completed consultations menjadi activities
  const allActivities = recentCompletedConsultations.map((consult: any) => ({
    id: consult.id,
    patient: consult.patientName,
    type:
      consult.type === "GENERAL"
        ? "Consultation"
        : consult.type === "SPECIALIST"
          ? "Specialist Referral"
          : consult.type === "PSYCHOLOGY"
            ? "Psychology"
            : consult.type,
    time: consult.completedAt
      ? new Date(consult.completedAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "N/A",
    date: consult.completedAt
      ? new Date(consult.completedAt).toLocaleDateString()
      : "N/A",
    duration: consult.duration ? `${consult.duration} minutes` : "Not set",
    status: "completed",
    isNew: false,
  }));

  // Transform age distribution
  const ageDistribution = patientDemographics.ageDistribution.map(
    (group: any) => ({
      range: group.range,
      count: group.count,
    })
  );

  // Transform consultation types
  const consultationTypes = patientDemographics.consultationTypes.map(
    (type: any) => {
      const typeName =
        type.type === "GENERAL"
          ? "General Check-up"
          : type.type === "SPECIALIST"
            ? "Specialist Referral"
            : type.type === "PSYCHOLOGY"
              ? "Psychology"
              : type.type;

      const getColor = (type: string) => {
        switch (type) {
          case "GENERAL":
            return "bg-blue-500";
          case "SPECIALIST":
            return "bg-purple-500";
          case "PSYCHOLOGY":
            return "bg-green-500";
          default:
            return "bg-gray-500";
        }
      };

      return {
        type: typeName,
        count: type.count,
        color: getColor(type.type),
      };
    }
  );

  // Hitung peak hours dari recentCompletedConsultations
  const calculatePeakHours = (consultations: any[]) => {
    if (consultations.length === 0) {
      return [
        { time: "8:00 AM - 10:00 AM", percentage: 0, patients: "No Data" },
        { time: "10:00 AM - 12:00 PM", percentage: 0, patients: "No Data" },
        { time: "12:00 PM - 2:00 PM", percentage: 0, patients: "No Data" },
        { time: "2:00 PM - 4:00 PM", percentage: 0, patients: "No Data" },
        { time: "4:00 PM - 6:00 PM", percentage: 0, patients: "No Data" },
      ];
    }

    // Kelompokkan berdasarkan jam
    const hoursCount: Record<string, number> = {};
    consultations.forEach((consult) => {
      if (consult.completedAt) {
        const hour = new Date(consult.completedAt).getHours();
        const hourRange = getHourRange(hour);
        hoursCount[hourRange] = (hoursCount[hourRange] || 0) + 1;
      }
    });

    // Hitung persentase
    const total = consultations.length;
    const timeSlots = [
      "8:00 AM - 10:00 AM",
      "10:00 AM - 12:00 PM",
      "12:00 PM - 2:00 PM",
      "2:00 PM - 4:00 PM",
      "4:00 PM - 6:00 PM",
    ];

    return timeSlots.map((slot) => {
      const count = hoursCount[slot] || 0;
      const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

      let patients = "Low Traffic";
      if (percentage > 60) patients = "High Traffic";
      else if (percentage > 30) patients = "Moderate";
      else if (percentage > 0) patients = "Low Traffic";

      return {
        time: slot,
        percentage,
        patients,
      };
    });
  };

  const peakHours = calculatePeakHours(recentCompletedConsultations);

  // Transform doctor info
  const transformedDoctorInfo = {
    name: "Dr. General", // Asumsi nama dokter
    specialization:
      doctorInfo.specialization === "GENERAL"
        ? "General Practitioner"
        : doctorInfo.specialization,
    experience: doctorInfo.experience,
    bio: doctorInfo.bio,
  };

  return {
    cardsData,
    consultationData,
    recentActivities: allActivities,
    ageDistribution,
    consultationTypes,
    peakHours,
    doctorInfo: transformedDoctorInfo,
  };
}

// Helper function untuk menentukan range jam
function getHourRange(hour: number): string {
  if (hour >= 8 && hour < 10) return "8:00 AM - 10:00 AM";
  if (hour >= 10 && hour < 12) return "10:00 AM - 12:00 PM";
  if (hour >= 12 && hour < 14) return "12:00 PM - 2:00 PM";
  if (hour >= 14 && hour < 16) return "2:00 PM - 4:00 PM";
  if (hour >= 16 && hour < 18) return "4:00 PM - 6:00 PM";
  return "Other Time";
}

// Fallback data jika API gagal
function getFallbackData() {
  return {
    cardsData: [
      {
        title: "Total Consultations",
        value: "0",
        change: "0%",
        isPositive: true,
        icon: "users",
        color: "bg-blue-500",
        description: "Last 30 days",
      },
      {
        title: "Active Patients",
        value: "0",
        change: "0%",
        isPositive: true,
        icon: "activity",
        color: "bg-green-500",
        description: "Last 7 days",
      },
      {
        title: "Pending Medications",
        value: "0",
        change: "0%",
        isPositive: true,
        icon: "clock",
        color: "bg-amber-500",
        description: "Require review",
      },
      {
        title: "Appointments Today",
        value: "0",
        change: "0%",
        isPositive: true,
        icon: "calendar",
        color: "bg-purple-500",
        description: "Scheduled for today",
      },
      {
        title: "Avg. Session Time",
        value: "0m",
        change: "0%",
        isPositive: true,
        icon: "clock",
        color: "bg-indigo-500",
        description: "Minutes per consultation",
      },
      {
        title: "Satisfaction Rate",
        value: "0%",
        change: "0%",
        isPositive: true,
        icon: "trending-up",
        color: "bg-emerald-500",
        description: "Based on patient feedback",
      },
    ],
    consultationData: {
      week: [
        { day: "Thu", consultations: 0, followups: 0 },
        { day: "Fri", consultations: 0, followups: 0 },
        { day: "Sat", consultations: 0, followups: 0 },
        { day: "Sun", consultations: 0, followups: 0 },
        { day: "Mon", consultations: 0, followups: 0 },
        { day: "Tue", consultations: 0, followups: 0 },
        { day: "Wed", consultations: 0, followups: 0 },
      ],
      month: [
        { week: "Week 1", consultations: 0, followups: 0 },
        { week: "Week 2", consultations: 0, followups: 0 },
        { week: "Week 3", consultations: 0, followups: 0 },
        { week: "Week 4", consultations: 0, followups: 0 },
      ],
      year: [
        { month: "Jul", consultations: 0, followups: 0 },
        { month: "Aug", consultations: 0, followups: 0 },
        { month: "Sep", consultations: 0, followups: 0 },
        { month: "Oct", consultations: 0, followups: 0 },
        { month: "Nov", consultations: 0, followups: 0 },
        { month: "Dec", consultations: 0, followups: 0 },
      ],
    },
    recentActivities: [],
    ageDistribution: [
      { range: "18-25", count: 0 },
      { range: "26-35", count: 0 },
      { range: "36-45", count: 0 },
      { range: "46-55", count: 0 },
      { range: "56-65", count: 0 },
      { range: "65+", count: 0 },
    ],
    consultationTypes: [
      { type: "General Check-up", count: 0, color: "bg-blue-500" },
    ],
    peakHours: [
      { time: "8:00 AM - 10:00 AM", percentage: 0, patients: "No Data" },
      { time: "10:00 AM - 12:00 PM", percentage: 0, patients: "No Data" },
      { time: "12:00 PM - 2:00 PM", percentage: 0, patients: "No Data" },
      { time: "2:00 PM - 4:00 PM", percentage: 0, patients: "No Data" },
      { time: "4:00 PM - 6:00 PM", percentage: 0, patients: "No Data" },
    ],
    doctorInfo: {
      name: "Doctor",
      specialization: "General Practitioner",
      experience: 0,
      bio: "No data available",
    },
  };
}
