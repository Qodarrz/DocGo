"use client";
import React, { useState } from "react";
import { motion } from "motion/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  IconDashboard,
  IconUsers,
  IconStethoscope,
  IconPill,
  IconChartBar,
} from "@tabler/icons-react";

interface SidebarLinkProps {
  label: string;
  href: string;
  icon: React.ReactNode;
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const links: SidebarLinkProps[] = [
    { label: "Dashboard", href: "/admin", icon: <IconDashboard className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" /> },
    { label: "User Management", href: "/admin/user", icon: <IconUsers className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" /> },
    { label: "Doctor Management", href: "/admin/doctor", icon: <IconStethoscope className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" /> },
    { label: "Linked", href: "/admin/linked", icon: <IconPill className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" /> },
    { label: "Grafik & Laporan", href: "/admin/grafik", icon: <IconChartBar className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" /> },
  ];

  return (
    <motion.div
      className="flex flex-col px-4 py-4 bg-neutral-100 dark:bg-neutral-800 shrink-0"
      animate={{ width: open ? 220 : 80 }}
      initial={{ width: 80 }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      style={{ minHeight: "100vh" }}
    >
      <Logo open={open} />
      <div className="mt-8 flex flex-col gap-2 flex-1 overflow-y-auto">
        {links.map((link, idx) => (
          <SidebarLink key={idx} link={link} isActive={pathname === link.href} open={open} />
        ))}
      </div>
    </motion.div>
  );
}

const Logo = ({ open }: { open: boolean }) => (
  <Link href="/admin" className="flex items-center space-x-2 py-1 text-sm font-normal text-black">
    <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-blue-600 dark:bg-blue-400" />
    {open && (
      <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-medium whitespace-pre text-black dark:text-white">
        NeoWest Admin
      </motion.span>
    )}
  </Link>
);

interface SidebarLinkComponentProps {
  link: SidebarLinkProps;
  isActive?: boolean;
  open: boolean;
}

const SidebarLink = ({ link, isActive = false, open }: SidebarLinkComponentProps) => (
  <Link
    href={link.href}
    className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
      isActive
        ? "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white"
        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
    }`}
  >
    {link.icon}
    {open && (
      <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm whitespace-pre">
        {link.label}
      </motion.span>
    )}
  </Link>
);
