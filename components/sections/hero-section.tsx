"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Canvas } from "@react-three/fiber"
import { Environment } from "@react-three/drei"
import dynamic from "next/dynamic"
import GradientButton from "@/components/ui/gradient-button"
import { ArrowDown } from "lucide-react"

const HolographicSphere = dynamic(() => import("@/components/3d/holographic-sphere"), {
  ssr: false,
})

const ParticleText = dynamic(() => import("@/components/3d/particle-text"), {
  ssr: false,
})

export default function HeroSection() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  })

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "40%"])
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.8])

  return (
    <motion.section
      ref={ref}
      id="hero"
      className="min-h-screen flex flex-col justify-center items-center relative py-20"
      style={{ opacity, y, scale }}
    >
      {/* Hero Content */}
      <div className="container mx-auto px-4 md:px-6 z-10 relative">
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-4"
          >
            <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs uppercase tracking-widest">
              Sovereign Intelligence
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="text-7xl md:text-9xl font-bold tracking-tighter mb-6"
          >
            NOVA
          </motion.h1>

          <div className="h-[40vh] w-full mb-8 relative">
            <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
              <ParticleText text="SOVEREIGN SUPER AI" />
              <Environment preset="night" />
            </Canvas>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.8 }}
            className="text-xl md:text-2xl text-white/70 max-w-2xl mx-auto mb-12"
          >
            Pushing the boundaries of digital experiences through innovative design and sovereign intelligence
            technology.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3, duration: 0.8 }}
            className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6"
          >
            <GradientButton size="lg">Explore Universe</GradientButton>

            <button className="group flex items-center text-lg font-medium">
              <span className="relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-white after:origin-left after:scale-x-0 group-hover:after:scale-x-100 after:transition-transform after:duration-300">
                Learn More
              </span>
              <ArrowDown className="ml-2 h-5 w-5 transform group-hover:translate-y-1 transition-transform" />
            </button>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7, y: [0, 10, 0] }}
        transition={{
          opacity: { delay: 1.5, duration: 1 },
          y: { repeat: Number.POSITIVE_INFINITY, duration: 2, ease: "easeInOut" },
        }}
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center"
      >
        <span className="text-xs uppercase tracking-widest mb-2">Scroll to Explore</span>
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </motion.div>
    </motion.section>
  )
}
