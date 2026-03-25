"use client";

import dayjs from "dayjs";

export default function AttendanceHeatmap({ data = [] }: any) {
  // 🔥 GROUP BY STUDENT → DATE
  const studentMap: Record<
    string,
    {
      name: string;
      dates: Record<string, { present: number; total: number }>;
    }
  > = {};

  data.forEach((r: any) => {
    const dateKey = dayjs(r.date).format("YYYY-MM-DD");

    if (!studentMap[r.studentId]) {
      studentMap[r.studentId] = {
        name:
          r.studentName || // if API sends flat name
          r.student?.name || // if nested object
          r.name || // fallback
          "Unknown Student", // final fallback
        dates: {},
      };
    }

    if (!studentMap[r.studentId].dates[dateKey]) {
      studentMap[r.studentId].dates[dateKey] = {
        present: 0,
        total: 0,
      };
    }

    studentMap[r.studentId].dates[dateKey].total++;

    if (r.status === "present") {
      studentMap[r.studentId].dates[dateKey].present++;
    }
  });

  const startOfMonth = dayjs().startOf("month");
  const endOfMonth = dayjs().endOf("month");

  // 🔥 COLOR SCALE
  const getColor = (status: string | null) => {
    if (!status) return "bg-gray-200";
    if (status === "Present") return "bg-green-500";
    if (status === "Absent") return "bg-red-500";
    return "bg-yellow-400"; // Partial
  };

  return (
    <div className="bg-white border rounded-2xl p-5 shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Student Attendance Heatmap</h2>

      {/* 🔥 SCROLLABLE LIST */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
        {Object.entries(studentMap).map(([studentId, student]) => {
          let current = startOfMonth;

          const days: any[] = [];

          while (current.isBefore(endOfMonth) || current.isSame(endOfMonth)) {
            const key = current.format("YYYY-MM-DD");
            const val = student.dates[key];

            const percentage = val
              ? Math.round((val.present / val.total) * 100)
              : null;

            // 🔥 derive status
            let status: string | null = null;

            if (val) {
              if (val.present === val.total) status = "Present";
              else if (val.present === 0) status = "Absent";
              else status = "Partial";
            }

            days.push({
              date: key,
              percentage,
              status,
            });

            current = current.add(1, "day");
          }

          // 🔥 MONTH AVG %
          const validDays = days.filter((d) => d.percentage !== null);

          const avg =
            validDays.length === 0
              ? 0
              : Math.round(
                  validDays.reduce((acc, d) => acc + d.percentage, 0) /
                    validDays.length,
                );

          return (
            <div key={studentId} className="flex items-center gap-5">
              {/* 🔹 LEFT: NAME */}
              <div className="w-32 text-sm font-medium truncate">
                {student.name}
              </div>

              {/* 🔹 CENTER: % */}
              <div className="w-14 text-xs text-gray-600">{avg}%</div>

              {/* 🔹 RIGHT: HEAT STRIP */}
              <div className="flex gap-[3px] flex-1">
                {days.map((d, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-sm transition ${getColor(
                      d.percentage,
                    )}`}
                    title={
                      d.percentage !== null
                        ? `${d.date} • ${d.status}`
                        : `${d.date} • No Data`
                    }
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* 🔥 LEGEND */}
      <div className="flex items-center gap-2 mt-4 text-xs text-gray-500">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 bg-gray-100 rounded" />
          <div className="w-3 h-3 bg-red-400 rounded" />
          <div className="w-3 h-3 bg-yellow-300 rounded" />
          <div className="w-3 h-3 bg-emerald-300 rounded" />
          <div className="w-3 h-3 bg-emerald-500 rounded" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
