"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { adminUserApi } from "@/client/adminuser";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import DetailHeader from "@/app/admin/components/user/DetailHeader";
import UserStatsCards from "@/app/admin/components/user/UserStatsCards";
import UserActivitySection from "@/app/admin/components/user/UserActivitySection";
import UserMedicalInfo from "@/app/admin/components/user/UserMedicalInfo";

export default function UserDetailPage() {
  const params = useParams();
  const userId = params.id as string;

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const response = await adminUserApi.getUserById(userId);
      setUser(response.data);
    } catch (error) {
      console.error("Error loading user:", error);
      toast.error("Gagal memuat data pengguna");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      loadUserData();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-600">
          User tidak ditemukan
        </h2>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DetailHeader user={user} />
      <UserStatsCards stats={user.stats} />

      <UserActivitySection userId={userId} />
      <UserMedicalInfo user={user} />
    </div>
  );
}
