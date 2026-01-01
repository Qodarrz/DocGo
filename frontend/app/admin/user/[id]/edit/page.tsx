'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { adminUserApi } from '@/client/adminuser';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import EditUserForm from '@/app/admin/components/user/EditUserForm';

export default function EditUserPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const response = await adminUserApi.getUserById(userId);
      setUser(response.data);
    } catch (error) {
      console.error('Error loading user:', error);
      toast.error('Gagal memuat data pengguna');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      loadUserData();
    }
  }, [userId]);

  const handleSuccess = () => {
    toast.success('Data pengguna berhasil diperbarui');
    router.push(`/admin/user/${userId}`);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-600">User tidak ditemukan</h2>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Pengguna</h1>
        <p className="text-gray-500">
          Edit data pengguna: {user.fullName}
        </p>
      </div>

      <EditUserForm user={user} onSuccess={handleSuccess} />
    </div>
  );
}