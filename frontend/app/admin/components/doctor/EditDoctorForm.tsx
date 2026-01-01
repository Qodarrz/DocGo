'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { updateDoctor, Doctor } from '@/client/admindoctor';
import { Upload, Save, X } from 'lucide-react';
import Image from 'next/image';

interface EditDoctorFormProps {
  doctor: Doctor;
}

export default function EditDoctorForm({ doctor }: EditDoctorFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: doctor.user.fullName || '',
    email: doctor.user.email || '',
    phone: doctor.user.phone || '',
    dateOfBirth: doctor.user.dateOfBirth ? new Date(doctor.user.dateOfBirth).toISOString().split('T')[0] : '',
    gender: doctor.user.gender || 'MALE' as 'MALE' | 'FEMALE' | 'OTHER',
    specialization: doctor.specialization || '',
    licenseNumber: doctor.licenseNumber || '',
    experienceYear: doctor.experienceYear?.toString() || '',
    bio: doctor.bio || '',
    isActive: doctor.isActive,
  });
  const [password, setPassword] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(doctor.image || doctor.user.userProfile || '');

  const specializations = [
    'Umum',
    'Spesialis Jantung',
    'Spesialis Saraf',
    'Spesialis Kulit',
    'Spesialis Mata',
    'Spesialis THT',
    'Spesialis Gigi',
    'Psikolog',
    'Spesialis Bedah',
    'Spesialis Anak',
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(doctor.image || doctor.user.userProfile || '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      // Add only changed fields
      if (formData.fullName !== doctor.user.fullName) formDataToSend.append('fullName', formData.fullName);
      if (formData.email !== doctor.user.email) formDataToSend.append('email', formData.email);
      if (formData.phone !== doctor.user.phone) formDataToSend.append('phone', formData.phone);
      if (formData.dateOfBirth !== (doctor.user.dateOfBirth ? new Date(doctor.user.dateOfBirth).toISOString().split('T')[0] : '')) {
        formDataToSend.append('dateOfBirth', formData.dateOfBirth);
      }
      if (formData.gender !== doctor.user.gender) formDataToSend.append('gender', formData.gender);
      if (formData.specialization !== doctor.specialization) formDataToSend.append('specialization', formData.specialization);
      if (formData.licenseNumber !== doctor.licenseNumber) formDataToSend.append('licenseNumber', formData.licenseNumber);
      if (formData.experienceYear !== doctor.experienceYear?.toString()) formDataToSend.append('experienceYear', formData.experienceYear);
      if (formData.bio !== doctor.bio) formDataToSend.append('bio', formData.bio);
      if (formData.isActive !== doctor.isActive) formDataToSend.append('isActive', formData.isActive.toString());
      
      if (password) formDataToSend.append('password', password);
      if (image) formDataToSend.append('image', image);

      await updateDoctor(doctor.id, formDataToSend);
      toast.success('Data dokter berhasil diperbarui');
      router.push(`/admin/doctor/${doctor.id}`);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'Gagal memperbarui data dokter');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Data Dokter</CardTitle>
        <CardDescription>Perbarui informasi dokter</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Image */}
          <div className="space-y-4">
            <Label>Foto Profil</Label>
            <div className="flex items-center gap-6">
              <div className="relative h-32 w-32 rounded-lg overflow-hidden bg-muted">
                {imagePreview ? (
                  <Image
                    src={imagePreview}
                    alt="Profile preview"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <User className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="cursor-pointer"
                  />
                  {image && (
                    <Button type="button" variant="outline" size="sm" onClick={removeImage}>
                      <X className="h-4 w-4 mr-1" />
                      Hapus
                    </Button>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Ukuran maksimal 5MB. Format: JPG, PNG, GIF
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informasi Pribadi</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nama Lengkap *</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  placeholder="Dr. John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="dokter@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Nomor Telepon</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="081234567890"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Tanggal Lahir</Label>
                <Input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Jenis Kelamin</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value: 'MALE' | 'FEMALE' | 'OTHER') =>
                    handleSelectChange('gender', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Laki-laki</SelectItem>
                    <SelectItem value="FEMALE">Perempuan</SelectItem>
                    <SelectItem value="OTHER">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password Baru</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Kosongkan jika tidak ingin mengubah"
                />
                <p className="text-sm text-muted-foreground">
                  Hanya diisi jika ingin mengubah password
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Professional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informasi Profesional</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="specialization">Spesialisasi *</Label>
                <Select
                  value={formData.specialization}
                  onValueChange={(value) => handleSelectChange('specialization', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih spesialisasi" />
                  </SelectTrigger>
                  <SelectContent>
                    {specializations.map((spec) => (
                      <SelectItem key={spec} value={spec}>
                        {spec}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="licenseNumber">Nomor Lisensi</Label>
                <Input
                  id="licenseNumber"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  placeholder="IDI-123456"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="experienceYear">Pengalaman (tahun)</Label>
                <Input
                  id="experienceYear"
                  name="experienceYear"
                  type="number"
                  min="0"
                  value={formData.experienceYear}
                  onChange={handleChange}
                  placeholder="5"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="isActive">Status Aktif</Label>
                <div className="flex items-center gap-3 pt-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, isActive: checked }))
                    }
                  />
                  <span>{formData.isActive ? 'Aktif' : 'Tidak Aktif'}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Dokter dapat menerima konsultasi jika aktif
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio / Deskripsi</Label>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Deskripsi singkat tentang dokter..."
                rows={4}
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/admin/doctor/${doctor.id}`)}
              disabled={loading}
            >
              <X className="h-4 w-4 mr-2" />
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Simpan Perubahan
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// Tambahkan icon User jika belum diimpor
import { User } from 'lucide-react';