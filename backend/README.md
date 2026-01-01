# ⚙️ DocGo Backend Service

![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101)

The robust server-side application powering the DocGo ecosystem. It handles data persistence, real-time communication, and background jobs.

## 🛠️ Tech Stack

-   **Runtime Environment**: Node.js
-   **Framework**: Express.js
-   **Database**: PostgreSQL / MySQL (via Prisma ORM)
-   **Real-time Engine**: Socket.io
-   **Task Queue**: BullMQ & Redis
-   **Authentication**: JWT & Firebase Admin

## 🔑 Key Features

-   ✅ **Secure Authentication**: Robust JWT-based auth with Role-Based Access Control (RBAC).
-   ✅ **Real-time Chat**: Instant messaging between patients and doctors.
-   ✅ **Job Scheduling**: Automated reminders using BullMQ workers.
-   ✅ **File Management**: Secure file uploads with Multer and Sharp optimization.
-   ✅ **Email Notifications**: Transactional emails via Nodemailer/Resend.

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:
-   Node.js (v18+)
-   npm or yarn
-   Redis (for background jobs)

### Installation

1.  **Clone the repo & Enter directory**
    ```bash
    cd backend
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Environment Configuration**
    Create a `.env` file in the root directory:
    ```env
    DATABASE_URL="postgresql://user:password@localhost:5432/docgo"
    JWT_SECRET="your_super_secret_key"
    REDIS_HOST="localhost"
    # ... other variables
    ```

4.  **Database Setup**
    ```bash
    npx prisma generate
    npx prisma db push
    ```

### 🏃‍♂️ Running the Server

| Mode | Command | Description |
| :--- | :--- | :--- |
| **Development** | `npm run dev` | Starts server with `nodemon` for hot reloading. |
| **Production** | `npm start` | Starts the optimized production build. |

## 📂 Project Anatomy

```
backend/
├── controllers/    # Request handlers (Business Logic)
├── route/          # API Endpoint definitions
├── middleware/     # Auth & Validation middlewares
├── prisma/         # Database Schema & Migrations
├── sockets/        # Real-time event handlers
├── workers/        # Background job processors
└── index.js        # Entry point
```

---
*Back to [Root Documentation](../README.md)*
