"use client";

import Image from "next/image";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";

type Props = {
  fullName?: string;
  role?: string;
  unreadAnnouncements?: number;
  onMenuClick?: () => void;
};

export default function NavbarClient({
  fullName,
  role,
  unreadAnnouncements = 0,
  onMenuClick,
}: Props) {
  const pathname = usePathname();
  const hideBadge = pathname.startsWith("/list/announcements");

  const showBadge = unreadAnnouncements > 0 && !hideBadge;

  return (
    <nav className="h-14 bg-white border-b flex items-center px-4">
      {/* Mobile menu */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-md hover:bg-gray-100"
        aria-label="Open menu"
      >
        ☰
      </button>

      <div className="ml-auto flex items-center gap-4">
        <Link
          href="/list/announcements"
          className="relative w-8 h-8 flex items-center justify-center rounded-full bg-gray-100"
        >
          <Image src="/announcement.png" alt="" width={18} height={18} />
          {showBadge && (
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] px-1.5 rounded-full min-w-[18px] text-center">
              {unreadAnnouncements > 99 ? "99+" : unreadAnnouncements}
            </span>
          )}
        </Link>

        <div className="hidden sm:flex flex-col items-end">
          <span className="text-xs font-medium">{fullName}</span>
          <span className="text-[10px] text-gray-500 capitalize">{role}</span>
        </div>

        <UserButton />
      </div>
    </nav>
  );
}
