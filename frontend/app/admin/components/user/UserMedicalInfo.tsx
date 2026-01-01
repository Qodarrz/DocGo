'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Activity,
  Heart,
  Droplets,
  Pill,
  Stethoscope,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  Thermometer,
  Weight,
  Moon,
  Clock,
  User,
  FileText,
  Eye,
  Edit,
  MoreHorizontal,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface UserMedicalInfoProps {
  user: any;
}

interface HealthMetric {
  id: string;
  type: string;
  value: number;
  unit: string;
  notes?: string;
  recordedAt: string;
}

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  instruction?: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
}

interface Disease {
  id: string;
  name: string;
  isChronic: boolean;
  description?: string;
}

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relation?: string;
  isPrimary: boolean;
}

export default function UserMedicalInfo({ user }: UserMedicalInfoProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'metrics' | 'medications' | 'diseases' | 'contacts'>('overview');

  // Helper functions
  const getHealthMetricIcon = (type: string) => {
    switch (type) {
      case 'BLOOD_PRESSURE':
        return <Activity size={16} className="text-red-500" />;
      case 'BLOOD_SUGAR':
        return <Droplets size={16} className="text-blue-500" />;
      case 'HEART_RATE':
        return <Heart size={16} className="text-pink-500" />;
      case 'WEIGHT':
        return <Weight size={16} className="text-amber-500" />;
      case 'SLEEP':
        return <Moon size={16} className="text-indigo-500" />;
      default:
        return <Thermometer size={16} className="text-gray-500" />;
    }
  };

  const getHealthMetricLabel = (type: string) => {
    switch (type) {
      case 'BLOOD_PRESSURE': return 'Tekanan Darah';
      case 'BLOOD_SUGAR': return 'Gula Darah';
      case 'HEART_RATE': return 'Denyut Jantung';
      case 'WEIGHT': return 'Berat Badan';
      case 'SLEEP': return 'Waktu Tidur';
      default: return type.replace('_', ' ');
    }
  };

  const getHealthMetricStatus = (type: string, value: number) => {
    // This is a simplified example - real implementation would have proper ranges
    switch (type) {
      case 'BLOOD_PRESSURE':
        if (value < 90) return { status: 'LOW', color: 'text-blue-600' };
        if (value > 140) return { status: 'HIGH', color: 'text-red-600' };
        return { status: 'NORMAL', color: 'text-green-600' };
      case 'BLOOD_SUGAR':
        if (value < 70) return { status: 'LOW', color: 'text-blue-600' };
        if (value > 180) return { status: 'HIGH', color: 'text-red-600' };
        return { status: 'NORMAL', color: 'text-green-600' };
      case 'HEART_RATE':
        if (value < 60) return { status: 'LOW', color: 'text-blue-600' };
        if (value > 100) return { status: 'HIGH', color: 'text-red-600' };
        return { status: 'NORMAL', color: 'text-green-600' };
      default:
        return { status: 'NORMAL', color: 'text-gray-600' };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const calculateBMI = () => {
    if (!user.medicalProfile?.heightCm || !user.medicalProfile?.weightKg) {
      return null;
    }
    
    const heightInMeters = user.medicalProfile.heightCm / 100;
    const bmi = user.medicalProfile.weightKg / (heightInMeters * heightInMeters);
    
    let category = '';
    let color = '';
    
    if (bmi < 18.5) {
      category = 'Underweight';
      color = 'text-blue-600';
    } else if (bmi < 25) {
      category = 'Normal';
      color = 'text-green-600';
    } else if (bmi < 30) {
      category = 'Overweight';
      color = 'text-amber-600';
    } else {
      category = 'Obese';
      color = 'text-red-600';
    }
    
    return { value: bmi.toFixed(1), category, color };
  };

  const bmiData = calculateBMI();

  // Medical profile exists check
  const hasMedicalProfile = user.medicalProfile && (
    user.medicalProfile.heightCm ||
    user.medicalProfile.weightKg ||
    user.medicalProfile.bloodType ||
    user.medicalProfile.allergies ||
    user.medicalProfile.medications
  );

  // Tabs
  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Eye size={16} /> },
    { id: 'metrics', label: 'Data Kesehatan', icon: <Activity size={16} /> },
    { id: 'medications', label: 'Pengobatan', icon: <Pill size={16} /> },
    { id: 'diseases', label: 'Riwayat Penyakit', icon: <Stethoscope size={16} /> },
    { id: 'contacts', label: 'Kontak Darurat', icon: <User size={16} /> },
  ];

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Profile Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg border">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <User size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Tinggi Badan</p>
                    <p className="text-xl font-bold">
                      {user.medicalProfile?.heightCm ? `${user.medicalProfile.heightCm} cm` : 'Tidak ada data'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Weight size={20} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Berat Badan</p>
                    <p className="text-xl font-bold">
                      {user.medicalProfile?.weightKg ? `${user.medicalProfile.weightKg} kg` : 'Tidak ada data'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Heart size={20} className="text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Golongan Darah</p>
                    <p className="text-xl font-bold">
                      {user.medicalProfile?.bloodType || 'Tidak diketahui'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* BMI Calculation */}
            {bmiData && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-100">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp size={20} />
                  Indeks Massa Tubuh (BMI)
                </h4>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold">{bmiData.value}</div>
                    <div className={`font-medium ${bmiData.color}`}>{bmiData.category}</div>
                    <p className="text-sm text-gray-500 mt-2">
                      Berdasarkan tinggi {user.medicalProfile.heightCm}cm dan berat {user.medicalProfile.weightKg}kg
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${
                          bmiData.category === 'Underweight' ? 'bg-blue-500' :
                          bmiData.category === 'Normal' ? 'bg-green-500' :
                          bmiData.category === 'Overweight' ? 'bg-amber-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(100, (parseFloat(bmiData.value) / 40) * 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>15</span>
                      <span>18.5</span>
                      <span>25</span>
                      <span>30</span>
                      <span>40+</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Allergies */}
            {user.medicalProfile?.allergies && (
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <AlertTriangle size={20} className="text-amber-600" />
                  Alergi
                </h4>
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                  {typeof user.medicalProfile.allergies === 'string' ? (
                    <p>{user.medicalProfile.allergies}</p>
                  ) : Array.isArray(user.medicalProfile.allergies) ? (
                    <div className="flex flex-wrap gap-2">
                      {user.medicalProfile.allergies.map((allergy: string, index: number) => (
                        <Badge key={index} className="bg-amber-100 text-amber-800 border-amber-200">
                          {allergy}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-amber-700">Data alergi tersedia</p>
                  )}
                </div>
              </div>
            )}

            {/* Recent Health Metrics */}
            {user.recentHealthMetrics && user.recentHealthMetrics.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold">Data Kesehatan Terbaru</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {user.recentHealthMetrics.slice(0, 4).map((metric: HealthMetric) => {
                    const status = getHealthMetricStatus(metric.type, metric.value);
                    return (
                      <div key={metric.id} className="bg-white p-3 rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getHealthMetricIcon(metric.type)}
                            <span className="font-medium">{getHealthMetricLabel(metric.type)}</span>
                          </div>
                          <Badge variant="outline" className={status.color}>
                            {status.status}
                          </Badge>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold">{metric.value}</span>
                          <span className="text-gray-500">{metric.unit}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {formatDate(metric.recordedAt)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );

      case 'metrics':
        return (
          <div className="space-y-4">
            {user.recentHealthMetrics && user.recentHealthMetrics.length > 0 ? (
              user.recentHealthMetrics.map((metric: HealthMetric) => {
                const status = getHealthMetricStatus(metric.type, metric.value);
                return (
                  <div key={metric.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-white border">
                          {getHealthMetricIcon(metric.type)}
                        </div>
                        <div>
                          <h4 className="font-medium">{getHealthMetricLabel(metric.type)}</h4>
                          <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-2xl font-bold">{metric.value}</span>
                            <span className="text-gray-500">{metric.unit}</span>
                            <Badge variant="outline" className={status.color}>
                              {status.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                            <span className="flex items-center gap-1">
                              <Calendar size={14} />
                              {formatDate(metric.recordedAt)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock size={14} />
                              {new Date(metric.recordedAt).toLocaleTimeString('id-ID', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          {metric.notes && (
                            <p className="text-sm text-gray-600 mt-2">{metric.notes}</p>
                          )}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye size={14} className="mr-2" />
                            Lihat Detail
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <FileText size={14} className="mr-2" />
                            Ekspor Data
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Activity size={48} className="mx-auto mb-4 text-gray-300" />
                <p>Tidak ada data kesehatan yang tercatat</p>
              </div>
            )}
          </div>
        );

      case 'medications':
        return (
          <div className="space-y-4">
            {user.activeMedications && user.activeMedications.length > 0 ? (
              user.activeMedications.map((med: Medication) => (
                <div key={med.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-purple-100">
                        <Pill size={20} className="text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{med.name}</h4>
                          {med.isActive ? (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle size={12} className="mr-1" />
                              Aktif
                            </Badge>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-800">
                              <XCircle size={12} className="mr-1" />
                              Tidak Aktif
                            </Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Dosis:</span>
                            <p className="font-medium">{med.dosage}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Frekuensi:</span>
                            <p className="font-medium">{med.frequency}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Mulai:</span>
                            <p className="font-medium">{formatDate(med.startDate)}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Selesai:</span>
                            <p className="font-medium">
                              {med.endDate ? formatDate(med.endDate) : 'Tidak ditentukan'}
                            </p>
                          </div>
                        </div>
                        
                        {med.instruction && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-800">{med.instruction}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Pill size={48} className="mx-auto mb-4 text-gray-300" />
                <p>Tidak ada pengobatan aktif</p>
              </div>
            )}
          </div>
        );

      case 'diseases':
        return (
          <div className="space-y-4">
            {user.diseases && user.diseases.length > 0 ? (
              user.diseases.map((diseaseItem: any) => {
                const disease = diseaseItem.disease;
                return (
                  <div key={disease.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-red-100">
                          <Stethoscope size={20} className="text-red-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{disease.name}</h4>
                            {disease.isChronic ? (
                              <Badge className="bg-amber-100 text-amber-800">
                                Kronis
                              </Badge>
                            ) : (
                              <Badge className="bg-blue-100 text-blue-800">
                                Akut
                              </Badge>
                            )}
                            <Badge variant="outline">
                              {diseaseItem.status}
                            </Badge>
                          </div>
                          
                          {disease.description && (
                            <p className="text-gray-600 mb-3">{disease.description}</p>
                          )}
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            {diseaseItem.diagnosedAt && (
                              <span className="flex items-center gap-1">
                                <Calendar size={14} />
                                Didiagnosis: {formatDate(diseaseItem.diagnosedAt)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Stethoscope size={48} className="mx-auto mb-4 text-gray-300" />
                <p>Tidak ada riwayat penyakit</p>
              </div>
            )}
          </div>
        );

      case 'contacts':
        return (
          <div className="space-y-4">
            {user.emergencyContacts && user.emergencyContacts.length > 0 ? (
              user.emergencyContacts.map((contact: EmergencyContact) => (
                <div key={contact.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        contact.isPrimary ? 'bg-red-100' : 'bg-gray-100'
                      }`}>
                        <User size={20} className={
                          contact.isPrimary ? 'text-red-600' : 'text-gray-600'
                        } />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{contact.name}</h4>
                          {contact.isPrimary && (
                            <Badge className="bg-red-100 text-red-800">
                              Utama
                            </Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Telepon:</span>
                            <p className="font-medium">{contact.phone}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Hubungan:</span>
                            <p className="font-medium">{contact.relation || 'Tidak diketahui'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      Hubungi
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <User size={48} className="mx-auto mb-4 text-gray-300" />
                <p>Tidak ada kontak darurat</p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope size={20} />
              Informasi Medis
            </CardTitle>
            <CardDescription>
              Profil kesehatan dan informasi medis pengguna
            </CardDescription>
          </div>
          
          {!hasMedicalProfile && (
            <Badge variant="outline" className="text-amber-600 border-amber-200">
              <AlertTriangle size={12} className="mr-1" />
              Profil medis belum lengkap
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {/* Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 rounded-lg bg-gray-100 p-1">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab(tab.id as any)}
                className="flex-1 justify-center"
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {renderContent()}

        {/* Quick Stats */}
        {activeTab === 'overview' && (
          <>
            <Separator className="my-6" />
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-800">
                  {user.stats?.healthMetrics || 0}
                </div>
                <div className="text-sm text-gray-600">Data Kesehatan</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-800">
                  {user.stats?.medications || 0}
                </div>
                <div className="text-sm text-gray-600">Pengobatan</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-800">
                  {user.stats?.diseases || 0}
                </div>
                <div className="text-sm text-gray-600">Riwayat Penyakit</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-800">
                  {user.stats?.emergencyContacts || 0}
                </div>
                <div className="text-sm text-gray-600">Kontak Darurat</div>
              </div>
            </div>
          </>
        )}

        {/* Last Updated */}
        {user.medicalProfile?.updatedAt && (
          <div className="mt-6 pt-6 border-t">
            <p className="text-sm text-gray-500">
              <span className="font-medium">Terakhir diperbarui:</span>{' '}
              {formatDate(user.medicalProfile.updatedAt)}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}