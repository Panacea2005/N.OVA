"use client"

import { motion, useScroll } from "framer-motion"

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll()

  return (
    <motion.div
      className="fixed left-0 right-0 top-0 h-1 bg-gradient-to-r from-purple-600 via-blue-500 to-purple-600 origin-left z-50"
      style={{ scaleX: scrollYProgress, backgroundSize: "200% 100%" }}
      animate={{
        backgroundPosition: ["0% 0%", "100% 0%"],
      }}
      transition={{
        duration: 5,
        repeat: Number.POSITIVE_INFINITY,
        repeatType: "reverse",
      }}
    />
  )
}
