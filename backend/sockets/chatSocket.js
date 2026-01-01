const { createMessage } = require("../controllers/ChatController");

const chatSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    socket.on("joinRoom", ({ chatRoomId, userId }) => {
      socket.join(chatRoomId);
      console.log(`${userId} joined room ${chatRoomId}`);
    });

    socket.on("sendMessage", async (data) => {
      try {
        console.log("=".repeat(50));
        console.log("📩 [SOCKET] Received sendMessage event");
        console.log("Data received:", JSON.stringify(data, null, 2));
        console.log("Socket ID:", socket.id);
        console.log("Room check - socket rooms:", Array.from(socket.rooms));

        // Validasi required fields
        if (!data.chatRoomId) {
          console.error("❌ Missing chatRoomId");
          throw new Error("Missing chatRoomId");
        }

        if (!data.content) {
          console.error("❌ Missing content");
          throw new Error("Missing content");
        }

        console.log(
          `📝 Calling createMessage for chatRoom: ${data.chatRoomId}`
        );

        const message = await createMessage(data);
        console.log("✅ [DB] Message created:", {
          id: message.id,
          content: message.content,
          senderType: message.senderType,
          createdAt: message.createdAt,
        });

        // Transform format
        const frontendMessage = {
          id: message.id,
          text: message.content,
          from: message.senderType === "DOCTOR" ? "doctor" : "user", // <-- PERBAIKAN DI SINI
          timestamp: message.createdAt,
          status: "sent",
          read: false,
          // Tambahkan field tambahan untuk konsistensi
          senderType: message.senderType,
          senderId: data.senderId,
        };

        console.log(`📤 [EMIT] Sending newMessage to room: ${data.chatRoomId}`);
        console.log("Emitted message:", frontendMessage);

        // Cek siapa yang ada di room ini
        const roomSockets = await io.in(data.chatRoomId).fetchSockets();
        console.log(
          `👥 Clients in room ${data.chatRoomId}:`,
          roomSockets.map((s) => s.id)
        );

        io.to(data.chatRoomId).emit("newMessage", frontendMessage);
        console.log("✅ [EMIT] newMessage event sent");
        console.log("=".repeat(50));
      } catch (err) {
        console.error("❌ [ERROR] in sendMessage:", err.message);
        console.error("Stack trace:", err.stack);
        socket.emit("errorMessage", {
          message: err.message,
          code: "SEND_MESSAGE_ERROR",
        });
      }
    });

    socket.on("disconnect", () =>
      console.log("Client disconnected:", socket.id)
    );
  });
};

module.exports = chatSocket;
