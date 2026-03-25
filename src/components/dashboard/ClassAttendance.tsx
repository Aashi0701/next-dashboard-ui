"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ClassAttendance({
  classes,
  attendanceToday,
  attendanceWeek,
}: any) {
  const router = useRouter();

  const [selectedClass, setSelectedClass] = useState(classes[0]);
  const [localAttendance, setLocalAttendance] = useState<
    Record<string, string>
  >({});

  // 🔐 LOCK (IST)
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    fetch("/api/attendance/lock-status", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => setLocked(data.locked));
  }, []);

  // ✅ MERGE DATA
  const attendanceMap = useMemo(() => {
    const map: Record<string, string> = {};

    attendanceToday.forEach((a: any) => {
      map[a.studentId] = a.status;
    });

    Object.assign(map, localAttendance);

    return map;
  }, [attendanceToday, localAttendance]);

  const setStatus = async (studentId: string, status: string) => {
    if (locked) return;

    setLocalAttendance((prev) => ({
      ...prev,
      [studentId]: status,
    }));

    try {
      await fetch("/api/attendance/class", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ studentId, status }),
      });

      router.refresh();
    } catch (err) {
      console.error("Failed");
    }
  };

  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri"];

  const weekMap = useMemo(() => {
    const map: Record<string, any[]> = {};

    attendanceWeek.forEach((a: any) => {
      const date = new Date(a.date);
      const day = date.getDay(); // 0=Sun

      // Convert to Mon-Fri index
      const index = day === 0 ? -1 : day - 1;

      if (index < 0 || index > 4) return;

      if (!map[a.studentId]) {
        map[a.studentId] = Array(5).fill(null);
      }

      map[a.studentId][index] = {
        status: a.status,
      };
    });

    return map;
  }, [attendanceWeek]);

  return (
    <div className="bg-white border rounded-2xl p-5 shadow-sm">
      {/* CLASS TABS */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {classes.map((cls: any) => (
          <button
            key={cls.id}
            onClick={() => setSelectedClass(cls)}
            className={`px-3 py-1 rounded-lg text-sm ${
              selectedClass.id === cls.id
                ? "bg-purple-600 text-white"
                : "bg-gray-100"
            }`}
          >
            {cls.name}
          </button>
        ))}
      </div>

      {/* LOCK MESSAGE */}
      {locked && (
        <div className="mb-3 text-xs text-red-500">
          Attendance locked after 4 PM. Contact admin for changes.
        </div>
      )}

      {/* TABLE */}
      <div className="border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left p-3">Student</th>
              <th className="text-center p-3">Week</th>
              <th className="text-right p-3">Status</th>
            </tr>
          </thead>

          <tbody>
            {selectedClass.students.map((s: any) => {
              const currentStatus = attendanceMap[s.id];
              const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri"];

              return (
                <tr key={s.id} className="border-t hover:bg-gray-50">
                  {/* STUDENT */}
                  <td className="p-3 font-medium">{s.name}</td>

                  {/* 🔥 WEEK COLUMN */}
                  <td className="p-3">
                    <div className="flex flex-col items-center">
                      {/* DOTS */}
                      <div className="flex gap-1">
                        {weekDays.map((day, idx) => {
                          const status = weekMap[s.id]?.[idx]?.status;

                          return (
                            <div
                              key={day}
                              className={`w-4 h-4 rounded-full ${
                                status === "present"
                                  ? "bg-green-500"
                                  : status === "absent"
                                    ? "bg-red-500"
                                    : "bg-gray-200"
                              }`}
                              title={`${day} - ${status || "Not Marked"}`}
                            />
                          );
                        })}
                      </div>

                      {/* OPTIONAL DAY LABELS (tiny) */}
                      <div className="flex gap-1 mt-1 text-[10px] text-gray-400">
                        {weekDays.map((d) => (
                          <span key={d} className="w-4 text-center">
                            {d[0]}
                          </span>
                        ))}
                      </div>
                    </div>
                  </td>

                  {/* STATUS */}
                  <td className="p-3 text-right">
                    <div className="inline-flex rounded-lg border overflow-hidden">
                      <button
                        disabled={locked}
                        onClick={() => setStatus(s.id, "present")}
                        className={`px-3 py-1 text-xs ${
                          locked
                            ? "bg-gray-200 cursor-not-allowed"
                            : currentStatus === "present"
                              ? "bg-green-600 text-white"
                              : "bg-white hover:bg-gray-100"
                        }`}
                      >
                        Present
                      </button>

                      <button
                        disabled={locked}
                        onClick={() => setStatus(s.id, "absent")}
                        className={`px-3 py-1 text-xs ${
                          locked
                            ? "bg-gray-200 cursor-not-allowed"
                            : currentStatus === "absent"
                              ? "bg-red-600 text-white"
                              : "bg-white hover:bg-gray-100"
                        }`}
                      >
                        Absent
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 🔥 LEGEND */}
      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          Present
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          Absent
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-gray-300" />
          Not Marked
        </div>
      </div>
    </div>
  );
}
