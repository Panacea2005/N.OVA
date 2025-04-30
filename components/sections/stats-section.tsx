"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef, useState, useEffect } from "react"

export default function StatsSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const stats = [
    { label: "Processing Power", value: 42, unit: "PFLOPS", decimal: false },
    { label: "Global Nodes", value: 1287, unit: "", decimal: false },
    { label: "Response Time", value: 0.042, unit: "ms", decimal: true },
    { label: "Uptime", value: 99.999, unit: "%", decimal: true },
  ]

  return (
    <section className="relative py-24">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-950/20 to-blue-950/20" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div ref={ref} className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center p-6 backdrop-blur-md bg-white/5 rounded-lg border border-white/10"
            >
              <div className="flex flex-col items-center">
                <CountingNumber value={stat.value} isInView={isInView} decimal={stat.decimal} duration={2} />
                <span className="text-2xl font-bold text-purple-300">{stat.unit}</span>
                <h4 className="text-sm uppercase tracking-widest text-white/60 mt-2">{stat.label}</h4>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

interface CountingNumberProps {
  value: number
  isInView: boolean
  decimal?: boolean
  duration?: number
}

function CountingNumber({ value, isInView, decimal = false, duration = 2 }: CountingNumberProps) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!isInView) return

    let start = 0
    const end = value
    const totalFrames = Math.floor(duration * 60)
    const increment = end / totalFrames

    const counter = setInterval(() => {
      start += increment
      if (start >= end) {
        setCount(end)
        clearInterval(counter)
      } else {
        setCount(start)
      }
    }, 1000 / 60)

    return () => clearInterval(counter)
  }, [isInView, value, duration])

  return <span className="text-5xl md:text-6xl font-bold">{decimal ? count.toFixed(3) : Math.floor(count)}</span>
}
