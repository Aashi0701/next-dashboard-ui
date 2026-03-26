"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";

/* TYPES */
type Role = "admin" | "teacher" | "student" | "parent";

type MenuItem = {
  icon: string;
  label: string;
  href: string;
  visible: Role[];
};

type MenuGroup = {
  title: string;
  items: MenuItem[];
};

/* MENU GROUPS */
const menuGroups: MenuGroup[] = [
  {
    title: "ACADEMICS",
    items: [
      {
        icon: "/training.png",
        label: "Classes",
        href: "/list/classes",
        visible: ["admin", "teacher"],
      },
      {
        icon: "/lessons.png",
        label: "Lessons",
        href: "/list/lessons",
        visible: ["admin", "teacher", "parent"],
      },
      {
        icon: "/book.png",
        label: "Subjects",
        href: "/list/subjects",
        visible: ["admin", "teacher", "parent"],
      },
    ],
  },
  {
    title: "PEOPLE",
    items: [
      {
        icon: "/man.png",
        label: "Teachers",
        href: "/list/teachers",
        visible: ["admin"],
      },
      {
        icon: "/education.png",
        label: "Students",
        href: "/list/students",
        visible: ["admin", "teacher"],
      },
      {
        icon: "/love.png",
        label: "Parents",
        href: "/list/parents",
        visible: ["admin", "teacher"],
      },
      {
        icon: "/users.png",
        label: "Leads",
        href: "/list/leads",
        visible: ["admin"],
      },
    ],
  },
  {
    title: "ASSESSMENT",
    items: [
      {
        icon: "/exams.png",
        label: "Exams",
        href: "/list/exams",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: "/assignments.png",
        label: "Assignments",
        href: "/list/assignments",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: "/rankings.png",
        label: "Results",
        href: "/list/results",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: "/attendances.png",
        label: "Attendance",
        href: "/list/attendance",
        visible: ["admin", "teacher", "student", "parent"],
      },
    ],
  },
  {
    title: "FEES",
    items: [
      {
        icon: "/fees.png",
        label: "Fee",
        href: "/list/fees",
        visible: ["admin"],
      },
      {
        icon: "/payments.png",
        label: "Payments",
        href: "/list/payments",
        visible: ["admin"],
      },
    ],
  },
  {
    title: "COMMUNICATION",
    items: [
      {
        icon: "/announcements.png",
        label: "Announcements",
        href: "/list/announcements",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: "/events.png",
        label: "Events",
        href: "/list/events",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: "/holidays.png",
        label: "Holidays",
        href: "/list/holidays",
        visible: ["admin"],
      },
    ],
  },
  {
    title: "OTHER",
    items: [
      {
        icon: "/users.png",
        label: "Profile",
        href: "/list/profile",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: "/settings.png",
        label: "Settings",
        href: "/list/settings",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: "/logouts.png",
        label: "Logout",
        href: "/logout",
        visible: ["admin", "teacher", "student", "parent"],
      },
    ],
  },
];

/* COMPONENT */
export default function Menu({
  mode,
  role,
  onItemClick,
}: {
  mode: "desktop" | "mobile";
  role: Role;
  onItemClick?: () => void;
}) {
  const pathname = usePathname();
  const shouldAutoOpen = mode === "desktop";

  /* -------- helpers -------- */
  const isGroupActive = (items: MenuItem[]) =>
    items.some(
      (item) => pathname === item.href || pathname.startsWith(item.href + "/"),
    );

  const homeRoute =
    role === "admin"
      ? "/admin"
      : role === "teacher"
        ? "/teacher"
        : role === "student"
          ? "/student"
          : role === "parent"
            ? "/parent"
            : "/";

  /* -------- open accordion state -------- */
  const [openSection, setOpenSection] = useState<string | null>(() => {
    const activeGroup = menuGroups.find((group) =>
      group.items.some(
        (item) =>
          pathname === item.href || pathname.startsWith(item.href + "/"),
      ),
    );
    return activeGroup?.title ?? null;
  });

  useEffect(() => {
    if (!shouldAutoOpen) return;

    const activeGroup = menuGroups.find((group) =>
      group.items.some(
        (item) =>
          pathname === item.href || pathname.startsWith(item.href + "/"),
      ),
    );

    setOpenSection(activeGroup?.title ?? null);
  }, [pathname, shouldAutoOpen]);

  return (
    <div className="space-y-3">
      {/* HOME */}
      <Link
        href={homeRoute}
        onClick={() => {
          if (mode === "mobile") {
            setOpenSection(null);
            onItemClick?.();
          }
        }}
        className={`group flex items-center gap-3 px-4 py-2 rounded-md text-sm
          transition-all duration-200 ease-out
          ${
            pathname === homeRoute
              ? "bg-white/30 backdrop-blur-sm text-gray-900 font-semibold shadow-sm"
              : "text-white/90 hover:bg-white/20 hover:text-gray-900"
          }
        `}
      >
        <Image src="/home.png" alt="" width={18} height={18} />
        <span className="tracking-wide">Home</span>
      </Link>

      <div className="h-px bg-gray-200" />

      {/* GROUPS */}
      {menuGroups.map((group) => {
        const visibleItems = group.items.filter((i) =>
          i.visible.includes(role),
        );
        if (!visibleItems.length) return null;

        const groupActive = isGroupActive(visibleItems);

        return (
          <div key={group.title}>
            {/* GROUP HEADER */}
            <button
              onClick={() => {
                setOpenSection((prev) =>
                  prev === group.title ? null : group.title,
                );
              }}
              className={`w-full flex justify-between items-center px-3 py-2 text-xs font-semibold
                transition-colors
                ${groupActive ? "text-white" : "text-black hover:text-white"}
              `}
            >
              {group.title}
              <ChevronRight
                size={14}
                className={`transition-transform duration-300 ${
                  openSection === group.title ? "rotate-90" : ""
                }`}
              />
            </button>

            {/* GROUP ITEMS */}
            {openSection === group.title && (
              <div className="mt-1 space-y-1">
                {visibleItems.map((item) => {
                  const active =
                    pathname === item.href ||
                    pathname.startsWith(item.href + "/");

                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => {
                        if (mode === "mobile") {
                          setOpenSection(null);
                          onItemClick?.();
                        }
                      }}
                      className={`group flex items-center gap-3 px-4 py-2 rounded-lg text-sm
                        transition-all duration-200
                        ${
                          active
                            ? "bg-white/70 text-indigo-900 font-semibold shadow-sm"
                            : "text-white/90 hover:bg-white/20 hover:text-white"
                        }
                      `}
                    >
                      <Image src={item.icon} alt="" width={16} height={16} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
