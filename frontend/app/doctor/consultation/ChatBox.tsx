"use client";

import { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";

/* ======================================================
    TYPES (LOCAL – NO DEPENDENCY)
  ====================================================== */

export type ConsultationStatus = "PENDING" | "ONGOING" | "COMPLETED";

export interface Consultation {
  id: string;
  userId: string;
  doctorId: string;

  clientName: string;

  status: ConsultationStatus;
  consultationType?: string;

  chatRoomId?: string | null;

  scheduledAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  text: string;
  from: "doctor" | "user";
  timestamp: string | Date;
  status?: "sending" | "sent" | "failed" | "read";
  read?: boolean;
}

/* ======================================================
    PROPS
  ====================================================== */

interface ChatBoxProps {
  consultation: Consultation;
  socket: Socket | null;
  socketConnected: boolean;
  onOpenPatientSummary?: () => void;
}

const API_BASE_URL = (() => {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined");
  }
  return url;
})();

export default function ChatBox({
  consultation,
  socket,
  socketConnected,
  onOpenPatientSummary,
}: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [clientTyping, setClientTyping] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /* ================= FETCH HISTORY ================= */
  useEffect(() => {
    if (!consultation.chatRoomId) {
      console.log("No chatRoomId for consultation:", consultation.id);
      return;
    }

    const loadMessages = async () => {
      try {
        console.log("Loading messages for chatRoom:", consultation.chatRoomId);

        const res = await fetch(
          `${API_BASE_URL}/chat/${consultation.chatRoomId}`,
          {
            credentials: "include",
            headers: {
              Accept: "application/json",
            },
          }
        );

        console.log("Messages fetch status:", res.status);

        if (!res.ok) {
          const errorText = await res.text();
          console.error("Failed fetch messages:", res.status, errorText);
          return;
        }

        const rawMessages: any[] = await res.json();
        console.log("Loaded raw messages:", rawMessages);

        // ✅ Transform data dengan LOGIC YANG BENAR untuk menentukan posisi
        const formattedMessages: Message[] = rawMessages.map((msg: any) => {
          // LOGIC YANG DIPERBAIKI:
          // Jika senderType adalah DOCTOR → from: "doctor" (dokter ini sendiri, harus di kanan)
          // Jika senderType adalah CLIENT → from: "client" (pasien, harus di kiri)
          const from = msg.senderType === "DOCTOR" ? "doctor" : "user";

          return {
            id: msg.id,
            text: msg.content || "",
            from: from,
            timestamp: new Date(msg.createdAt),
            status: "sent",
            read: msg.isRead || false,
          };
        });

        console.log("Formatted messages:", formattedMessages);
        setMessages(formattedMessages);

        // Scroll ke bawah setelah messages di-load
        setTimeout(() => scrollToBottom(), 100);
      } catch (err) {
        console.error("Error loading messages:", err);
      }
    };

    loadMessages();
  }, [consultation.chatRoomId]);

  /* ================= SOCKET EVENTS ================= */
  useEffect(() => {
    if (!socket || !consultation.chatRoomId) return;

    // Join room ketika component mount
    socket.emit("joinRoom", {
      chatRoomId: consultation.chatRoomId,
      userId: "doctor",
      userType: "doctor",
    });

    console.log("✅ Joined room:", consultation.chatRoomId);

    const onNewMessage = (msg: any) => {
      console.log("📨 Received newMessage from socket:", msg);

      // ✅ LOGIC YANG DIPERBAIKI untuk menentukan posisi pesan
      // senderType dari server adalah "DOCTOR" atau "CLIENT"
      const senderType = msg.senderType || "";
      const isFromDoctor = senderType === "DOCTOR";

      setMessages((prev) => {
        // Cari dan hapus temp message jika ada
        const filtered = prev.filter((m) => !m.id.startsWith("temp-"));

        // Tentukan from berdasarkan senderType
        const from: "doctor" | "user" = isFromDoctor ? "doctor" : "user";

        const formattedMessage: Message = {
          id: msg.id,
          text: msg.content || msg.text || "",
          from: from,
          timestamp: new Date(msg.createdAt || msg.timestamp || Date.now()),
          status: "sent",
          read: msg.isRead || false,
        };

        console.log(
          "✅ Adding message from:",
          from,
          "| data:",
          formattedMessage
        );
        return [...filtered, formattedMessage];
      });

      scrollToBottom();
    };

    const onTyping = (data: {
      userId: string;
      isTyping: boolean;
      userType?: string;
    }) => {
      console.log("⌨️ Typing event:", data);

      // LOGIC YANG DIPERBAIKI: Tampilkan typing hanya jika bukan dari doctor
      // Jika data.userType ada, gunakan itu, jika tidak, cek userId
      if (data.userType) {
        if (data.userType.toLowerCase() !== "doctor") {
          setClientTyping(data.isTyping);
        }
      } else if (data.userId !== "doctor") {
        setClientTyping(data.isTyping);
      }
    };

    // Error handler
    const onErrorMessage = (error: any) => {
      console.error("Socket error:", error.message);
      // Update status pesan yang gagal
      setMessages((prev) =>
        prev.map((msg) =>
          msg.status === "sending" ? { ...msg, status: "failed" } : msg
        )
      );
    };

    socket.on("newMessage", onNewMessage);
    socket.on("typing", onTyping);
    socket.on("errorMessage", onErrorMessage);

    // Cleanup
    return () => {
      console.log("🧹 Cleaning up socket events");
      socket.off("newMessage", onNewMessage);
      socket.off("typing", onTyping);
      socket.off("errorMessage", onErrorMessage);

      // Leave room
      if (consultation.chatRoomId) {
        socket.emit("leaveRoom", {
          chatRoomId: consultation.chatRoomId,
          userId: "doctor",
        });
        console.log("🚪 Left room:", consultation.chatRoomId);
      }
    };
  }, [socket, consultation.chatRoomId]);

  /* ================= HELPERS ================= */
  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  /* ================= TYPING ================= */
  const handleTyping = () => {
    if (!socket || !socketConnected || !consultation.chatRoomId) return;

    socket.emit("typing", {
      chatRoomId: consultation.chatRoomId,
      userId: "doctor",
      userType: "doctor",
      isTyping: true,
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing", {
        chatRoomId: consultation.chatRoomId!,
        userId: "doctor",
        userType: "doctor",
        isTyping: false,
      });
    }, 1500);
  };

  /* ================= SEND ================= */
  const sendMessage = () => {
    console.log("🟢 [SEND MESSAGE] Function called!");
    console.log("=== DEBUG sendMessage ===");
    console.log("Input value:", input);
    console.log("Socket exists:", !!socket);
    console.log("Socket connected:", socketConnected);
    console.log("ChatRoomId:", consultation.chatRoomId);
    console.log("Consultation status:", consultation.status);

    // Cek semua kondisi dengan lebih detail
    if (!input.trim()) {
      console.log("❌ Input kosong atau hanya whitespace");
      return;
    }

    if (!socket) {
      console.log("❌ Socket is null/undefined");
      return;
    }

    if (!socketConnected) {
      console.log("❌ Socket not connected");
      return;
    }

    if (!consultation.chatRoomId) {
      console.log("❌ No chatRoomId");
      return;
    }

    if (consultation.status === "COMPLETED") {
      console.log("❌ Consultation is COMPLETED, cannot send");
      return;
    }

    console.log("✅ All conditions passed, sending message...");

    // ✅ TAMBAHKAN KODE INI UNTUK MENGIRIM PESAN
    const text = input.trim();
    setInput("");

    // Temp message dengan ID unik - PASTIKAN from: "doctor"
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const tempMessage: Message = {
      id: tempId,
      text,
      from: "doctor", // Dokter mengirim pesan, jadi from: "doctor"
      timestamp: new Date(),
      status: "sending",
    };

    console.log("📝 Adding temp message from doctor:", tempMessage);
    setMessages((prev) => [...prev, tempMessage]);
    scrollToBottom();

    // Stop typing indicator
    socket.emit("typing", {
      chatRoomId: consultation.chatRoomId,
      userId: "doctor",
      userType: "doctor",
      isTyping: false,
    });

    const emitData = {
      chatRoomId: consultation.chatRoomId,
      content: text,
      senderId: "doctor",
      senderType: "DOCTOR", // PASTIKAN uppercase untuk konsistensi
      consultationId: consultation.id,
    };

    console.log("🚀 Emitting sendMessage:", emitData);

    // Emit dengan callback untuk debugging
    socket.emit("sendMessage", emitData, (response: any) => {
      if (response) {
        console.log("✅ Server acknowledge response:", response);

        // Update temp message dengan data dari server
        if (response.message) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === tempId
                ? {
                    ...msg,
                    id: response.message.id,
                    status: "sent",
                    timestamp: new Date(response.message.createdAt),
                  }
                : msg
            )
          );
        }
      }
    });

    // Scroll setelah delay
    setTimeout(() => scrollToBottom(), 100);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  /* ================= DEBUG UTILITY ================= */
  const debugMessages = () => {
    console.log("=== DEBUG MESSAGES ===");
    console.log("Total messages:", messages.length);
    console.log("Current user perspective: DOCTOR");

    messages.forEach((msg, i) => {
      const ts =
        msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp);
      const side = msg.from === "doctor" ? "RIGHT (DOKTER)" : "LEFT (CLIENT)";
      console.log(
        `${i}: ID=${msg.id}, From=${msg.from} [${side}], Text="${msg.text}", Status=${msg.status}, Time=${ts.toISOString()}`
      );
    });
  };

  /* ================= UI ================= */
  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow">
      {/* HEADER */}
      <div className="p-4 border-b flex justify-between items-center">
        <div>
          <h3 className="font-semibold">
            Consultation Chat - Dr. {consultation.doctorId}
          </h3>
          <p className="text-sm text-gray-600">
            Patient: {consultation.clientName}
          </p>
          {clientTyping && (
            <p className="text-sm text-blue-600">Patient is typing…</p>
          )}
        </div>

        <div className="flex gap-2">
          {onOpenPatientSummary && (
            <button
              onClick={onOpenPatientSummary}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Patient Summary
            </button>
          )}

          {/* Debug button */}
          <button
            onClick={debugMessages}
            className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            title="Debug Info"
          >
            🔍 Debug
          </button>
        </div>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg) => {
            // Pastikan timestamp valid
            let timestamp: Date;
            try {
              timestamp =
                msg.timestamp instanceof Date
                  ? msg.timestamp
                  : new Date(msg.timestamp);
            } catch {
              timestamp = new Date();
            }

            // Format waktu
            const timeString = !isNaN(timestamp.getTime())
              ? timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })
              : "Just now";

            // LOGIC POSISI YANG DIPERBAIKI:
            // - Jika from: "doctor" → dokter ini sendiri → di KANAN
            // - Jika from: "client" → pasien → di KIRI

            const isDoctor = msg.from === "doctor";

            return (
              <div
                key={msg.id}
                className={`flex ${isDoctor ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] p-3 rounded-2xl text-sm ${
                    isDoctor
                      ? "bg-blue-600 text-white rounded-br-none" // Dokter: biru, kanan
                      : "bg-white border rounded-bl-none" // Client: putih, kiri
                  } ${msg.status === "sending" ? "opacity-70" : ""} 
                      ${msg.status === "failed" ? "bg-red-100 border-red-300 text-red-800" : ""}`}
                >
                  <div className="mb-1 text-xs font-medium">
                    {isDoctor ? "You (Doctor)" : consultation.clientName}
                  </div>
                  <div>{msg.text}</div>
                  <div
                    className={`text-xs mt-1 text-right ${
                      isDoctor ? "text-blue-200" : "text-gray-500"
                    }`}
                  >
                    {timeString}
                    {msg.status === "sending" && " • Sending..."}
                    {msg.status === "failed" && " • Failed"}
                    {msg.read && isDoctor && " • Read"}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* INPUT */}
      <div className="p-4 border-t flex gap-2">
        <textarea
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            handleTyping();
          }}
          onKeyDown={handleKeyDown}
          disabled={consultation.status === "COMPLETED"}
          rows={1}
          placeholder={
            consultation.status === "COMPLETED"
              ? "Consultation completed"
              : "Type message…"
          }
          className="flex-1 resize-none border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />

        <button
          onClick={sendMessage}
          disabled={!input.trim() || consultation.status === "COMPLETED"}
          className="px-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
        >
          Send
        </button>
      </div>
    </div>
  );
}
