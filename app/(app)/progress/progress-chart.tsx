"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface Point {
  label: string;
  계획: number;
  실적: number | null;
}

export default function ProgressChart({ data }: { data: Point[] }) {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, left: -12, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e5eb" />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} />
          <YAxis
            tick={{ fontSize: 12 }}
            unit="%"
            domain={[0, 100]}
          />
          <Tooltip formatter={(value) => `${value}%`} />
          <Legend />
          <Line
            type="monotone"
            dataKey="계획"
            stroke="#c8a45c"
            strokeWidth={2}
            strokeDasharray="5 4"
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="실적"
            stroke="#0f2f5f"
            strokeWidth={2.5}
            dot={{ r: 3 }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
