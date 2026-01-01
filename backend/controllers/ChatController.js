const prisma = require("../db/prisma");
const createMessage = async ({
  chatRoomId,
  senderType,
  senderId,
  content,
  type = "TEXT",
  meta = {},
}) => {
  console.log("🎯 [CONTROLLER] createMessage called with params:", {
    chatRoomId,
    senderType, // Lihat value ini
    senderId,
    contentLength: content?.length,
    contentPreview: content?.substring(0, 50),
  });

  // Cek chatRoom
  const chatRoom = await prisma.chatRoom.findUnique({
    where: { id: chatRoomId },
  });

  if (!chatRoom) {
    throw new Error(`ChatRoom with id ${chatRoomId} not found`);
  }

  if (!chatRoom.isActive) {
    throw new Error(`ChatRoom ${chatRoomId} is not active`);
  }

  // ✅ PERBAIKAN: Convert senderType ke format ENUM yang benar
  let validSenderType;

  // Cek kemungkinan format enum
  if (senderType === "doctor" || senderType === "DOCTOR") {
    validSenderType = "DOCTOR"; // atau "DOCTOR" sesuai schema
  } else if (
    senderType === "USER" ||
    senderType === "USER" ||
    senderType === "client"
  ) {
    validSenderType = "USER";
  } else {
    // Fallback atau error
    console.warn(`Unknown senderType: ${senderType}, defaulting to USER`);
    validSenderType = "USER";
  }

  console.log(
    `🔄 Converted senderType: "${senderType}" -> "${validSenderType}"`
  );

  // Create message dengan senderType yang valid
  const message = await prisma.message.create({
    data: {
      chatRoomId,
      senderType: validSenderType, // <- Gunakan yang sudah dikonversi
      senderId,
      content,
      type,
      meta,
    },
  });

  console.log("💾 [DB] Message created successfully:", {
    id: message.id,
    chatRoomId: message.chatRoomId,
    senderType: message.senderType, // Lihat value yang tersimpan
    contentPreview: message.content?.substring(0, 100),
    createdAt: message.createdAt,
  });

  return message;
};
const sendMessage = async (req, res) => {
  try {
    const message = await createMessage(req.body);
    return res.status(201).json(message);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

const getMessages = async (req, res) => {
  try {
    const { chatRoomId } = req.params;
    const messages = await prisma.message.findMany({
      where: { chatRoomId },
      orderBy: { createdAt: "asc" },
    });
    return res.json(messages);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

module.exports = { createMessage, sendMessage, getMessages };
