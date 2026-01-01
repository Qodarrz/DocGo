'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Edit,
  Mail,
  Phone,
  Calendar,
  User,
  Briefcase,
  Award,
  FileText,
  Activity,
  MessageSquare,
  Clock,
} from 'lucide-react';
import { getDoctorById, getDoctorStats, Doctor, DoctorStats } from '@/client/admindoctor';

export default function DoctorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [stats, setStats] = useState<DoctorStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctorData();
  }, [params.id]);

  const fetchDoctorData = async () => {
    setLoading(true);
    try {
      const [doctorResponse, statsResponse] = await Promise.all([
        getDoctorById(params.id as string),
        getDoctorStats(params.id as string),
      ]);
      setDoctor(doctorResponse.data);
      setStats(statsResponse.data);
    } catch (error) {
      toast.error('Gagal memuat data dokter');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <Skeleton className="h-48 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-32 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Dokter tidak ditemukan</h3>
              <p className="text-muted-foreground mt-2">
                Data dokter yang Anda cari tidak ditemukan
              </p>
              <Button onClick={() => router.push('/admin/doctor')} className="mt-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali ke Daftar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.push('/admin/doctor')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Detail Dokter</h1>
            <p className="text-muted-foreground">Informasi lengkap dokter {doctor.user.fullName}</p>
          </div>
        </div>
        <Button onClick={() => router.push(`/admin/doctor/${doctor.id}/edit`)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Data
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle>Profil Dokter</CardTitle>
              <CardDescription>Informasi pribadi dan profesional</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex-shrink-0">
                  <div className="h-48 w-48 rounded-lg overflow-hidden bg-muted">
                    <img
                      src={doctor.image || doctor.user.userProfile || '/default-avatar.png'}
                      alt={doctor.user.fullName || ''}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold">{doctor.user.fullName}</h2>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="default" className="capitalize">
                        {doctor.specialization}
                      </Badge>
                      <Badge variant={doctor.isActive ? 'default' : 'secondary'}>
                        {doctor.isActive ? 'Aktif' : 'Tidak Aktif'}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        Email
                      </div>
                      <p className="font-medium">{doctor.user.email}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        Telepon
                      </div>
                      <p className="font-medium">{doctor.user.phone || '-'}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        Bergabung
                      </div>
                      <p className="font-medium">{formatDate(doctor.createdAt)}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Briefcase className="h-4 w-4" />
                        Pengalaman
                      </div>
                      <p className="font-medium">
                        {doctor.experienceYear ? `${doctor.experienceYear} tahun` : '-'}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Award className="h-4 w-4" />
                      Nomor Lisensi
                    </div>
                    <p className="font-medium">{doctor.licenseNumber || 'Tidak tersedia'}</p>
                  </div>

                  {doctor.bio && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FileText className="h-4 w-4" />
                        Bio
                      </div>
                      <p className="text-sm">{doctor.bio}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Statistik</CardTitle>
              <CardDescription>Data kinerja dokter</CardDescription>
            </CardHeader>
            <CardContent>
              {stats ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2 text-center p-4 border rounded-lg">
                    <Activity className="h-8 w-8 mx-auto text-primary" />
                    <p className="text-2xl font-bold">{stats.totalConsultations}</p>
                    <p className="text-sm text-muted-foreground">Total Konsultasi</p>
                  </div>
                  <div className="space-y-2 text-center p-4 border rounded-lg">
                    <MessageSquare className="h-8 w-8 mx-auto text-primary" />
                    <p className="text-2xl font-bold">{stats.activeChatRooms}</p>
                    <p className="text-sm text-muted-foreground">Chat Aktif</p>
                  </div>
                  <div className="space-y-2 text-center p-4 border rounded-lg">
                    <Clock className="h-8 w-8 mx-auto text-primary" />
                    <p className="text-2xl font-bold">{stats.completionRate}</p>
                    <p className="text-sm text-muted-foreground">Tingkat Penyelesaian</p>
                  </div>
                  <div className="space-y-2 text-center p-4 border rounded-lg">
                    <Briefcase className="h-8 w-8 mx-auto text-primary" />
                    <p className="text-2xl font-bold">{stats.experienceYears}</p>
                    <p className="text-sm text-muted-foreground">Tahun Pengalaman</p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">Tidak ada data statistik</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Consultation Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Status Konsultasi</CardTitle>
              <CardDescription>Distribusi konsultasi</CardDescription>
            </CardHeader>
            <CardContent>
              {stats?.consultationStats ? (
                <div className="space-y-3">
                  {Object.entries(stats.consultationStats).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-2 w-2 rounded-full ${
                            status === 'completed'
                              ? 'bg-green-500'
                              : status === 'ongoing'
                              ? 'bg-blue-500'
                              : status === 'pending'
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                        />
                        <span className="capitalize">{status}</span>
                      </div>
                      <span className="font-semibold">{count}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Tidak ada data konsultasi</p>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Aktivitas Terbaru</CardTitle>
              <CardDescription>Konsultasi dalam 30 hari terakhir</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {stats?.recentConsultations ? (
                  <>
                    <p className="text-3xl font-bold">{stats.recentConsultations}</p>
                    <p className="text-sm text-muted-foreground">konsultasi dalam 30 hari terakhir</p>
                  </>
                ) : (
                  <p className="text-muted-foreground">Tidak ada aktivitas terbaru</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* User Info */}
          <Card>
            <CardHeader>
              <CardTitle>Informasi Pengguna</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">ID User</span>
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    {doctor.user.id.substring(0, 8)}...
                  </code>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Role</span>
                  <Badge variant="outline">{doctor.user.role}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Jenis Kelamin</span>
                  <span className="text-sm">
                    {doctor.user.gender === 'MALE'
                      ? 'Laki-laki'
                      : doctor.user.gender === 'FEMALE'
                      ? 'Perempuan'
                      : 'Lainnya'}
                  </span>
                </div>
                {doctor.user.dateOfBirth && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Tanggal Lahir</span>
                    <span className="text-sm">{formatDate(doctor.user.dateOfBirth)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}