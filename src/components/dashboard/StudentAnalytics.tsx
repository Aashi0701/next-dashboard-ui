"use client";

export default function StudentAnalytics({ data }: any) {

  // 🔥 GROUP DATA PER STUDENT
  const map: Record<
    string,
    { name: string; present: number; total: number }
  > = {};

  data.forEach((r: any) => {
    const id = r.studentId;

    if (!map[id]) {
      map[id] = {
        name: r.student?.name || "",
        present: 0,
        total: 0,
      };
    }

    map[id].total++;

    if (r.status === "present") {
      map[id].present++;
    }
  });

  const students = Object.values(map).map((s) => ({
    ...s,
    percentage:
      s.total === 0 ? 0 : Math.round((s.present / s.total) * 100),
  }));

  return (
    <div className="bg-white border rounded-2xl p-5 shadow-sm">
      <h2 className="text-lg font-semibold mb-4">
        Student Attendance Insights
      </h2>

      <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto">
        {students.map((s, i) => (
          <div key={i}>
            <div className="flex justify-between text-sm mb-1">
              <span>{s.name}</span>
              <span>{s.percentage}%</span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  s.percentage > 75
                    ? "bg-green-500"
                    : s.percentage > 50
                    ? "bg-yellow-400"
                    : "bg-red-500"
                }`}
                style={{ width: `${s.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}