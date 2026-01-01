# 🌐 DocGo Web Dashboard

![Next JS](https://img.shields.io/badge/Next-black?style=for-the-badge&logo=next.js&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Radix UI](https://img.shields.io/badge/radix%20ui-161618.svg?style=for-the-badge&logo=radix-ui&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)

The comprehensive web interface for DocGo Administrators and Doctors. Built with the latest Next.js 16 App Router.

## 🌟 Features

-   **admin/dashboard**: Complete analytics overview.
-   **doctor/schedule**: Interactive calendar for appointment management.
-   **Real-time Updates**: Live notifications and chat.
-   **Responsive Design**: Optimized for Desktop and Tablets.
-   **Dark Mode**: Native support via `next-themes`.

## 🛠️ Tech Stack

-   **Framework**: Next.js 16 (App Router)
-   **Styling**: Tailwind CSS 4
-   **Icons**: Lucide React
-   **Charts**: Recharts
-   **Forms**: React Hook Form + Zod

## 🚀 Getting Started

### Prerequisites

-   Node.js (v18+)

### Installation

1.  **Enter directory**
    ```bash
    cd frontend
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment**
    Create `.env.local`:
    ```env
    NEXT_PUBLIC_API_URL="http://localhost:4000"
    ```

### 🏃‍♂️ Running the App

```bash
# Start Development Server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## 📂 Project Structure

```
frontend/
├── app/            # App Router Pages & Layouts
│   ├── (auth)/     # Authentication Routes
│   ├── admin/      # Admin Dashboard
│   └── doctor/     # Doctor Dashboard
├── components/     # Reusable UI Components
├── lib/            # Utilities & Helpers
└── public/         # Static Assets
```

---
*Back to [Root Documentation](../README.md)*
