"use client";

import { useRouter } from "next/navigation";

export default function QuickActions() {
  const router = useRouter();

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
      <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => router.push("/list/attendance")}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm"
        >
          Mark Attendance
        </button>

        <button
          onClick={() => router.push("/list/assignments")}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm"
        >
          Add Assignment
        </button>

        <button
          onClick={() => router.push("/list/announcements")}
          className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition text-sm"
        >
          Add Announcement
        </button>
      </div>
    </div>
  );
}