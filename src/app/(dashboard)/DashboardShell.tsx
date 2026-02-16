"use client";

import { ReactNode, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Menu from "@/components/Menu";
import NavbarClient from "@/components/NavbarClient";
import { useRouter, usePathname } from "next/navigation";
import BackButton from "@/components/BackButton";

type Role = "admin" | "teacher" | "student" | "parent";

export default function DashboardShell({
  children,
  role,
}: {
  children: ReactNode;
  role: Role;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const showBack = pathname?.startsWith("/list/teachers/");

  return (
    /* ⭐ CRITICAL FIX: h-screen + overflow-hidden */
    <div className="h-screen flex w-full overflow-hidden bg-[#F7F8FA]">
      {/* ================= DESKTOP SIDEBAR ================= */}
      {/* ⭐ FIX: h-screen + no scroll */}
      <aside className="hidden lg:flex flex-col h-screen w-[16%] xl:w-[14%] bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-300 border-r p-3 shrink-0">
        <Link href="/" className="flex items-center gap-2 mb-6 px-2">
          <Image src="/my_logo.png" alt="logo" width={32} height={32} />
          <span className="font-bold">TrueSunshine</span>
        </Link>

        {/* menu only scrolls internally if needed */}
        <div className="flex-1 overflow-y-auto">
          <Menu mode="desktop" role={role} />
        </div>
      </aside>

      {/* ================= MOBILE DRAWER ================= */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
          />

          <aside className="absolute left-0 top-0 h-full w-62 bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 p-4 overflow-y-auto">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <Image src="/my_logo.png" alt="logo" width={32} height={32} />
              <span className="font-bold text-white">TrueSunshine</span>
            </Link>

            <Menu
              mode="mobile"
              role={role}
              onItemClick={() => setMobileMenuOpen(false)}
            />
          </aside>
        </div>
      )}

      {/* ================= MAIN CONTENT ================= */}
      {/* ⭐ ONLY THIS AREA SCROLLS */}
      <section className="flex flex-col flex-1 overflow-hidden">
        <NavbarClient onMenuClick={() => setMobileMenuOpen(true)} />

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6">
          {showBack && <BackButton label="Back to Teachers" />}
          {children}
        </main>
      </section>
    </div>
  );
}
