require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const prisma = require("./db/prisma");
const authRoutes = require("./route/AuthRoutes");
const symptomRoutes = require("./route/SymptomRoutes");
const userRoutes = require("./route/UserRoutes");
const ScrapingRoutes = require("./route/ScrapingRoutes");
const ReminderRoutes = require("./route/ReminderRoutes");
const consultationRoutes = require("./route/ConsultationRoutes");
const chatRoutes = require("./route/ChatRoutes");
const DoctorRoutes = require("./route/DoctorRoutes");
const AdminRoutes = require("./route/AdminRoutes");
const AdminUserRoutes = require("./route/AdminUserRoutes");
const NotificationRoutes = require("./route/NotificationRoutes");
const { startReminderWorker } = require("./workers/reminderWorker");
const { scheduleReminders } = require("./controllers/ReminderController");
const cors = require("cors");
const chatSocket = require("./sockets/chatSocket");
const cookieParser = require("cookie-parser");
const app = express();
require("./workers/consultationWorker");
require("./workers/notifWorker"); // ini akan jalankan worker
require("./workers/notifWorker"); // jalankan worker
const {
  processScheduledNotifications,
} = require("./helper/processScheduledNotifications");

setInterval(
  () => processScheduledNotifications().catch(console.error),
  60 * 1000
);

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cookieParser());

app.use(
  cors({
    origin: [
      "http://localhost:3001",
      "http://localhost:3000",
      "http://10.0.2.2:3000",
      "https://example.com",
      "http://localhost:45435",

    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  req.prisma = prisma;
  next();
});

app.use("/auth", authRoutes);
app.use("/symptoms", symptomRoutes);
app.use("/me", userRoutes);
app.use("/scrape", ScrapingRoutes);
app.use("/reminder", ReminderRoutes);
app.use("/consultation", consultationRoutes);
app.use("/chat", chatRoutes);
app.use("/doctor", DoctorRoutes);
app.use("/admin", AdminRoutes);
app.use("/adminuser", AdminUserRoutes);
app.use("/notif", NotificationRoutes);

app.get("/", (req, res) => res.json({ status: "OK" }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Terjadi kesalahan pada server",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

startReminderWorker();

setInterval(() => scheduleReminders().catch(console.error), 60 * 1000);

chatSocket(io);

const PORT = process.env.PORT;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
