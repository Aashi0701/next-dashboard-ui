"use client";

import { useEffect, useState } from "react";
import CountUp from "react-countup";
import { Users, CheckCircle2, AlertTriangle } from "lucide-react";

type ClassStat = {
  className: string;
  percentage: number;
};

type Props = {
  totalClasses: number;
  classWiseStats: ClassStat[];
  lowStudents: number;
};

export default function DashboardKPIs({
  totalClasses,
  classWiseStats,
  lowStudents,
}: Props) {
  const [visibleIndex, setVisibleIndex] = useState(0);
  const [prevStats, setPrevStats] = useState(classWiseStats);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleIndex((prev) => {
        if (prev >= classWiseStats.length + 2) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 120);

    return () => clearInterval(interval);
  }, [classWiseStats.length]);

  useEffect(() => {
    setPrevStats(classWiseStats);
  }, [classWiseStats]);

  const baseCards = [
    {
      label: "My Classes",
      value: totalClasses,
      icon: <Users size={18} />,
      color: "text-indigo-600",
      subtext: "Total Classes",
    },
    {
      label: "Low Attendance",
      value: lowStudents,
      icon: <AlertTriangle size={18} />,
      color: "text-red-600",
      subtext: "Students Below Threshold",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* BASE CARDS */}
      {baseCards.map((card, i) => (
        <div
          key={card.label}
          className={`bg-white border rounded-2xl p-4 shadow-sm transition-all ${
            visibleIndex >= i
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4"
          }`}
        >
          {/* 🔹 ROW 1 */}
          <div className={`flex items-center gap-2 ${card.color}`}>
            {card.icon}
            <span className="text-sm font-medium">{card.label}</span>
          </div>

          {/* 🔹 ROW 2 */}
          <div className="mt-3 text-2xl font-semibold">
            <CountUp end={card.value} duration={1} />
          </div>

          {/* 🔹 ROW 3 */}
          <div className="mt-1 text-xs text-gray-500">
            {card.subtext}
          </div>
        </div>
      ))}

      {/* CLASS-WISE CARDS */}
      {classWiseStats.map((cls, i) => {
        const prev =
          prevStats.find((p) => p.className === cls.className)
            ?.percentage || 0;

        const isIncrease = cls.percentage >= prev;

        return (
          <div
            key={cls.className}
            className={`bg-white border rounded-2xl p-4 shadow-sm transition-all ${
              visibleIndex >= i + baseCards.length
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            {/* 🔹 ROW 1 */}
            <div className="flex items-center gap-2 text-gray-700">
              <CheckCircle2
                size={18}
                className={isIncrease ? "text-green-500" : "text-red-500"}
              />
              <span className="text-sm font-medium">
                {cls.className}
              </span>
            </div>

            {/* 🔹 ROW 2 */}
            <div className="mt-3 text-2xl font-semibold">
              <CountUp
                start={prev}
                end={cls.percentage}
                duration={1}
                suffix="%"
              />
            </div>

            {/* 🔹 PROGRESS */}
            <div className="mt-2 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-700 ${
                  cls.percentage >= 75
                    ? "bg-green-500"
                    : cls.percentage >= 50
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
                style={{ width: `${cls.percentage}%` }}
              />
            </div>

            {/* 🔹 ROW 3 */}
            <div className="mt-1 text-xs text-gray-500">
              Weekly Attendance
            </div>
          </div>
        );
      })}
    </div>
  );
}