"use client"

import { LineChart as Chart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface LineChartProps {
  data: Array<{
    date: string
    value: number
  }>
}

export default function LineChart({ data }: LineChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <Chart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
        <XAxis dataKey="date" stroke="rgba(255, 255, 255, 0.5)" tick={{ fill: "rgba(255, 255, 255, 0.5)" }} />
        <YAxis stroke="rgba(255, 255, 255, 0.5)" tick={{ fill: "rgba(255, 255, 255, 0.5)" }} />
        <Tooltip
          contentStyle={{
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            color: "white",
          }}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#8B5CF6"
          strokeWidth={2}
          dot={{ fill: "#8B5CF6", r: 4 }}
          activeDot={{ r: 6, fill: "#8B5CF6" }}
        />
      </Chart>
    </ResponsiveContainer>
  )
}
