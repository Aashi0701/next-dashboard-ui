"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useEffect, useState } from "react";

export default function AttendanceChart() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/attendance/analytics")
      .then((res) => res.json())
      .then(setData);
  }, []);

  return (
    <div className="bg-white border rounded-2xl p-5 shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Attendance Trends</h2>

      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="class" />
          <YAxis />
          <Tooltip />

          <Line
            type="monotone"
            dataKey="percentage"
            stroke="#7c3aed"
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
