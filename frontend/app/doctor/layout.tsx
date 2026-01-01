import { ReactNode } from "react";
import DoctorSidebar from "@/app/doctor/sidebar";

export const metadata = {
  title: "Doctor Dashboard",
  description: "Dashboard for doctors",
};

export default function DoctorLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <DoctorSidebar />
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  );
}

