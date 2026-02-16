"use client";

import { Eye, FileText, UserCheck } from "lucide-react";

export default function PrivacySettingsPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <header>
        <h2 className="text-lg font-semibold">
          Privacy & Permissions
        </h2>
        <p className="text-sm text-gray-500">
          Control access and visibility
        </p>
      </header>

      <div className="divide-y rounded-xl border">
        <StaticRow
          icon={<UserCheck />}
          title="Role"
          desc="Administrator"
        />

        <div className="flex items-center justify-between p-4 sm:p-6">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-lg bg-gray-100">
              <Eye />
            </div>
            <p className="font-medium">Data Visibility</p>
          </div>

          <select className="border rounded-lg px-3 py-2 text-sm">
            <option>Admins Only</option>
            <option>Staff</option>
            <option>Everyone</option>
          </select>
        </div>

        <StaticRow
          icon={<FileText />}
          title="Audit Logs"
          desc="View system activity"
          action="View Logs"
        />
      </div>
    </div>
  );
}

function StaticRow({
  icon,
  title,
  desc,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  action?: string;
}) {
  return (
    <div className="flex items-center justify-between p-4 sm:p-6">
      <div className="flex items-center gap-4">
        <div className="p-2 rounded-lg bg-gray-100">{icon}</div>
        <div>
          <p className="font-medium">{title}</p>
          <p className="text-sm text-gray-500">{desc}</p>
        </div>
      </div>

      {action && (
        <button className="border rounded-lg px-3 py-1 text-sm">
          {action}
        </button>
      )}
    </div>
  );
}
