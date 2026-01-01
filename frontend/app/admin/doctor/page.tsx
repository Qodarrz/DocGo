'use client';

import { useEffect, useState } from 'react';
import DoctorList from '@/app/admin/components/doctor/DoctorList';
import { getDoctors, Doctor } from '@/client/admindoctor';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export default function DoctorPage() {
  const [doctors, setDoctors] = useState<Doctor[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await getDoctors();
        setDoctors(response.data);
      } catch (error) {
        console.error('Gagal memuat data dokter', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) return <DoctorListSkeleton />;
  if (!doctors) return <DoctorListError />;

  return <DoctorList initialDoctors={doctors} />;
}

function DoctorListSkeleton() {
  return (
    <Card>
      <CardContent className="py-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}

function DoctorListError() {
  return (
    <Card>
      <CardContent className="py-8 text-center">
        <p className="text-red-600">Gagal memuat data dokter</p>
        <p className="text-sm text-muted-foreground mt-2">
          Silakan refresh halaman atau coba lagi nanti
        </p>
      </CardContent>
    </Card>
  );
}
