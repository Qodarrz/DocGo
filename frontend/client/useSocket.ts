// File: /client/useSocket.ts
import { io, Socket } from "socket.io-client";
import { useEffect, useState, useCallback } from "react";

const API_BASE_URL = (() => {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined");
  }
  return url;
})();

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    console.log("🔌 Initializing socket connection...");

    // URL harus sama dengan server
    const socketInstance = io(API_BASE_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 20000,
    });

    // Event listeners
    socketInstance.on("connect", () => {
      console.log(
        "✅ Socket.IO connected successfully! ID:",
        socketInstance.id
      );
      setIsConnected(true);
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("❌ Socket.IO disconnected. Reason:", reason);
      setIsConnected(false);
    });

    socketInstance.on("connect_error", (error) => {
      console.error("🔴 Socket connection error:", error.message);
      console.error("Error details:", error);
      setIsConnected(false);
    });

    socketInstance.on("error", (error) => {
      console.error("🔴 Socket error:", error);
    });

    // Set initial state
    if (socketInstance.connected) {
      console.log("Socket already connected on init");
      setIsConnected(true);
    }

    setSocket(socketInstance);

    // Cleanup
    return () => {
      console.log("🧹 Cleaning up socket instance");
      if (socketInstance) {
        socketInstance.removeAllListeners();
        socketInstance.disconnect();
      }
    };
  }, []);

  return socket;
};
