/* ======================================================
   TYPES
====================================================== */

export type ConsultationStatus = "PENDING" | "ONGOING" | "COMPLETED";

export interface Consultation {
  id: string;

  userId: string;
  doctorId: string;

  clientName: string;
  clientEmail?: string;
  clientPhone?: string;

  scheduledAt: string;
  date: string;

  status: ConsultationStatus;
  consultationType?: string;
  symptoms?: string;
  notes?: string;
  doctorNotes?: string;

  duration?: number;
  chatRoomId?: string;

  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  text: string;
  from: "doctor" | "client";
  timestamp: string;
  status?: "sending" | "sent" | "failed" | "read";
  read?: boolean;
  readAt?: string;
}

import { apiFetch } from "@/client/http";

export const getConsultations = async (): Promise<Consultation[]> => {
  const json = await apiFetch(
    "http://localhost:3000/consultation/doctor"
  );

  console.log("RAW CONSULTATION RESPONSE:", json);

  const list = Array.isArray(json)
    ? json
    : json.data ?? json.consultations ?? [];

  return list.map((item: any): Consultation => ({
    id: item.id,
    userId: item.userId,
    doctorId: item.doctorId,

    clientName: item.user?.fullName ?? "-",
    clientEmail: item.user?.email,
    clientPhone: item.user?.phone,

    scheduledAt: item.scheduledAt,
    date: item.scheduledAt.split("T")[0],

    status: item.status,
    consultationType: item.type,
    symptoms: item.symptoms ?? undefined,
    notes: item.notes ?? undefined,
    doctorNotes: item.doctorNotes ?? undefined,

    duration: item.duration,
    chatRoomId: item.chatRoom?.id,

    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }));
};



/* ======================================================
   UPDATE STATUS
====================================================== */

/**
 * PATCH /consultation/:id/status
 */
export const updateConsultationStatus = async (
  consultationId: string,
  status: ConsultationStatus
): Promise<void> => {
  const res = await fetch(
    `${API_BASE_URL}/consultation/${consultationId}/status`,
    {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    }
  );

  if (!res.ok) {
    throw new Error("Failed to update consultation status");
  }
};


export const getMessages = async (
  consultationId: string
): Promise<Message[]> => {
  const res = await fetch(
    `${API_BASE_URL}/consultation/${consultationId}/messages`,
    {
      credentials: "include",
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch messages");
  }

  return res.json();
};

// Tambahkan ini ke file doctorConsultation.ts
const API_BASE_URL = "http://localhost:3000";

export const getChatMessages = async (chatRoomId: string): Promise<Message[]> => {
  const res = await fetch(
    `${API_BASE_URL}/chat/${chatRoomId}/messages`,
    {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch messages");
  }

  const data = await res.json();
  console.log("MESSAGES RESPONSE:", data); // DEBUG
  return Array.isArray(data) ? data : data.messages || [];
};

// Pastikan hanya ada SATU getPatientSummary
export const getPatientSummary = async (consultationId: string) => {
  console.log("Fetching patient summary for:", consultationId); // DEBUG
  
  const res = await fetch(
    `${API_BASE_URL}/consultation/${consultationId}/patient`,
    {
      credentials: "include",
    }
  );

  console.log("Patient summary response status:", res.status); // DEBUG

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Error response:", errorText);
    throw new Error(`Failed to fetch patient summary: ${res.status} ${errorText}`);
  }

  const data = await res.json();
  console.log("Patient summary data:", data); // DEBUG
  return data;
};
