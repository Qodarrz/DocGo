/* =========================
   TYPES
========================= */

const API_BASE_URL = (() => {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined");
  }
  return url;
})();

export type Gender = "MALE" | "FEMALE" | "OTHER";

export interface PatientSummaryResponse {
  patient: Patient;
  medicalProfile: MedicalProfile | null;
  activeDiseases: Disease[];
  symptomCheck: SymptomCheck | null;
}

export interface Patient {
  id: string;
  name: string;
  gender: Gender;
  dateOfBirth: string | null;
  photo?: string | null;
}

export interface MedicalProfile {
  id: string;
  userId: string;
  heightCm?: number;
  weightKg?: number;
  bloodType?: string;
  allergies: Allergy[];
  medications: Medication[];
  createdAt: string;
  updatedAt: string;
}

export interface Allergy {
  name: string;
  reaction: string;
  severity: "low" | "medium" | "high";
}

export interface Medication {
  name: string;
  dose: string;
  frequency: string;
}

export interface Disease {
  id: string;
  name: string;
}

export interface SymptomCheck {
  id: string;
  complaint?: string;
  mainComplaint?: string;
  symptoms?: string[];
  durationDays?: number;
  severityHint?: string;
  notes?: string;
}

/* =========================
   FETCH FUNCTION
========================= */

export const getPatientSummary = async (
  consultationId: string
): Promise<PatientSummaryResponse> => {
  const res = await fetch(
    `${API_BASE_URL}/consultation/${consultationId}/patient`,
    {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch patient summary");
  }

  return res.json();
};
