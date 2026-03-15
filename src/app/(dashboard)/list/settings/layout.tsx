"use client";

import { usePathname, useRouter } from "next/navigation";

const tabs = [
  { label: "Account & Security", href: "/list/settings/security" },
  { label: "Notifications", href: "/list/settings/notifications" },
  { label: "Privacy & Permissions", href: "/list/settings/privacy" },
  { label: "Appearance", href: "/list/settings/appearance" },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 px-3 sm:px-4 lg:px-6 py-3">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-lg sm:text-xl font-semibold mb-4">Settings</h1>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto lg:flex-col -mx-3 px-3 pb-2">
            {tabs.map((tab) => {
              const active = pathname.startsWith(tab.href);

              return (
                <button
                  key={tab.href}
                  onClick={() => router.push(tab.href)}
                  className={`
          flex-shrink-0
          px-4 py-2 rounded-lg text-sm font-medium
          transition
          ${active ? "bg-blue-600 text-white" : "bg-white border"}
        `}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="flex-1 bg-white rounded-xl border p-3 sm:p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
