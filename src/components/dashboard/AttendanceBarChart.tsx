"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useEffect, useState } from "react";

export default function AttendanceBarChart() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/attendance/analytics")
      .then((res) => res.json())
      .then(setData);
  }, []);

  return (
    <div className="bg-white border rounded-2xl p-5 shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Class Comparison</h2>

      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <XAxis dataKey="class" />
          <YAxis />
          <Tooltip />

          <Bar
            dataKey="percentage"
            fill="url(#colorGradient)"
            radius={[8, 8, 0, 0]}
          />

          <defs>
            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity={1} />
              <stop offset="100%" stopColor="#c4b5fd" stopOpacity={0.6} />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
