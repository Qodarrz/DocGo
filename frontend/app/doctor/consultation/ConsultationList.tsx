"use client";

import { Consultation } from "@/client/doctorConsultation";
import { useState } from "react";

interface ConsultationListProps {
  consultations: Consultation[];
  loading: boolean;
  onSelect: (consultation: Consultation) => void;
  selectedId: string | null;
  onStatusChange: (
    consultationId: string,
    newStatus: Consultation["status"]
  ) => void;
  onRefresh: () => void;
  socketConnected: boolean;
}

export default function ConsultationList({
  consultations,
  loading,
  onSelect,
  selectedId,
  onStatusChange,
  onRefresh,
  socketConnected,
}: ConsultationListProps) {
  const [activeFilter, setActiveFilter] = useState<string>("ALL");

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const consultationDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );

    if (consultationDate.getTime() === today.getTime()) {
      return `Today, ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    } else if (consultationDate.getTime() === today.getTime() - 86400000) {
      return `Yesterday, ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  const getStatusColor = (status: Consultation["status"]) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "ONGOING":
        return "bg-green-100 text-green-800 border-green-200";
      case "COMPLETED":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: Consultation["status"]) => {
    switch (status) {
      case "PENDING":
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "ONGOING":
        return (
          <svg
            className="w-4 h-4 animate-pulse"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M5.05 3.636a1 1 0 010 1.414 7 7 0 000 9.9 1 1 0 11-1.414 1.414 9 9 0 010-12.728 1 1 0 011.414 0zm9.9 0a1 1 0 011.414 0 9 9 0 010 12.728 1 1 0 11-1.414-1.414 7 7 0 000-9.9 1 1 0 010-1.414zM7.879 6.464a1 1 0 010 1.414 3 3 0 000 4.243 1 1 0 11-1.415 1.414 5 5 0 010-7.07 1 1 0 011.415 0zm4.242 0a1 1 0 011.415 0 5 5 0 010 7.07 1 1 0 01-1.415-1.414 3 3 0 000-4.243 1 1 0 010-1.414zM10 9a1 1 0 011 1v.01a1 1 0 11-2 0V10a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "COMPLETED":
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  const filteredConsultations = consultations.filter((consultation) => {
    if (activeFilter === "ALL") return true;
    return consultation.status === activeFilter;
  });

  return (
    <div className="flex flex-col h-full">
      {/* Header tetap */}
      <div className="flex-shrink-0">
        <div className="bg-white rounded-xl shadow-lg mb-4">
          <div className="border-b p-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="font-bold text-xl text-gray-900">
                  Consultations
                </h2>
                {socketConnected && (
                  <div className="relative">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <div className="absolute inset-0 bg-green-500 rounded-full animate-ping"></div>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-600">
                {consultations.length} total consultations
                {!socketConnected && " (Offline)"}
              </p>
            </div>
            <button
              onClick={onRefresh}
              disabled={loading}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh list"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex border-b">
            {(["ALL", "PENDING", "ONGOING", "COMPLETED"] as const).map(
              (filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
                    activeFilter === filter
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  {filter === "ALL"
                    ? "All"
                    : filter.charAt(0) + filter.slice(1).toLowerCase()}
                  {filter !== "ALL" && (
                    <span className="absolute top-1 right-2 text-xs px-1 bg-gray-200 rounded">
                      {consultations.filter((c) => c.status === filter).length}
                    </span>
                  )}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area - DIUBAH: Fixed height dengan max 5 item */}
<div className="flex-1 flex flex-col min-h-0">
  <div className="bg-white rounded-xl shadow-lg flex-1 flex flex-col">
          {/* Container dengan tinggi tetap untuk max 5 item */}
    <div className="flex-1 overflow-y-auto p-4">
      <div className="space-y-3">
              {loading ? (
                   <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
              ) : filteredConsultations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 mx-auto text-gray-300 mb-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  <p className="mb-2">No consultations found</p>
                  <p className="text-sm">Try selecting a different filter</p>
                </div>
              ) : (
                filteredConsultations.map((consultation) => {
                  const isSelected = selectedId === consultation.id;
                  const isSelectable =
                    consultation.status === "ONGOING" ||
                    consultation.status === "PENDING";

                  return (
                    <div
                      key={consultation.id}
                      onClick={() => isSelectable && onSelect(consultation)}
                      className={`
                        p-4 rounded-lg border transition-all cursor-pointer group
                        ${
                          isSelected
                            ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }
                        ${!isSelectable ? "opacity-60 cursor-not-allowed" : ""}
                      `}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="font-semibold text-blue-600">
                                {consultation.clientName.charAt(0)}
                              </span>
                            </div>
                            {consultation.status === "ONGOING" && (
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {consultation.clientName}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {consultation.consultationType ||
                                "General Consultation"}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">
                            {formatTime(consultation.scheduledAt)}
                          </div>
                          {consultation.duration && (
                            <div className="text-xs text-gray-400 mt-1">
                              {consultation.duration} mins
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-between items-center mt-3">
                        <div className="flex items-center gap-2">
                          <div
                            className={`p-1 rounded ${getStatusColor(consultation.status).split(" ")[0]}`}
                          >
                            {getStatusIcon(consultation.status)}
                          </div>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(consultation.status)}`}
                          >
                            {consultation.status.charAt(0) +
                              consultation.status.slice(1).toLowerCase()}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {consultation.status === "PENDING" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onStatusChange(consultation.id, "ONGOING");
                              }}
                              className="px-3 py-1 text-xs font-medium bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                            >
                              Start
                            </button>
                          )}
                          {consultation.status === "ONGOING" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onStatusChange(consultation.id, "COMPLETED");
                              }}
                              className="px-3 py-1 text-xs font-medium bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                            >
                              End
                            </button>
                          )}
                          <span className="text-xs text-gray-500">
                            ID: {consultation.id.substring(0, 8)}...
                          </span>
                        </div>
                      </div>

                      {consultation.symptoms && (
                        <div className="mt-2 pt-2 border-t border-gray-100">
                          <p className="text-sm text-gray-600 line-clamp-2">
                            <span className="font-medium">Symptoms:</span>{" "}
                            {consultation.symptoms}
                          </p>
                        </div>
                      )}

                      {consultation.chatRoomId && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-blue-600">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Chat room ready
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

              <div className="flex-shrink-0 border-t p-3 bg-gray-50">
            <div className="flex justify-between text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>
                  Ongoing:{" "}
                  <strong className="text-green-600">
                    {consultations.filter((c) => c.status === "ONGOING").length}
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span>
                  Pending:{" "}
                  <strong className="text-yellow-600">
                    {consultations.filter((c) => c.status === "PENDING").length}
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                <span>
                  Completed:{" "}
                  <strong className="text-gray-600">
                    {
                      consultations.filter((c) => c.status === "COMPLETED")
                        .length
                    }
                  </strong>
                </span>
              </div>
            </div>
            {/* Show more indicator jika ada lebih dari 5 */}
            {filteredConsultations.length > 5 && (
              <div className="text-center text-xs text-gray-500 mt-2">
                Showing {filteredConsultations.length} consultations (scroll to
                see more)
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
