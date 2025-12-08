"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

/* -----------------------------
   TYPES
----------------------------- */
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

/* -----------------------------
   MENU GROUPS
----------------------------- */
const menuGroups: MenuGroup[] = [
  {
    title: "ACADEMICS",
    items: [
      { icon: "/class.png", label: "Classes", href: "/list/classes", visible: ["admin", "teacher"] },
      { icon: "/lesson.png", label: "Lessons", href: "/list/lessons", visible: ["admin", "teacher"] },
      { icon: "/subject.png", label: "Subjects", href: "/list/subjects", visible: ["admin"] },
    ],
  },
  {
    title: "PEOPLE",
    items: [
      { icon: "/teacher.png", label: "Teachers", href: "/list/teachers", visible: ["admin", "teacher"] },
      { icon: "/student.png", label: "Students", href: "/list/students", visible: ["admin", "teacher"] },
      { icon: "/parent.png", label: "Parents", href: "/list/parents", visible: ["admin", "teacher"] },
    ],
  },
  {
    title: "ASSESSMENT",
    items: [
      { icon: "/exam.png", label: "Exams", href: "/list/exams", visible: ["admin", "teacher", "student", "parent"] },
      { icon: "/assignment.png", label: "Assignments", href: "/list/assignments", visible: ["admin", "teacher", "student", "parent"] },
      { icon: "/result.png", label: "Results", href: "/list/results", visible: ["admin", "teacher", "student", "parent"] },
      { icon: "/attendance.png", label: "Attendance", href: "/list/attendance", visible: ["admin", "teacher", "student", "parent"] },
    ],
  },
  {
    title: "FEES",
    items: [
      { icon: "/financial.png", label: "Fee Structures", href: "/list/fees", visible: ["admin"]},
      { icon: "/money.png", label: "Payments", href: "/list/payments", visible: ["admin"]},
    ],
  },
  {
    title: "COMMUNICATION",
    items: [
      { icon: "/announcement.png", label: "Announcements", href: "/list/announcements", visible: ["admin", "teacher", "student", "parent"] },
      { icon: "/calendar.png", label: "Events", href: "/list/events", visible: ["admin", "teacher", "student", "parent"] },
    ],
  },
  {
    title: "OTHER",
    items: [
      { icon: "/profile.png", label: "Profile", href: "/profile", visible: ["admin", "teacher", "student", "parent"] },
      { icon: "/setting.png", label: "Settings", href: "/settings", visible: ["admin", "teacher", "student", "parent"] },
      { icon: "/logout.png", label: "Logout", href: "/logout", visible: ["admin", "teacher", "student", "parent"] },
    ],
  },
];

/* -----------------------------
   COMPONENT
----------------------------- */
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

  const [open, setOpen] = useState(
    Object.fromEntries(menuGroups.map((g) => [g.title, true]))
  );

  return (
    <div className="space-y-3">
      {/* HOME */}
      <Link
        href={homeRoute}
        onClick={onItemClick}
        className={`flex items-center gap-3 px-4 py-2 rounded-md text-sm ${
          pathname === homeRoute
            ? "bg-lamaSkyLight font-medium text-gray-900"
            : "text-gray-600 hover:bg-gray-100"
        }`}
      >
        <Image src="/home.png" alt="" width={18} height={18} />
        <span>Home</span>
      </Link>

      <div className="h-px bg-gray-200" />

      {menuGroups.map((group) => {
        const visibleItems = group.items.filter((i) =>
          i.visible.includes(role)
        );

        if (!visibleItems.length) return null;

        return (
          <div key={group.title}>
            <button
              onClick={() =>
                setOpen((p) => ({ ...p, [group.title]: !p[group.title] }))
              }
              className="w-full flex justify-between items-center px-3 py-2 text-xs font-semibold text-gray-500 hover:text-gray-900"
            >
              {group.title}
              <span
                className={`transition-transform ${
                  open[group.title] ? "rotate-90" : ""
                }`}
              >
                ▶
              </span>
            </button>

            {open[group.title] && (
              <div className="space-y-1">
                {visibleItems.map((item) => {
                  const active = pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={onItemClick}
                      className={`flex items-center gap-3 px-4 py-2 rounded-md text-sm ${
                        active
                          ? "bg-lamaSkyLight font-medium text-gray-900"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <Image src={item.icon} alt="" width={18} height={18} />
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
