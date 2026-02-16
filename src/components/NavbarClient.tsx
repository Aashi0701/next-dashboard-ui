"use client";

import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const UserButton = dynamic(
  () => import("@clerk/nextjs").then((mod) => mod.UserButton),
  { ssr: false }
);

type NavbarData = {
  fullName: string;
  role: string;
  unreadAnnouncements: number;
};

export default function NavbarClient({ onMenuClick }: { onMenuClick?: () => void }) {
  const pathname = usePathname();
  const [data, setData] = useState<NavbarData | null>(null);

  useEffect(() => {
    fetch("/api/navbar")
      .then((res) => res.json())
      .then(setData)
      .catch(() => {
        setData({ fullName: "", role: "", unreadAnnouncements: 0 });
      });
  }, []);

  const hideBadge = pathname.startsWith("/list/announcements");
  const showBadge = data && data.unreadAnnouncements > 0 && !hideBadge;

  return (
    <nav className="h-14 bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-300 border-b flex items-center px-4">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-md hover:bg-gray-100 text-white font-bold"
      >
        ☰
      </button>

      <div className="ml-auto flex items-center gap-4">
        <Link
          href="/list/announcements"
          className="relative w-6 h-6 flex items-center justify-center rounded-full bg-white"
        >
          <Image src="/announcements.png" alt="" width={14} height={14} />
          {showBadge && (
            <span className="absolute -top-2 -right-1 bg-red-600 text-white text-[10px] px-1.5 rounded-full">
              {data!.unreadAnnouncements > 99 ? "99+" : data!.unreadAnnouncements}
            </span>
          )}
        </Link>

        <div className="hidden sm:flex flex-col items-end">
          <span className="text-xs font-medium">{data?.fullName}</span>
          <span className="text-[10px] text-gray-500 capitalize">{data?.role}</span>
        </div>

        <UserButton />
      </div>
    </nav>
  );
}
