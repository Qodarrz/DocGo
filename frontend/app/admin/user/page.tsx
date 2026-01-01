import UserList from '../components/user/UserList';
import UserStatsSection from '@/app/admin/components/user/UserStatsSection';

export default function UserManagementPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manajemen Pengguna</h1>
        <p className="text-gray-500">
          Kelola semua pengguna sistem, termasuk pasien, dokter, dan admin
        </p>
      </div>

      <UserStatsSection />
      <UserList />
    </div>
  );
}