"use client";

import { Bell, Mail, Megaphone } from "lucide-react";
import { useState } from "react";

export default function NotificationSettingsPage() {
  const [prefs, setPrefs] = useState({
    email: true,
    system: true,
    announcements: true,
  });

  return (
    <div className="space-y-6 max-w-3xl">
      <header>
        <h2 className="text-lg font-semibold">Notifications</h2>
        <p className="text-sm text-gray-500">
          Control how you receive notifications
        </p>
      </header>

      <div className="divide-y rounded-xl border">
        <ToggleRow
          icon={<Mail />}
          title="Email Notifications"
          checked={prefs.email}
          onToggle={() =>
            setPrefs((p) => ({ ...p, email: !p.email }))
          }
        />

        <ToggleRow
          icon={<Bell />}
          title="System Alerts"
          checked={prefs.system}
          onToggle={() =>
            setPrefs((p) => ({ ...p, system: !p.system }))
          }
        />

        <ToggleRow
          icon={<Megaphone />}
          title="Announcements"
          checked={prefs.announcements}
          onToggle={() =>
            setPrefs((p) => ({
              ...p,
              announcements: !p.announcements,
            }))
          }
        />
      </div>
    </div>
  );
}

function ToggleRow({
  icon,
  title,
  checked,
  onToggle,
}: {
  icon: React.ReactNode;
  title: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between p-4 sm:p-6">
      <div className="flex items-center gap-4">
        <div className="p-2 rounded-lg bg-gray-100">{icon}</div>
        <p className="font-medium">{title}</p>
      </div>

      <button
        onClick={onToggle}
        className={`h-6 w-11 rounded-full transition ${
          checked ? "bg-blue-600" : "bg-gray-300"
        }`}
      >
        <span
          className={`block h-4 w-4 bg-white rounded-full transform transition ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}
