// components/mobile/AttendanceCard.tsx
"use client";

export default function AttendanceCard({
  item,
  actions,
}: {
  item: {
    student: string;
    class: string;
    date: string;
    status: "Present" | "Absent";
  };
  actions?: React.ReactNode;
}) {
  return (
    <div className="bg-white border rounded-lg px-3 py-2 shadow-sm">
      {/* TOP ROW */}
      <div className="flex justify-between items-center">
        <p className="font-medium text-sm truncate">
          {item.student}
        </p>

        <span
          className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
            item.status === "Present"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {item.status}
        </span>
      </div>

      {/* BOTTOM ROW */}
      <div className="flex justify-between items-center mt-1">
        <p className="text-xs text-gray-500 truncate">
          {item.class} • {item.date}
        </p>

        {actions}
      </div>
    </div>
  );
}
