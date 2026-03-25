"use client";

import CountUp from "react-countup";

export default function DashboardCard({
  icon,
  label,
  value,
  color,
  suffix = "",
}: any) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex flex-col gap-2">
      <div className={`flex items-center gap-2 ${color}`}>
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>

      <span className="text-2xl font-semibold text-gray-900">
        <CountUp end={value} duration={1.3} />
        {suffix}
      </span>
    </div>
  );
}