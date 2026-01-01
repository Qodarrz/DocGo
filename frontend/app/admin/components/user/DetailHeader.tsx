'use client';

import { User } from '@/client/adminuser';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Mail, 
  Phone, 
  Calendar, 
  User as UserIcon,
  Edit,
  ArrowLeft,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface DetailHeaderProps {
  user: User;
}

export default function DetailHeader({ user }: DetailHeaderProps) {
  const router = useRouter();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800 border-red-200';
      case 'DOCTOR': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getGenderText = (gender: string | null) => {
    switch (gender) {
      case 'MALE': return 'Laki-laki';
      case 'FEMALE': return 'Perempuan';
      case 'OTHER': return 'Lainnya';
      default: return 'Tidak diketahui';
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* User Avatar */}
          <div className="flex-shrink-0">
            <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden">
              {user.userProfile ? (
                <img
                  src={user.userProfile}
                  alt={user.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                  <UserIcon size={40} className="text-gray-400" />
                </div>
              )}
            </div>
          </div>

          {/* User Info */}
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold">{user.fullName}</h1>
                  <Badge className={getRoleColor(user.role)}>
                    {user.role}
                  </Badge>
                  {user.isDoctor && (
                    <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                      Dokter
                    </Badge>
                  )}
                  {user.emailVerified ? (
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      <CheckCircle size={12} className="mr-1" />
                      Terverifikasi
                    </Badge>
                  ) : (
                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                      <XCircle size={12} className="mr-1" />
                      Belum diverifikasi
                    </Badge>
                  )}
                </div>
                <p className="text-gray-600 mb-4">ID: {user.id}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.back()}
                >
                  <ArrowLeft size={16} className="mr-2" />
                  Kembali
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => router.push(`/admin/user/${user.id}/edit`)}
                >
                  <Edit size={16} className="mr-2" />
                  Edit
                </Button>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Mail size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <Phone size={20} className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Telepon</p>
                  <p className="font-medium">{user.phone || 'Tidak ada'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <Calendar size={20} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tanggal Lahir</p>
                  <p className="font-medium">
                    {user.dateOfBirth 
                      ? `${new Date(user.dateOfBirth).toLocaleDateString('id-ID')} (${user.age} tahun)`
                      : 'Tidak diketahui'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-pink-50 rounded-lg">
                  <UserIcon size={20} className="text-pink-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Jenis Kelamin</p>
                  <p className="font-medium">{getGenderText(user.gender)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-50 rounded-lg">
                  <Calendar size={20} className="text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Bergabung Pada</p>
                  <p className="font-medium">{formatDate(user.createdAt)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <Calendar size={20} className="text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Terakhir Diperbarui</p>
                  <p className="font-medium">{formatDate(user.updatedAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}