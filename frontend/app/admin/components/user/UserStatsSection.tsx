'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { adminUserApi } from '@/client/adminuser';
import { 
  Users, 
  UserCheck, 
  UserPlus, 
  Activity,
  UserCog,
  TrendingUp
} from 'lucide-react';

export default function UserStatsSection() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await adminUserApi.getUserStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error loading user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-8 w-24 mb-2" />
              <Skeleton className="h-4 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      title: 'Total Pengguna',
      value: stats.overview.totalUsers,
      description: 'Semua user terdaftar',
      icon: <Users className="h-8 w-8 text-blue-600" />,
      color: 'bg-blue-50 border-blue-100',
    },
    {
      title: 'Pengguna Aktif',
      value: stats.overview.activeToday,
      description: 'Aktif hari ini',
      icon: <Activity className="h-8 w-8 text-green-600" />,
      color: 'bg-green-50 border-green-100',
    },
    {
      title: 'Pengguna Baru',
      value: stats.overview.todayNewUsers,
      description: 'Bergabung hari ini',
      icon: <UserPlus className="h-8 w-8 text-amber-600" />,
      color: 'bg-amber-50 border-amber-100',
    },
    {
      title: 'Terverifikasi',
      value: `${stats.overview.verificationRate}%`,
      description: 'Email terverifikasi',
      icon: <UserCheck className="h-8 w-8 text-purple-600" />,
      color: 'bg-purple-50 border-purple-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => (
        <Card key={index} className={stat.color}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <h3 className="text-2xl font-bold mt-2">{stat.value}</h3>
                <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
              </div>
              <div className="p-3 rounded-lg bg-white">
                {stat.icon}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}