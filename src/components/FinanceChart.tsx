"use client";

import Image from "next/image";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export type FinanceChartData = {
  month: string;
  fees: number;
};

type FinanceChartProps = {
  data?: FinanceChartData[];
};

const fallbackData: FinanceChartData[] = [
  { month: "Jan", fees: 12000 },
  { month: "Feb", fees: 18000 },
  { month: "Mar", fees: 9000 },
  { month: "Apr", fees: 15000 },
  { month: "May", fees: 13000 },
  { month: "Jun", fees: 20000 },
  { month: "Jul", fees: 17000 },
  { month: "Aug", fees: 16000 },
  { month: "Sep", fees: 14000 },
  { month: "Oct", fees: 21000 },
  { month: "Nov", fees: 19000 },
  { month: "Dec", fees: 23000 },
];

export default function FinanceChart({ data }: FinanceChartProps) {
  const chartData = data?.length ? data : fallbackData;

  return (
    <div
      className="
        bg-white rounded-2xl
        w-full
        px-4 py-4
        shadow-sm border border-slate-100
      "
    >
      {/* HEADER */}
      <div className="flex justify-between items-center mb-3">
        <h1 className="text-sm font-semibold text-gray-800 tracking-wide">
          Fee Collection
        </h1>

        <Image src="/moreDark.png" alt="" width={18} height={18} />
      </div>

      {/* CHART */}
      <div className="w-full h-[220px] sm:h-[240px] lg:h-[270px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{
              top: 10,
              right: 30,
              left: 0,
              bottom: 30,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />

            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9CA3AF", fontSize: 12 }}
              tickMargin={10}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9CA3AF", fontSize: 12 }}
              tickFormatter={(v) => `₹${Number(v)/1000}k`}
            />

            <Tooltip
              formatter={(value) => `₹ ${Number(value).toLocaleString()}`}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #E5E7EB",
                fontSize: 12,
              }}
            />

            <Line
              type="monotone"
              dataKey="fees"
              stroke="#10B981"
              strokeWidth={3}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}