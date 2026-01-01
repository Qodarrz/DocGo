"use client";

import { useEffect, useRef, useState } from "react";
import ConsultationList from "./ConsultationList";
import ChatBox from "./ChatBox";
import {
  Consultation,
  getConsultations,
  getPatientSummary,
  updateConsultationStatus,
} from "@/client/doctorConsultation";
import { useSocket } from "@/client/useSocket";

export default function DoctorConsultationPage() {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [loading, setLoading] = useState(true);
  const [socketConnected, setSocketConnected] = useState(false);
  const [patientSummary, setPatientSummary] = useState<any | null>(null);
  const [showPatientSummary, setShowPatientSummary] = useState(false);
  const [loadingPatient, setLoadingPatient] = useState(false);

  const socket = useSocket();
  const currentRoomId = useRef<string | null>(null);

  // Load consultations
  const loadConsultations = async () => {
    try {
      setLoading(true);
      const data = await getConsultations();
      console.log("Consultations loaded:", data);
      setConsultations(data);
      
      // Auto-select first ONGOING consultation if none selected
      if (!selectedConsultation && data.length > 0) {
        const ongoing = data.find(c => c.status === "ONGOING");
        if (ongoing) {
          setSelectedConsultation(ongoing);
        } else if (data[0]) {
          setSelectedConsultation(data[0]);
        }
      }
    } catch (err) {
      console.error("Failed load consultations", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConsultations();
  }, []);

  // Handle status change
  const handleStatusChange = async (
    consultationId: string,
    newStatus: Consultation["status"]
  ) => {
    try {
      console.log(`Changing status for ${consultationId} to ${newStatus}`);
      
      await updateConsultationStatus(consultationId, newStatus);

      // Update list
      setConsultations((prev) =>
        prev.map((c) =>
          c.id === consultationId ? { ...c, status: newStatus } : c
        )
      );

      // Update selected consultation
      if (selectedConsultation && selectedConsultation.id === consultationId) {
        const updated = { ...selectedConsultation, status: newStatus };
        setSelectedConsultation(updated);
        
        // If status changed to COMPLETED, select another consultation
        if (newStatus === "COMPLETED") {
          const nextConsultation = consultations.find(
            c => c.id !== consultationId && (c.status === "ONGOING" || c.status === "PENDING")
          );
          if (nextConsultation) {
            setSelectedConsultation(nextConsultation);
          }
        }
      }

      // Emit socket event if connected
      if (socket && socketConnected) {
        socket.emit("consultationStatusChanged", {
          consultationId,
          status: newStatus
        });
      }
    } catch (err) {
      console.error("Failed update status", err);
      alert(`Failed to update status: ${err}`);
    }
  };

  /* ===============================
     SOCKET EVENTS - PERBAIKAN
  ================================ */
  useEffect(() => {
    if (!socket) {
      console.log("Socket not initialized");
      return;
    }

    console.log("Setting up socket events");

    // Connection events
    socket.on("connect", () => {
      console.log("Socket connected");
      setSocketConnected(true);
    });
    
    socket.on("disconnect", () => {
      console.log("Socket disconnected");
      setSocketConnected(false);
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      setSocketConnected(false);
    });

    // Consultation events
    socket.on("consultationUpdated", (updated: Consultation) => {
      console.log("Consultation updated via socket:", updated);
      setConsultations((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c))
      );

      if (selectedConsultation && selectedConsultation.id === updated.id) {
        setSelectedConsultation(updated);
      }
    });

    // Message events
    socket.on("messageSent", (data: any) => {
      console.log("Message sent confirmation:", data);
    });

    socket.on("messageError", (error: any) => {
      console.error("Message error:", error);
      alert(`Message failed: ${error.message}`);
    });

    // Cleanup
    return () => {
      console.log("Cleaning up socket events");
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
      socket.off("consultationUpdated");
      socket.off("messageSent");
      socket.off("messageError");
    };
  }, [socket, selectedConsultation]);

  /* ===============================
     JOIN / LEAVE CHAT ROOM - PERBAIKAN
  ================================ */
  useEffect(() => {
    if (!socket || !socketConnected) {
      console.log("Socket not connected, skipping room join");
      return;
    }

    if (!selectedConsultation?.chatRoomId) {
      console.log("No chat room ID for selected consultation");
      return;
    }

    console.log(`Joining room: ${selectedConsultation.chatRoomId}`);

    // Leave previous room
    if (currentRoomId.current) {
      socket.emit("leaveRoom", {
        chatRoomId: currentRoomId.current,
        userId: "doctor",
      });
      console.log(`Left room: ${currentRoomId.current}`);
    }

    // Join new room
    socket.emit("joinRoom", {
      chatRoomId: selectedConsultation.chatRoomId,
      userId: "doctor",
      userType: "doctor"
    });

    currentRoomId.current = selectedConsultation.chatRoomId;
    console.log(`Joined room: ${selectedConsultation.chatRoomId}`);

    // Cleanup
    return () => {
      if (socket && socketConnected && selectedConsultation?.chatRoomId) {
        socket.emit("leaveRoom", {
          chatRoomId: selectedConsultation.chatRoomId,
          userId: "doctor"
        });
        console.log(`Left room on cleanup: ${selectedConsultation.chatRoomId}`);
      }
    };
  }, [socket, socketConnected, selectedConsultation?.chatRoomId]);

  /* ===============================
     PATIENT SUMMARY - PERBAIKAN
  ================================ */
  const openPatientSummary = async () => {
    if (!selectedConsultation) {
      alert("Please select a consultation first");
      return;
    }

    try {
      setLoadingPatient(true);
      console.log("Fetching patient summary for:", selectedConsultation.id);
      
      const data = await getPatientSummary(selectedConsultation.id);
      console.log("Patient summary data:", data);

      if (!data) {
        throw new Error("No patient data received");
      }

      setPatientSummary(data);
      setShowPatientSummary(true);
    } catch (err: any) {
      console.error("Failed load patient summary", err);
      alert(`Failed to load patient summary: ${err.message || "Unknown error"}`);
    } finally {
      setLoadingPatient(false);
    }
  };

  // Debug logging
  useEffect(() => {
    console.log("Selected consultation:", selectedConsultation);
    console.log("Socket connected:", socketConnected);
    console.log("Consultations count:", consultations.length);
  }, [selectedConsultation, socketConnected, consultations]);

  /* ===============================
     RENDER - PERBAIKAN
  ================================ */
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto grid grid-cols-3 gap-6">
        {/* LEFT SIDE - Consultation List */}
        <div className="col-span-1">
          <ConsultationList
            consultations={consultations}
            loading={loading}
            onSelect={(consultation) => {
              console.log("Selected consultation:", consultation);
              setSelectedConsultation(consultation);
              setShowPatientSummary(false); // Hide summary when selecting new consultation
            }}
            selectedId={selectedConsultation?.id ?? null}
            onStatusChange={handleStatusChange}
            onRefresh={loadConsultations}
            socketConnected={socketConnected}
          />
        </div>

        {/* RIGHT SIDE - Chat and Patient Summary */}
        <div className="col-span-2 space-y-6">
          {selectedConsultation ? (
            <>
              {/* Chat Box */}
              <div className="h-[500px]">
                <ChatBox
                  consultation={selectedConsultation}
                  socket={socket}
                  socketConnected={socketConnected}
                  onOpenPatientSummary={openPatientSummary}
                />
              </div>

              {/* Patient Summary Section */}
              {showPatientSummary && (
                <div className="mt-4 bg-white border rounded-lg p-4 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Patient Summary
                      {loadingPatient && " (Loading...)"}
                    </h3>
                    <button
                      onClick={() => setShowPatientSummary(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ✕
                    </button>
                  </div>

                  {loadingPatient ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                  ) : patientSummary ? (
                    <>
                      {/* Patient Info */}
                      <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                          {patientSummary.patient?.photo ? (
                            <img
                              src={patientSummary.patient.photo}
                              alt={patientSummary.patient.name}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-2xl font-semibold text-blue-600">
                              {patientSummary.patient?.name?.charAt(0) || "P"}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-lg">
                            {patientSummary.patient?.name || "No name"}
                          </p>
                          <p className="text-sm text-gray-500">
                            {patientSummary.patient?.gender || "Unknown gender"} • 
                            {patientSummary.patient?.dateOfBirth 
                              ? ` ${new Date().getFullYear() - new Date(patientSummary.patient.dateOfBirth).getFullYear()} years old`
                              : " Age unknown"
                            }
                          </p>
                        </div>
                      </div>

                      {/* Medical Profile */}
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-gray-50 p-3 rounded">
                          <p className="text-sm text-gray-500">Height</p>
                          <p className="font-medium">
                            {patientSummary.medicalProfile?.heightCm 
                              ? `${patientSummary.medicalProfile.heightCm} cm`
                              : "Not recorded"
                            }
                          </p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded">
                          <p className="text-sm text-gray-500">Weight</p>
                          <p className="font-medium">
                            {patientSummary.medicalProfile?.weightKg 
                              ? `${patientSummary.medicalProfile.weightKg} kg`
                              : "Not recorded"
                            }
                          </p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded">
                          <p className="text-sm text-gray-500">Blood Type</p>
                          <p className="font-medium">
                            {patientSummary.medicalProfile?.bloodType || "Not recorded"}
                          </p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded">
                          <p className="text-sm text-gray-500">BMI</p>
                          <p className="font-medium">
                            {patientSummary.medicalProfile?.heightCm && patientSummary.medicalProfile?.weightKg
                              ? (
                                (patientSummary.medicalProfile.weightKg / 
                                ((patientSummary.medicalProfile.heightCm / 100) ** 2)).toFixed(1)
                              )
                              : "Not calculated"
                            }
                          </p>
                        </div>
                      </div>

                      {/* Allergies */}
                      <div className="mb-6">
                        <h4 className="font-medium text-gray-700 mb-2">Allergies</h4>
                        {patientSummary.medicalProfile?.allergies?.length ? (
                          <div className="space-y-2">
                            {patientSummary.medicalProfile.allergies.map(
                              (allergy: any, index: number) => (
                                <div
                                  key={index}
                                  className="p-3 bg-red-50 border border-red-100 rounded"
                                >
                                  <div className="flex justify-between">
                                    <span className="font-medium text-red-700">
                                      {allergy.name}
                                    </span>
                                    <span className={`text-xs px-2 py-1 rounded ${
                                      allergy.severity === 'high' ? 'bg-red-500 text-white' :
                                      allergy.severity === 'medium' ? 'bg-orange-500 text-white' :
                                      'bg-yellow-500 text-white'
                                    }`}>
                                      {allergy.severity?.toUpperCase() || 'UNKNOWN'}
                                    </span>
                                  </div>
                                  <p className="text-sm text-red-600 mt-1">
                                    Reaction: {allergy.reaction || "Not specified"}
                                  </p>
                                </div>
                              )
                            )}
                          </div>
                        ) : (
                          <p className="text-gray-500 italic">No allergies recorded</p>
                        )}
                      </div>

                      {/* Active Diseases */}
                      {patientSummary.activeDiseases?.length > 0 && (
                        <div className="mb-6">
                          <h4 className="font-medium text-gray-700 mb-2">Active Conditions</h4>
                          <div className="flex flex-wrap gap-2">
                            {patientSummary.activeDiseases.map((disease: any, index: number) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                              >
                                {disease.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No patient summary available</p>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 bg-white rounded-xl shadow p-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-lg font-medium mb-2">Select a Consultation</p>
              <p className="text-sm">Choose a consultation from the list to start chatting</p>
              <button
                onClick={loadConsultations}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Refresh List
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}