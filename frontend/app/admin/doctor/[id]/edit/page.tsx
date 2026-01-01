"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { getDoctorById } from "@/client/admindoctor";
import EditDoctorForm from "@/app/admin/components/doctor/EditDoctorForm";
import { EditDoctorLoading } from "@/app/admin/components/doctor/EditDoctorLoading";
import { DetailHeader } from "@/app/admin/components/doctor/DetailHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User } from "lucide-react";

export default function EditDoctorPage() {
  const params = useParams();
  const router = useRouter();
  const [doctor, setDoctor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDoctor();
  }, [params.id]);

  const fetchDoctor = async () => {
    try {
      const response = await getDoctorById(params.id as string);
      setDoctor(response.data);
    } catch (error: any) {
      console.error("Error fetching doctor:", error);
      setError(error.message || "Gagal memuat data dokter");
      toast.error("Gagal memuat data dokter");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <DetailHeader
          title="Edit Data Dokter"
          description="Memuat data dokter..."
          backUrl={`/admin/doctor/${params.id}`}
        />
        <EditDoctorLoading />
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="container mx-auto py-6">
        <DetailHeader
          title="Edit Data Dokter"
          description=""
          backUrl="/admin/doctor"
        />
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">
                {error || "Dokter tidak ditemukan"}
              </h3>
              <p className="text-muted-foreground mb-6">
                Tidak dapat memuat data dokter untuk diedit
              </p>
              <div className="flex justify-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => router.push("/admin/doctor")}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Kembali ke Daftar
                </Button>
                <Button onClick={fetchDoctor}>Coba Lagi</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <DetailHeader
        title="Edit Data Dokter"
        description={`Perbarui informasi dokter ${doctor.user.fullName}`}
        backUrl={`/admin/doctor/${doctor.id}`}
      />
      <EditDoctorForm doctor={doctor} />
    </div>
  );
}
