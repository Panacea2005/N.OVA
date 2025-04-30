"use client"

import { PieChart as Chart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts"

interface PieChartProps {
  data: Array<{
    name: string
    value: number
  }>
}

export default function PieChart({ data }: PieChartProps) {
  const COLORS = ["#8B5CF6", "#3B82F6", "#EC4899", "#10B981", "#F59E0B"]

  return (
    <ResponsiveContainer width="100%" height="100%">
      <Chart>
        <Pie data={data} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value">
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            color: "white",
          }}
        />
        <Legend formatter={(value) => <span style={{ color: "rgba(255, 255, 255, 0.8)" }}>{value}</span>} />
      </Chart>
    </ResponsiveContainer>
  )
}
