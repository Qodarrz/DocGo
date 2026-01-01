import { ReactNode } from "react";
import AdminSidebar from "@/app/admin/sidebar";

export const metadata = {
  title: "AdminDashboard",
  description: "Dashboard for Admin",
};

export default function Adminayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  );
}

