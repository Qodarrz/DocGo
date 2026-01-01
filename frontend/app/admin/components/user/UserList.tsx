'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Search, 
  MoreHorizontal, 
  UserPlus, 
  Edit, 
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { adminUserApi, User, UserFilters } from '@/client/adminuser';
import { toast } from 'sonner';
import CreateUserDialog from '@/app/admin/components/user/CreateUserDialog';
import DeleteUserDialog from '@/app/admin/components/user/DeleteUserDialog';

export default function UserList() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<UserFilters>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await adminUserApi.getUsers({
        ...filters,
        search: search || undefined,
      });
      setUsers(response.data);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Gagal memuat data pengguna');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [filters, search]);

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setFilters(prev => ({ ...prev, page: 1 }));
  };

  const handleRoleFilter = (role: string) => {
    setFilters(prev => ({ 
      ...prev, 
      role: role || undefined,
      page: 1 
    }));
  };

  const handleVerificationFilter = (verified: string) => {
    setFilters(prev => ({
      ...prev,
      emailVerified: verified === 'true' ? true : verified === 'false' ? false : undefined,
      page: 1,
    }));
  };

  const handleSort = (field: string) => {
    setFilters(prev => ({
      ...prev,
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === 'desc' ? 'asc' : 'desc',
    }));
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      await adminUserApi.deleteUser(selectedUser.id);
      toast.success('Pengguna berhasil dihapus');
      loadUsers();
      setDeleteDialogOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Gagal menghapus pengguna');
    }
  };

  const handleToggleVerification = async (id: string) => {
    try {
      await adminUserApi.toggleVerification(id);
      toast.success('Status verifikasi berhasil diubah');
      loadUsers();
    } catch (error) {
      console.error('Error toggling verification:', error);
      toast.error('Gagal mengubah status verifikasi');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800';
      case 'DOCTOR': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
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

  if (loading && users.length === 0) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-10 w-full mb-4" />
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Header dengan filter */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <Input
                    placeholder="Cari pengguna (nama, email, telepon)..."
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Select onValueChange={handleRoleFilter}>
                  <SelectTrigger className="w-[180px]">
                    <Filter size={16} className="mr-2" />
                    <SelectValue placeholder="Filter Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Semua Role</SelectItem>
                    <SelectItem value="USER">User</SelectItem>
                    <SelectItem value="DOCTOR">Dokter</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>

                <Select onValueChange={handleVerificationFilter}>
                  <SelectTrigger className="w-[180px]">
                    <Filter size={16} className="mr-2" />
                    <SelectValue placeholder="Status Verifikasi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="true">Terverifikasi</SelectItem>
                    <SelectItem value="false">Belum diverifikasi</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" onClick={loadUsers}>
                  <RefreshCw size={16} className="mr-2" />
                  Refresh
                </Button>

                <Button onClick={() => setCreateDialogOpen(true)}>
                  <UserPlus size={16} className="mr-2" />
                  Tambah User
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabel User */}
        <Card>
          <CardContent className="pt-6">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('fullName')}>
                      Nama
                      {filters.sortBy === 'fullName' && (
                        <span className="ml-1">{filters.sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('createdAt')}>
                      Tanggal Bergabung
                      {filters.sortBy === 'createdAt' && (
                        <span className="ml-1">{filters.sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        Tidak ada data pengguna
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                              {user.userProfile ? (
                                <img
                                  src={user.userProfile}
                                  alt={user.fullName}
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-sm font-medium">
                                  {user.fullName?.charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div>
                              <div className="font-medium">{user.fullName}</div>
                              <div className="text-sm text-gray-500">
                                {user.phone || 'No phone'}
                                {user.isDoctor && (
                                  <span className="ml-2 text-blue-600">• Dokter</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{user.email}</div>
                          <div className="text-sm text-gray-500">
                            {user.gender && getGenderText(user.gender)}
                            {user.dateOfBirth && ` • ${user.age} tahun`}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getRoleColor(user.role)}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {formatDate(user.createdAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {user.emailVerified ? (
                              <Badge className="bg-green-100 text-green-800">
                                <CheckCircle size={12} className="mr-1" />
                                Terverifikasi
                              </Badge>
                            ) : (
                              <Badge className="bg-yellow-100 text-yellow-800">
                                <XCircle size={12} className="mr-1" />
                                Belum diverifikasi
                              </Badge>
                            )}
                            {user.stats.consultations > 0 && (
                              <Badge variant="outline" className="text-xs">
                                {user.stats.consultations} konsultasi
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal size={16} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => router.push(`/admin/user/${user.id}`)}>
                                <Eye size={14} className="mr-2" />
                                Detail
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => router.push(`/admin/user/${user.id}/edit`)}>
                                <Edit size={14} className="mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleToggleVerification(user.id)}>
                                {user.emailVerified ? (
                                  <>
                                    <XCircle size={14} className="mr-2" />
                                    Batalkan Verifikasi
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle size={14} className="mr-2" />
                                    Verifikasi Email
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 size={14} className="mr-2" />
                                Hapus
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-500">
                  Menampilkan {((pagination.page - 1) * pagination.limit) + 1} -{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} dari{' '}
                  {pagination.total} pengguna
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                  >
                    Sebelumnya
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.page <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.page >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = pagination.page - 2 + i;
                      }
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={pagination.page === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                  >
                    Selanjutnya
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <CreateUserDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={() => {
          loadUsers();
          setCreateDialogOpen(false);
        }}
      />

      <DeleteUserDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        user={selectedUser}
        onConfirm={handleDeleteUser}
      />
    </>
  );
}