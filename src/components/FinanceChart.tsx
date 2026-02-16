"use client";

import Image from "next/image";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export type FinanceChartData = {
  name: string;
  income: number;
  expense: number;
};

type FinanceChartProps = {
  data?: FinanceChartData[];
};

const fallbackData: FinanceChartData[] = [
  { name: "Jan", income: 4000, expense: 2400 },
  { name: "Feb", income: 3000, expense: 1398 },
  { name: "Mar", income: 2000, expense: 9800 },
  { name: "Apr", income: 2780, expense: 3908 },
  { name: "May", income: 1890, expense: 4800 },
  { name: "Jun", income: 2390, expense: 3800 },
  { name: "Jul", income: 3490, expense: 4300 },
  { name: "Aug", income: 3490, expense: 4300 },
  { name: "Sep", income: 3490, expense: 4300 },
  { name: "Oct", income: 3490, expense: 4300 },
  { name: "Nov", income: 3490, expense: 4300 },
  { name: "Dec", income: 3490, expense: 4300 },
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
          Finance
        </h1>
        <Image src="/moreDark.png" alt="" width={18} height={18} />
      </div>

      {/* CHART WRAPPER (KEY FIX) */}
      <div className="w-full h-[280px] sm:h-[360px] lg:h-[420px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{
              top: 10,
              right: 30,
              left: 0,
              bottom: 30, // ✅ critical fix
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#E5E7EB"
            />

            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9CA3AF", fontSize: 12 }}
              tickMargin={10}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9CA3AF", fontSize: 12 }}
              tickMargin={10}
            />

            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #E5E7EB",
                fontSize: 12,
              }}
            />

            <Legend
              verticalAlign="top"
              height={36} // ✅ reserves space explicitly
              iconType="circle"
            />

            <Line
              type="monotone"
              dataKey="income"
              stroke="#7DD3FC" // sky-300
              strokeWidth={3}
              dot={false}
            />

            <Line
              type="monotone"
              dataKey="expense"
              stroke="#FDA4AF" // purple-300
              strokeWidth={3}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
