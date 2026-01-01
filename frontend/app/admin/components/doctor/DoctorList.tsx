import { useState, useEffect, SetStateAction } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  User,
  Filter,
  ArrowUpDown,
  RefreshCw,
} from "lucide-react";
import { getDoctors, deleteDoctor, Doctor } from "@/client/admindoctor";
import { toast } from "sonner";
import CreateDoctorDialog from "./CreateDoctorDialog";

interface DoctorListProps {
  initialDoctors?: Doctor[];
}

export default function DoctorList({ initialDoctors }: DoctorListProps) {
  const router = useRouter();
  const [doctors, setDoctors] = useState<Doctor[]>(initialDoctors || []);
  const [loading, setLoading] = useState(!initialDoctors);
  const [search, setSearch] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [isActive, setIsActive] = useState<string>("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const specializations = [
    "Umum",
    "Spesialis Jantung",
    "Spesialis Saraf",
    "Spesialis Kulit",
    "Spesialis Mata",
    "Spesialis THT",
    "Spesialis Gigi",
    "Psikolog",
    "Spesialis Bedah",
    "Spesialis Anak",
  ];

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const response = await getDoctors(
        page,
        10,
        search,
        specialization === "all" ? undefined : specialization,
        isActive === "all" ? undefined : isActive === "active",
        sortBy,
        sortOrder
      );
      setDoctors(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      toast.error("Gagal mengambil data dokter");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialDoctors) {
      fetchDoctors();
    }
  }, [page, search, specialization, isActive, sortBy, sortOrder]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus dokter ${name}?`)) {
      return;
    }

    try {
      await deleteDoctor(id);
      toast.success("Dokter berhasil dihapus");
      fetchDoctors();
    } catch (error) {
      toast.error("Gagal menghapus dokter");
      console.error(error);
    }
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading && doctors.length === 0) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Manajemen Dokter</CardTitle>
              <CardDescription>
                Kelola data dokter yang terdaftar di sistem
              </CardDescription>
            </div>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Dokter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama atau email..."
                value={search}
                onChange={(e: { target: { value: SetStateAction<string> } }) =>
                  setSearch(e.target.value)
                }
                className="pl-9"
              />
            </div>
            <Select value={specialization} onValueChange={setSpecialization}>
              <SelectTrigger>
                <SelectValue placeholder="Spesialisasi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Spesialisasi</SelectItem>
                {specializations.map((spec) => (
                  <SelectItem key={spec} value={spec}>
                    {spec}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={isActive} onValueChange={setIsActive}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="inactive">Tidak Aktif</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={fetchDoctors}
                className="flex-1"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSearch("");
                  setSpecialization("");
                  setIsActive("all");
                }}
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("fullName")}
                      className="p-0 hover:bg-transparent"
                    >
                      Nama Dokter
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Spesialisasi</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("createdAt")}
                      className="p-0 hover:bg-transparent"
                    >
                      Bergabung
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Konsultasi</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {doctors.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-8 text-muted-foreground"
                    >
                      <User className="h-12 w-12 mx-auto mb-4 opacity-20" />
                      <p>Tidak ada data dokter</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  doctors.map((doctor, index) => (
                    <TableRow key={doctor.id} className="hover:bg-muted/50">
                      <TableCell>{(page - 1) * 10 + index + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full overflow-hidden bg-muted">
                            <img
                              src={
                                doctor.image ||
                                doctor.user.userProfile ||
                                "/default-avatar.png"
                              }
                              alt={doctor.user.fullName || ""}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-medium">
                              {doctor.user.fullName || "-"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {doctor.licenseNumber || "No License"}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {doctor.specialization}
                        </Badge>
                      </TableCell>
                      <TableCell>{doctor.user.email}</TableCell>
                      <TableCell>{formatDate(doctor.createdAt)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={doctor.isActive ? "default" : "secondary"}
                        >
                          {doctor.isActive ? "Aktif" : "Tidak Aktif"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {doctor._count?.consultations || 0}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() =>
                                router.push(`/admin/doctor/${doctor.id}`)
                              }
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Lihat Detail
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                router.push(`/admin/doctor/${doctor.id}/edit`)
                              }
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() =>
                                handleDelete(
                                  doctor.id,
                                  doctor.user.fullName || ""
                                )
                              }
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
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
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                Menampilkan {(page - 1) * 10 + 1} -{" "}
                {Math.min(page * 10, doctors.length + (page - 1) * 10)} dari{" "}
                {totalPages * 10}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={page === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <CreateDoctorDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={() => {
          fetchDoctors();
          setCreateDialogOpen(false);
        }}
      />
    </>
  );
}
