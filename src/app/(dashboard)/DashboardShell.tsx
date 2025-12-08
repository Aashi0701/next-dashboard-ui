"use client";

import { ReactNode, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Menu from "@/components/Menu";
import NavbarClient from "@/components/NavbarClient";

type Role = "admin" | "teacher" | "student" | "parent";

export default function DashboardShell({
  children,
  navbarData,
  role,
}: {
  children: ReactNode;
  navbarData: {
    fullName: string;
    role: string;
    unreadAnnouncements: number;
  };
  role: Role;                 // ✅ ADD ROLE
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-[#F7F8FA]">
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:block w-[16%] xl:w-[14%] bg-white border-r p-3">
        <Link href="/" className="flex items-center gap-2 mb-6 px-2">
          <Image src="/my_logo.png" alt="logo" width={32} height={32} />
          <span className="font-bold">TrueSunshine</span>
        </Link>

        {/* ✅ MENU IS NOW INSTANT */}
        <Menu mode="desktop" role={role} />
      </aside>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-72 bg-white p-4">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <Image src="/my_logo.png" alt="logo" width={32} height={32} />
              <span className="font-bold">TrueSunshine</span>
            </Link>

            <Menu
              mode="mobile"
              role={role}
              onItemClick={() => setMobileMenuOpen(false)}
            />
          </aside>
        </div>
      )}

      {/* MAIN CONTENT */}
      <section className="flex flex-col flex-1">
        <NavbarClient
          {...navbarData}
          onMenuClick={() => setMobileMenuOpen(true)}
        />

        <main className="flex-1 overflow-x-hidden p-4">
          {children}
        </main>
      </section>
    </div>
  );
}
