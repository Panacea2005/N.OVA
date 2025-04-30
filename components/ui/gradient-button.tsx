"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface GradientButtonProps {
  children: ReactNode
  className?: string
  size?: "default" | "sm" | "lg"
  onClick?: () => void
}

export default function GradientButton({ children, className, size = "default", onClick }: GradientButtonProps) {
  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    default: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn("relative group overflow-hidden rounded-full font-medium", sizeClasses[size], className)}
      onClick={onClick}
    >
      {/* Background gradient */}
      <span className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-500 group-hover:from-purple-500 group-hover:to-blue-400 transition-colors duration-300" />

      {/* Shine effect */}
      <span className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-gradient-to-r from-transparent via-white to-transparent -translate-x-full group-hover:translate-x-full transition-all duration-1000 ease-out" />

      {/* Border */}
      <span className="absolute inset-0 rounded-full border border-white/20" />

      {/* Content */}
      <span className="relative z-10 flex items-center justify-center">{children}</span>
    </motion.button>
  )
}
