# Frontend - DocGo

This is the frontend for the DocGo application, built with Next.js 16 and Tailwind CSS.

## Tech Stack

-   **Framework:** Next.js (App Router)
-   **Language:** TypeScript
-   **Styling:** Tailwind CSS 4, Tailwind Merge, CLSX
-   **UI Components:** Radix UI (primitives), Lucide React (icons), Sonner/Toastify (notifications)
-   **Charts:** Recharts
-   **Real-time:** Socket.io Client
-   **Authentication:** JOSE, JWT

## Prerequisites

-   Node.js (Active LTS version recommended)
-   npm or yarn

## Installation

1.  Navigate to the frontend folder:
    ```bash
    cd frontend
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Set up environment variables:
    -   Create a `.env.local` or `.env` file.
    -   Ensure backend URLs and other public variables are set.

## Running the Application

### Development Server

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Build and Production

To build the application for production:

```bash
npm run build
```

To start the production server:

```bash
npm start
```

## Folder Structure

-   `app/`: Next.js App Router pages and layouts
-   `components/`: Reusable UI components
-   `lib/`: Utility functions and library configurations
-   `client/`: API clients or specific frontend logic
