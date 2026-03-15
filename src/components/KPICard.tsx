"use client";

import CountUp from "react-countup";
import { ArrowUpRight, MoreHorizontal } from "lucide-react";

interface KPICardProps {
  year?: string;
  title: string;
  value: number;
  prefix?: string;
  icon: React.ReactNode;
  color: string;
  bg?: string;
  trend?: number;
  className?: string;
}

export default function KPICard({
  year = "2025/26",
  title,
  value,
  prefix = "",
  icon,
  color,
  bg = "bg-white",
  trend,
  className = "",
}: KPICardProps) {
  return (
    <div
      className={`
    relative
    rounded-2xl
    p-4
    h-[120px]
    border border-gray-200
    shadow-sm
    flex flex-col justify-between
    transition-all duration-300
    hover:-translate-y-1 hover:shadow-lg
    ${bg}
    ${className}
  `}
    >
      {/* ROW 1 : YEAR + OPTIONS */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-gray-400">{year}</span>

        <MoreHorizontal
          size={16}
          className="text-gray-400 hover:text-gray-600 cursor-pointer"
        />
      </div>

      {/* ROW 2 : ICON + TITLE */}
      <div className="flex items-center gap-0">
        <span className="text-xs font-medium text-gray-600">{title}</span>
        <div
          className={`w-6 h-6 flex items-center justify-center rounded-lg ${color}`}
        >
          {icon}
        </div>
      </div>

      {/* ROW 3 : VALUE + TREND */}
      <div className="flex items-baseline justify-between">
        <div className="flex items-baseline gap-0.5">
          {prefix && (
            <span className={`text-sm font-semibold ${color}`}>{prefix}</span>
          )}

          <span className={`text-base mt-0.5 font-semibold ${color}`}>
            <CountUp end={value} duration={1.3} separator="," />
          </span>
        </div>

        {trend && (
          <div className="flex items-center text-xs font-semibold text-emerald-600">
            <ArrowUpRight size={12} className="mr-1" />
            {trend}%
          </div>
        )}
      </div>
    </div>
  );
}
