'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Loader2, Save, X, Eye, EyeOff, RefreshCw, ShieldAlert, Mail, User, Phone, Calendar } from 'lucide-react';
import { adminUserApi } from '@/client/adminuser';
import DeleteUserDialog from './DeleteUserDialog';

interface EditUserFormProps {
  user: any;
  onSuccess?: () => void;
}

export default function EditUserForm({ user, onSuccess }: EditUserFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // State untuk form data
  const [formData, setFormData] = useState({
    // Basic Info
    email: user.email || '',
    fullName: user.fullName || '',
    phone: user.phone || '',
    dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
    gender: user.gender || '',
    
    // Account Settings
    role: user.role || 'USER',
    emailVerified: user.emailVerified || false,
    
    // Password (optional)
    password: '',
    confirmPassword: '',
  });

  // Handle input changes
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi password jika diisi
    if (formData.password) {
      if (formData.password.length < 6) {
        toast.error('Password minimal 6 karakter');
        return;
      }
      
      if (formData.password !== formData.confirmPassword) {
        toast.error('Password dan konfirmasi password tidak sama');
        return;
      }
    }
    
    // Validasi email
    if (!formData.email || !formData.fullName) {
      toast.error('Email dan nama lengkap wajib diisi');
      return;
    }
    
    try {
      setLoading(true);
      
      // Prepare update data
      const updateData: any = {
        email: formData.email,
        fullName: formData.fullName,
        phone: formData.phone || null,
        dateOfBirth: formData.dateOfBirth || null,
        gender: formData.gender || null,
        role: formData.role,
        emailVerified: formData.emailVerified,
      };
      
      // Only include password if provided
      if (formData.password) {
        updateData.password = formData.password;
      }
      
      // Update user
      await adminUserApi.updateUser(user.id, updateData);
      
      toast.success('Data pengguna berhasil diperbarui');
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      } else {
        // Default behavior: go back to user detail
        router.push(`/admin/user/${user.id}`);
      }
      
    } catch (error: any) {
      console.error('Error updating user:', error);
      
      // Handle specific error messages
      const errorMessage = error.response?.data?.message || 'Gagal memperbarui data pengguna';
      
      if (errorMessage.includes('email sudah digunakan')) {
        toast.error('Email sudah digunakan oleh user lain');
      } else if (errorMessage.includes('nomor telepon')) {
        toast.error('Nomor telepon sudah digunakan oleh user lain');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    router.back();
  };

  // Handle delete user
  const handleDeleteUser = async () => {
    try {
      await adminUserApi.deleteUser(user.id);
      toast.success('Pengguna berhasil dihapus');
      router.push('/admin/user');
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error(error.response?.data?.message || 'Gagal menghapus pengguna');
    }
  };

  // Toggle email verification
  const handleToggleVerification = async () => {
    try {
      const response = await adminUserApi.toggleVerification(user.id);
      toast.success(response.message);
      
      // Update local state
      setFormData(prev => ({
        ...prev,
        emailVerified: !prev.emailVerified
      }));
    } catch (error: any) {
      console.error('Error toggling verification:', error);
      toast.error(error.response?.data?.message || 'Gagal mengubah status verifikasi');
    }
  };

  // Reset form to original values
  const handleResetForm = () => {
    setFormData({
      email: user.email || '',
      fullName: user.fullName || '',
      phone: user.phone || '',
      dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
      gender: user.gender || '',
      role: user.role || 'USER',
      emailVerified: user.emailVerified || false,
      password: '',
      confirmPassword: '',
    });
    toast.info('Form telah direset ke nilai awal');
  };

  // Format user info for display
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Tidak diketahui';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
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
    <>
      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">
            <User size={16} className="mr-2" />
            Informasi Dasar
          </TabsTrigger>
          <TabsTrigger value="account">
            <ShieldAlert size={16} className="mr-2" />
            Pengaturan Akun
          </TabsTrigger>
          <TabsTrigger value="danger">
            <ShieldAlert size={16} className="mr-2" />
            Zona Berbahaya
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Basic Information */}
        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Dasar Pengguna</CardTitle>
              <CardDescription>
                Kelola informasi dasar pengguna seperti nama, kontak, dan data pribadi
              </CardDescription>
            </CardHeader>
            
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                {/* User Info Summary */}
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden border">
                      {user.userProfile ? (
                        <img 
                          src={user.userProfile} 
                          alt={user.fullName} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                          <User size={24} className="text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold">{user.fullName}</h3>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">
                          {user.role}
                        </Badge>
                        <Badge variant={user.emailVerified ? "default" : "outline"}>
                          {user.emailVerified ? 'Terverifikasi' : 'Belum diverifikasi'}
                        </Badge>
                        {user.isDoctor && (
                          <Badge className="bg-blue-100 text-blue-800">
                            Dokter
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      <Mail size={14} className="inline mr-2" />
                      Email Address *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="user@example.com"
                      required
                    />
                    <p className="text-xs text-gray-500">Email digunakan untuk login dan notifikasi</p>
                  </div>

                  {/* Full Name */}
                  <div className="space-y-2">
                    <Label htmlFor="fullName">
                      <User size={14} className="inline mr-2" />
                      Nama Lengkap *
                    </Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      placeholder="Nama lengkap pengguna"
                      required
                    />
                    <p className="text-xs text-gray-500">Nama lengkap seperti di KTP</p>
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      <Phone size={14} className="inline mr-2" />
                      Nomor Telepon
                    </Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="0812-3456-7890"
                    />
                    <p className="text-xs text-gray-500">Format: 08xx-xxxx-xxxx</p>
                  </div>

                  {/* Date of Birth */}
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">
                      <Calendar size={14} className="inline mr-2" />
                      Tanggal Lahir
                    </Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    />
                    {user.dateOfBirth && (
                      <p className="text-xs text-gray-500">
                        Saat ini: {formatDate(user.dateOfBirth)} ({user.age} tahun)
                      </p>
                    )}
                  </div>

                  {/* Gender */}
                  <div className="space-y-2">
                    <Label htmlFor="gender">Jenis Kelamin</Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(value) => handleInputChange('gender', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih jenis kelamin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MALE">Laki-laki</SelectItem>
                        <SelectItem value="FEMALE">Perempuan</SelectItem>
                        <SelectItem value="OTHER">Lainnya</SelectItem>
                      </SelectContent>
                    </Select>
                    {user.gender && (
                      <p className="text-xs text-gray-500">
                        Saat ini: {getGenderText(user.gender)}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex justify-between border-t pt-6">
                <Button type="button" variant="outline" onClick={handleCancel} disabled={loading}>
                  <X size={16} className="mr-2" />
                  Batal
                </Button>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={handleResetForm} disabled={loading}>
                    <RefreshCw size={16} className="mr-2" />
                    Reset
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Save size={16} className="mr-2" />
                    Simpan Perubahan
                  </Button>
                </div>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        {/* Tab 2: Account Settings */}
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Akun</CardTitle>
              <CardDescription>
                Kelola pengaturan akun, role, dan keamanan
              </CardDescription>
            </CardHeader>
            
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                {/* Role Selection */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="role">Role Pengguna</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value) => handleInputChange('role', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USER">User (Pasien)</SelectItem>
                        <SelectItem value="DOCTOR">Dokter</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="mt-3 space-y-2">
                      <p className="text-sm font-medium">Deskripsi Role:</p>
                      {formData.role === 'USER' && (
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                          <p className="text-sm text-blue-800">
                            <strong>User (Pasien):</strong> Dapat mengakses fitur pasien seperti 
                            konsultasi, cek gejala, dan kelola profil kesehatan.
                          </p>
                        </div>
                      )}
                      {formData.role === 'DOCTOR' && (
                        <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                          <p className="text-sm text-purple-800">
                            <strong>Dokter:</strong> Dapat mengakses dashboard dokter, 
                            melihat konsultasi, dan berkomunikasi dengan pasien. 
                            <span className="block mt-1 text-amber-600">
                              ⚠️ Perubahan role ke DOCTOR memerlukan setup profile dokter terpisah.
                            </span>
                          </p>
                        </div>
                      )}
                      {formData.role === 'ADMIN' && (
                        <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                          <p className="text-sm text-red-800">
                            <strong>Admin:</strong> Akses penuh ke semua fitur admin termasuk 
                            manajemen user, dokter, dan sistem.
                            <span className="block mt-1 font-semibold">
                              ⚠️ Hanya berikan role ini kepada user terpercaya.
                            </span>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Email Verification */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="emailVerified">Verifikasi Email</Label>
                      <p className="text-sm text-gray-500">
                        {formData.emailVerified 
                          ? 'Email user telah diverifikasi' 
                          : 'Email user belum diverifikasi'}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleToggleVerification}
                      >
                        {formData.emailVerified ? 'Batalkan' : 'Verifikasi'}
                      </Button>
                      <Switch
                        id="emailVerified"
                        checked={formData.emailVerified}
                        onCheckedChange={(checked) => handleInputChange('emailVerified', checked)}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Change Password */}
                  <div className="space-y-4">
                    <div>
                      <Label>Ubah Password</Label>
                      <p className="text-sm text-gray-500">
                        Biarkan kosong jika tidak ingin mengubah password
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="password">Password Baru</Label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={formData.password}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                            placeholder="Minimal 6 karakter"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                        <div className="relative">
                          <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            value={formData.confirmPassword}
                            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                            placeholder="Ulangi password baru"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Password Strength Indicator */}
                    {formData.password && (
                      <div className="mt-2">
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`h-2 flex-1 rounded-full ${
                            formData.password.length >= 6 ? 'bg-green-500' : 'bg-gray-200'
                          }`}></div>
                          <div className={`h-2 flex-1 rounded-full ${
                            /[A-Z]/.test(formData.password) && /[0-9]/.test(formData.password) 
                              ? 'bg-green-500' 
                              : 'bg-gray-200'
                          }`}></div>
                          <div className={`h-2 flex-1 rounded-full ${
                            formData.password.length >= 8 && /[^A-Za-z0-9]/.test(formData.password)
                              ? 'bg-green-500' 
                              : 'bg-gray-200'
                          }`}></div>
                        </div>
                        <p className="text-xs text-gray-500">
                          Kekuatan password: {
                            formData.password.length >= 8 && 
                            /[A-Z]/.test(formData.password) && 
                            /[0-9]/.test(formData.password) && 
                            /[^A-Za-z0-9]/.test(formData.password)
                              ? 'Kuat' 
                              : formData.password.length >= 6 
                                ? 'Sedang' 
                                : 'Lemah'
                          }
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex justify-between border-t pt-6">
                <Button type="button" variant="outline" onClick={handleCancel} disabled={loading}>
                  <X size={16} className="mr-2" />
                  Batal
                </Button>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={handleResetForm} disabled={loading}>
                    <RefreshCw size={16} className="mr-2" />
                    Reset
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Save size={16} className="mr-2" />
                    Simpan Perubahan
                  </Button>
                </div>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        {/* Tab 3: Danger Zone */}
        <TabsContent value="danger">
          <Card className="border-red-200">
            <CardHeader className="bg-red-50 border-b border-red-200">
              <CardTitle className="text-red-700">Zona Berbahaya</CardTitle>
              <CardDescription className="text-red-600">
                Aksi pada bagian ini tidak dapat dibatalkan. Hati-hati!
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6 pt-6">
              {/* Delete Account */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="space-y-0.5">
                    <h4 className="font-semibold text-red-700">Hapus Akun Pengguna</h4>
                    <p className="text-sm text-red-600">
                      Menghapus akun ini akan {user.stats.consultations > 0 ? 'melakukan soft delete' : 'menghapus permanen'} 
                      semua data terkait.
                    </p>
                    
                    {/* Warning messages based on user data */}
                    {user.stats.consultations > 0 && (
                      <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded">
                        <p className="text-sm text-amber-800">
                          ⚠️ User ini memiliki {user.stats.consultations} konsultasi, 
                          {user.stats.healthMetrics} data kesehatan, dan {user.stats.medications} pengobatan.
                          Akun akan di-soft delete untuk menjaga integritas data.
                        </p>
                      </div>
                    )}
                    
                    {user.isDoctor && (
                      <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded">
                        <p className="text-sm text-blue-800">
                          ⚠️ User ini adalah dokter dengan spesialisasi: {user.doctorInfo?.specialization}.
                          Menghapus user ini juga akan mempengaruhi data dokter.
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    Hapus Akun
                  </Button>
                </div>

                {/* User Stats Summary for Context */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-gray-50 p-3 rounded-lg border text-center">
                    <div className="text-2xl font-bold text-gray-800">{user.stats.consultations}</div>
                    <div className="text-xs text-gray-600">Konsultasi</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border text-center">
                    <div className="text-2xl font-bold text-gray-800">{user.stats.healthMetrics}</div>
                    <div className="text-xs text-gray-600">Data Kesehatan</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border text-center">
                    <div className="text-2xl font-bold text-gray-800">{user.stats.medications}</div>
                    <div className="text-xs text-gray-600">Pengobatan</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border text-center">
                    <div className="text-2xl font-bold text-gray-800">{user.stats.symptomChecks}</div>
                    <div className="text-xs text-gray-600">Cek Gejala</div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Last Login Info */}
              <div className="space-y-3">
                <h4 className="font-semibold">Informasi Akun</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">ID Pengguna</p>
                    <p className="font-mono text-sm bg-gray-100 p-2 rounded">{user.id}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Bergabung Pada</p>
                    <p className="font-medium">{formatDate(user.createdAt)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Terakhir Diperbarui</p>
                    <p className="font-medium">{formatDate(user.updatedAt)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Status Akun</p>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        user.emailVerified ? 'bg-green-500' : 'bg-yellow-500'
                      }`}></div>
                      <span className="font-medium">
                        {user.emailVerified ? 'Aktif' : 'Belum diverifikasi'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex justify-between border-t pt-6">
              <Button type="button" variant="outline" onClick={handleCancel} disabled={loading}>
                <X size={16} className="mr-2" />
                Kembali
              </Button>
              <Button type="button" onClick={() => router.push(`/admin/user/${user.id}`)}>
                Lihat Detail
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <DeleteUserDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        user={user}
        onConfirm={handleDeleteUser}
      />
    </>
  );
}