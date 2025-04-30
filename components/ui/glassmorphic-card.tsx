"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"

interface GlassmorphicCardProps {
  title: string
  description: string
  status?: string
  icon?: ReactNode
  gradient?: string
}

export default function GlassmorphicCard({
  title,
  description,
  status,
  icon,
  gradient = "from-purple-500 to-blue-500",
}: GlassmorphicCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="relative overflow-hidden rounded-lg border border-white/10 backdrop-blur-md bg-white/5 p-6 group h-full"
    >
      {/* Gradient overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
      />

      {/* Content */}
      <div className="relative z-10">
        {icon && <div className="mb-4 text-white/80 group-hover:text-white transition-colors">{icon}</div>}

        <h3 className="text-xl font-bold mb-4 group-hover:text-white transition-colors">{title}</h3>
        <p className="text-white/70 mb-6 group-hover:text-white/90 transition-colors">{description}</p>

        {status && (
          <div className="inline-block px-3 py-1 bg-white/10 rounded text-xs uppercase tracking-widest">{status}</div>
        )}
      </div>

      {/* Animated border */}
      <div className="absolute inset-0 border border-purple-500/30 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Corner accent */}
      <div className="absolute -top-1 -right-1 w-16 h-16 bg-gradient-to-br from-transparent to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform rotate-45" />
    </motion.div>
  )
}
