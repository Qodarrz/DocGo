// app/admin/linked/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { adminAppApi, AppRelease } from "@/client/appRelease";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Search,
  MoreHorizontal,
  Plus,
  Edit,
  Trash2,
  Download,
  CheckCircle,
  XCircle,
  Filter,
  RefreshCw,
  Smartphone,
  Package,
  ExternalLink,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

export default function AdminAppReleasePage() {
  const [releases, setReleases] = useState<AppRelease[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingRelease, setEditingRelease] = useState<AppRelease | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const [search, setSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const [formData, setFormData] = useState({
    appName: "",
    platform: "ANDROID" as "ANDROID" | "IOS",
    versionName: "",
    versionCode: 1,
    downloadUrl: "",
    releaseNotes: "",
    isForceUpdate: false,
    isActive: true,
  });

  const fetchReleases = async () => {
    try {
      setLoading(true);
      console.log("Fetching releases...");
      const data = await adminAppApi.listReleases();
      console.log("Received releases:", data);
      setReleases(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching releases:", err);
      setError("Gagal memuat daftar release.");
      setReleases([]);
      toast.error("Gagal memuat daftar release");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReleases();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus release ini?")) return;
    
    try {
      await adminAppApi.deleteRelease(id);
      toast.success("Release berhasil dihapus");
      fetchReleases();
    } catch (err: any) {
      console.error("Error deleting release:", err);
      toast.error(err.message || "Gagal menghapus release");
    }
  };

  const handleEdit = (release: AppRelease) => {
    setEditingRelease(release);
    setFormData({
      appName: release.appName,
      platform: release.platform,
      versionName: release.versionName,
      versionCode: release.versionCode,
      downloadUrl: release.downloadUrl,
      releaseNotes: release.releaseNotes || "",
      isForceUpdate: release.isForceUpdate,
      isActive: release.isActive,
    });
    setShowForm(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi input
    if (!formData.appName.trim()) {
      toast.error("Nama App harus diisi");
      return;
    }
    
    if (!formData.versionName.trim()) {
      toast.error("Version Name harus diisi");
      return;
    }
    
    if (!formData.downloadUrl.trim()) {
      toast.error("Download URL harus diisi");
      return;
    }
    
    // Validasi URL
    try {
      new URL(formData.downloadUrl);
    } catch {
      toast.error("Download URL tidak valid");
      return;
    }
    
    // Cek duplikasi version code untuk platform yang sama
    if (!editingRelease) {
      const isDuplicate = releases.some(release => 
        release.platform === formData.platform && 
        release.versionCode === formData.versionCode
      );
      
      if (isDuplicate) {
        toast.error(`Version code ${formData.versionCode} sudah ada untuk platform ${formData.platform === 'ANDROID' ? 'Android' : 'iOS'}`);
        return;
      }
    } else {
      // Untuk edit, cek apakah ada release lain dengan version code yang sama
      const isDuplicate = releases.some(release => 
        release.id !== editingRelease.id &&
        release.platform === formData.platform && 
        release.versionCode === formData.versionCode
      );
      
      if (isDuplicate) {
        toast.error(`Version code ${formData.versionCode} sudah ada untuk platform ${formData.platform === 'ANDROID' ? 'Android' : 'iOS'}`);
        return;
      }
    }
    
    setFormSubmitting(true);
    
    try {
      console.log("Submitting form data:", formData);
      
      if (editingRelease) {
        console.log("Updating release:", editingRelease.id);
        const response = await adminAppApi.updateRelease(editingRelease.id, formData);
        console.log("Update response:", response);
        toast.success("Release berhasil diperbarui");
      } else {
        console.log("Creating new release");
        const response = await adminAppApi.createRelease(formData);
        console.log("Create response:", response);
        toast.success("Release baru berhasil dibuat");
      }
      
      setShowForm(false);
      setEditingRelease(null);
      setFormData({
        appName: "",
        platform: "ANDROID",
        versionName: "",
        versionCode: 1,
        downloadUrl: "",
        releaseNotes: "",
        isForceUpdate: false,
        isActive: true,
      });
      
      fetchReleases();
    } catch (err: any) {
      console.error("Error saving release:", err);
      
      // Tangani error 409 secara spesifik
      if (err.response?.status === 409 || err.message?.includes('409')) {
        toast.error("Version code sudah ada untuk platform ini. Silakan gunakan version code yang berbeda.");
      } else if (err.message) {
        toast.error(err.message);
      } else {
        toast.error("Gagal menyimpan release. Silakan coba lagi.");
      }
    } finally {
      setFormSubmitting(false);
    }
  };

  const filteredReleases = releases.filter(release => {
    // Filter search
    const searchLower = search.toLowerCase();
    const matchesSearch = 
      !search || 
      (release.appName && release.appName.toLowerCase().includes(searchLower)) ||
      (release.versionName && release.versionName.toLowerCase().includes(searchLower)) ||
      (release.releaseNotes && release.releaseNotes.toLowerCase().includes(searchLower));
    
    // Filter platform
    const matchesPlatform = 
      platformFilter === 'ALL' || 
      release.platform === platformFilter;
    
    // Filter status
    const matchesStatus = 
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && release.isActive) ||
      (statusFilter === 'INACTIVE' && !release.isActive);
    
    return matchesSearch && matchesPlatform && matchesStatus;
  });

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'ANDROID':
        return <span className="text-green-600">🤖</span>;
      case 'IOS':
        return <span className="text-gray-600">🍎</span>;
      default:
        return <Smartphone size={14} />;
    }
  };

  const getPlatformName = (platform: string) => {
    return platform === 'ANDROID' ? 'Android' : 'iOS';
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
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
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">App Releases Management</h1>
        </div>

        {/* Header dengan filter */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <Input
                    placeholder="Cari release (nama app, version, notes)..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Select value={platformFilter} onValueChange={setPlatformFilter}>
                  <SelectTrigger className="w-[140px]">
                    <Filter size={16} className="mr-2" />
                    <SelectValue placeholder="Platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Semua Platform</SelectItem>
                    <SelectItem value="ANDROID">Android</SelectItem>
                    <SelectItem value="IOS">iOS</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <Filter size={16} className="mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Semua Status</SelectItem>
                    <SelectItem value="ACTIVE">Aktif</SelectItem>
                    <SelectItem value="INACTIVE">Nonaktif</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" onClick={fetchReleases}>
                  <RefreshCw size={16} className="mr-2" />
                  Refresh
                </Button>

                <Button onClick={() => setShowForm(true)}>
                  <Plus size={16} className="mr-2" />
                  Tambah Release
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabel Releases */}
        <Card>
          <CardContent className="pt-6">
            {error ? (
              <div className="text-center py-8 text-red-500">
                <AlertTriangle className="mx-auto mb-2" size={24} />
                <p className="mb-2">{error}</p>
                <Button variant="outline" onClick={fetchReleases}>
                  Coba Lagi
                </Button>
              </div>
            ) : filteredReleases.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {releases.length === 0 ? "Belum ada data release" : "Tidak ada data yang cocok dengan filter"}
                {releases.length === 0 && (
                  <Button 
                    className="mt-4" 
                    onClick={() => setShowForm(true)}
                  >
                    <Plus size={16} className="mr-2" />
                    Buat Release Pertama
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>App Name</TableHead>
                        <TableHead>Platform</TableHead>
                        <TableHead>Version</TableHead>
                        <TableHead>Version Code</TableHead>
                        <TableHead>Release Notes</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredReleases.map((release) => (
                        <TableRow key={release.id}>
                          <TableCell>
                            <div className="font-medium">{release.appName}</div>
                            <div className="text-sm text-gray-500">
                              {release.isForceUpdate && (
                                <Badge variant="destructive" className="text-xs mr-1">
                                  Force Update
                                </Badge>
                              )}
                              {formatDate(release.createdAt)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getPlatformIcon(release.platform)}
                              <span>{getPlatformName(release.platform)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{release.versionName}</div>
                            <Badge variant="outline" className="text-xs">
                              <Package size={10} className="mr-1" />
                              {release.versionCode}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="text-xs">
                              v{release.versionCode}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-[200px] truncate" title={release.releaseNotes || ""}>
                              {release.releaseNotes || "-"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {release.isActive ? (
                                <Badge className="bg-green-100 text-green-800">
                                  <CheckCircle size={12} className="mr-1" />
                                  Aktif
                                </Badge>
                              ) : (
                                <Badge className="bg-gray-100 text-gray-800">
                                  <XCircle size={12} className="mr-1" />
                                  Nonaktif
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
                                <DropdownMenuItem onClick={() => window.open(release.downloadUrl, "_blank")}>
                                  <Download size={14} className="mr-2" />
                                  Download
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEdit(release)}>
                                  <Edit size={14} className="mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => {
                                    navigator.clipboard.writeText(release.downloadUrl);
                                    toast.success("Link berhasil disalin");
                                  }}
                                >
                                  <ExternalLink size={14} className="mr-2" />
                                  Salin Link
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => handleDelete(release.id)}
                                >
                                  <Trash2 size={14} className="mr-2" />
                                  Hapus
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                {/* Info jumlah data */}
                <div className="mt-4 text-sm text-gray-500">
                  Menampilkan {filteredReleases.length} dari {releases.length} release
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={(open) => {
        setShowForm(open);
        if (!open) {
          setEditingRelease(null);
          setFormData({
            appName: "",
            platform: "ANDROID",
            versionName: "",
            versionCode: 1,
            downloadUrl: "",
            releaseNotes: "",
            isForceUpdate: false,
            isActive: true,
          });
        }
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingRelease ? "Edit App Release" : "Tambah App Release Baru"}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="appName">
                  Nama App <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="appName"
                  value={formData.appName}
                  onChange={(e) => setFormData({ ...formData, appName: e.target.value })}
                  placeholder="Contoh: HealthApp"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="platform">
                  Platform <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.platform}
                  onValueChange={(value) => setFormData({ ...formData, platform: value as "ANDROID" | "IOS" })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ANDROID">Android</SelectItem>
                    <SelectItem value="IOS">iOS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="versionName">
                  Version Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="versionName"
                  value={formData.versionName}
                  onChange={(e) => setFormData({ ...formData, versionName: e.target.value })}
                  placeholder="Contoh: 1.2.0"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="versionCode">
                  Version Code <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="versionCode"
                  type="number"
                  min="1"
                  value={formData.versionCode}
                  onChange={(e) => setFormData({ ...formData, versionCode: parseInt(e.target.value) || 1 })}
                  placeholder="Contoh: 5"
                  required
                />
                <p className="text-xs text-gray-500">
                  Harus unik untuk setiap platform
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="downloadUrl">
                Download URL <span className="text-red-500">*</span>
              </Label>
              <Input
                id="downloadUrl"
                type="url"
                value={formData.downloadUrl}
                onChange={(e) => setFormData({ ...formData, downloadUrl: e.target.value })}
                placeholder="https://example.com/app.apk"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="releaseNotes">Release Notes</Label>
              <Textarea
                id="releaseNotes"
                value={formData.releaseNotes}
                onChange={(e) => setFormData({ ...formData, releaseNotes: e.target.value })}
                placeholder="Fitur baru, perbaikan bug, dll."
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  id="isForceUpdate"
                  checked={formData.isForceUpdate}
                  onCheckedChange={(checked) => setFormData({ ...formData, isForceUpdate: checked })}
                />
                <Label htmlFor="isForceUpdate" className="cursor-pointer">
                  Force Update
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="isActive" className="cursor-pointer">
                  Aktif
                </Label>
              </div>
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowForm(false)}
                disabled={formSubmitting}
              >
                Batal
              </Button>
              <Button type="submit" disabled={formSubmitting}>
                {formSubmitting ? "Menyimpan..." : (editingRelease ? "Update Release" : "Buat Release")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}