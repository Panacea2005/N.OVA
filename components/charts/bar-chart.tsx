"use client"

import { BarChart as Chart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface BarChartProps {
  data: Array<{
    name: string
    value: number
  }>
}

export default function BarChart({ data }: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <Chart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
        <XAxis dataKey="name" stroke="rgba(255, 255, 255, 0.5)" tick={{ fill: "rgba(255, 255, 255, 0.5)" }} />
        <YAxis stroke="rgba(255, 255, 255, 0.5)" tick={{ fill: "rgba(255, 255, 255, 0.5)" }} />
        <Tooltip
          contentStyle={{
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            color: "white",
          }}
        />
        <Bar dataKey="value" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
      </Chart>
    </ResponsiveContainer>
  )
}
