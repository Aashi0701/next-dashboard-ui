"use client";

import { Lock, ShieldCheck, Monitor } from "lucide-react";

export default function SecuritySettingsPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <header>
        <h2 className="text-lg font-semibold">Account & Security</h2>
        <p className="text-sm text-gray-500">
          Protect your account and manage access
        </p>
      </header>

      <div className="divide-y rounded-xl border">
        <Row
          icon={<Lock className="w-5 h-5 text-blue-600" />}
          title="Change Password"
          desc="Update your account password"
          action="Update"
        />

        <Row
          icon={<Monitor className="w-5 h-5 text-gray-600" />}
          title="Active Sessions"
          desc="Devices logged into your account"
          action="View"
        />

        <Row
          icon={<ShieldCheck className="w-5 h-5 text-green-600" />}
          title="Two-Factor Authentication"
          desc="Add extra account protection"
          action="Configure"
        />
      </div>
    </div>
  );
}

function Row({
  icon,
  title,
  desc,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  action: string;
}) {
  return (
    <div className="flex items-center justify-between p-4 sm:p-6">
      <div className="flex items-start gap-4">
        <div className="p-2 rounded-lg bg-gray-100">{icon}</div>
        <div>
          <p className="font-medium">{title}</p>
          <p className="text-sm text-gray-500">{desc}</p>
        </div>
      </div>

      <button className="px-4 py-2 text-sm rounded-lg border hover:bg-gray-50">
        {action}
      </button>
    </div>
  );
}
