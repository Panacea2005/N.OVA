"use client"

import { useEffect, useState, useRef } from "react"
import { motion } from "framer-motion"
import { Canvas } from "@react-three/fiber"
import { SpotLight } from "@react-three/drei"
import dynamic from "next/dynamic"

const HolographicSphere = dynamic(() => import("@/components/3d/holographic-sphere"), {
  ssr: false,
})

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0)
  const [loadingText, setLoadingText] = useState("Initializing")
  const [loadingPhase, setLoadingPhase] = useState(0)
  const canvasRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 0.8
      })
    }, 25)

    const textInterval = setInterval(() => {
      setLoadingText((prev) => {
        const texts = [
          "Initializing Quantum Core",
          "Calibrating Neural Interface",
          "Establishing Secure Connection",
          "Loading Virtual Environment",
          "Synchronizing Data Streams",
          "Optimizing Rendering Pipeline",
          "Activating Holographic Display",
        ]
        const currentIndex = texts.indexOf(prev)
        return texts[(currentIndex + 1) % texts.length]
      })
    }, 1200)

    const phaseInterval = setInterval(() => {
      setLoadingPhase((prev) => (prev + 1) % 4)
    }, 3000)

    return () => {
      clearInterval(interval)
      clearInterval(textInterval)
      clearInterval(phaseInterval)
    }
  }, [])

  const progressVariants = {
    initial: { pathLength: 0, opacity: 0 },
    animate: {
      pathLength: progress / 100,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeInOut" },
    },
  }

  return (
    <motion.div
      className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center overflow-hidden"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.2, ease: "easeInOut" }}
    >
      {/* Background grid lines */}
      <div className="absolute inset-0 grid-lines opacity-20"></div>

      {/* Animated particles */}
      <div className="absolute inset-0 opacity-30">
        {Array.from({ length: 100 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-purple-500 rounded-full"
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
              opacity: Math.random() * 0.5 + 0.3,
              scale: Math.random() * 0.5 + 0.5,
            }}
            animate={{
              y: [null, Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800)],
              opacity: [null, Math.random() * 0.8],
              scale: [null, Math.random() * 1 + 0.5],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
            }}
          />
        ))}
      </div>

      {/* 3D Holographic Sphere - REFINED VERSION */}
      <div 
        className="absolute inset-0 z-10" 
        ref={canvasRef}
        style={{
          opacity: 0.8,
          mixBlendMode: "screen"
        }}
      >
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
          <ambientLight intensity={0.4} />
          <spotLight 
            position={[10, 10, 10]} 
            angle={0.15} 
            penumbra={1} 
            intensity={0.5} 
            castShadow
          />
          <HolographicSphere />
        </Canvas>
      </div>

      {/* Central loading indicator */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="relative mb-20 z-20"
      >
        <svg width="180" height="180" viewBox="0 0 180 180" className="transform rotate-90">
          {/* Outer circle */}
          <motion.circle
            cx="90"
            cy="90"
            r="80"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="2"
            fill="none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
          />

          {/* Progress circle */}
          <motion.circle
            cx="90"
            cy="90"
            r="80"
            stroke="url(#gradient)"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
            variants={progressVariants}
            initial="initial"
            animate="animate"
          />

          {/* Inner circle */}
          <motion.circle
            cx="90"
            cy="90"
            r="70"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="1"
            fill="none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 1 }}
          />

          {/* Decorative elements */}
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.line
              key={i}
              x1="90"
              y1="10"
              x2="90"
              y2="20"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="2"
              transform={`rotate(${i * 30} 90 90)`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 + i * 0.05, duration: 0.5 }}
            />
          ))}

          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%" gradientUnits="userSpaceOnUse">
              <stop stopColor="#8B5CF6" />
              <stop offset="0.5" stopColor="#3B82F6" />
              <stop offset="1" stopColor="#EC4899" />
            </linearGradient>
          </defs>
        </svg>

        {/* Percentage display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {Math.floor(progress)}%
          </motion.span>

          {/* Animated dots */}
          <motion.div
            className="flex space-x-1 mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            {Array.from({ length: 4 }).map((_, i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-blue-500"
                animate={{
                  opacity: loadingPhase === i ? 1 : 0.3,
                  scale: loadingPhase === i ? 1.2 : 1,
                }}
                transition={{ duration: 0.3 }}
              />
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Loading text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="text-center z-20 relative"
      >
        <motion.h1
          className="text-6xl font-bold mb-6 tracking-tighter"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          NOVA
        </motion.h1>

        <motion.div
          className="relative h-8 overflow-hidden"
          initial={{ width: 0 }}
          animate={{ width: "auto" }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          <motion.p
            className="text-sm uppercase tracking-widest text-white/80 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          >
            {loadingText}
          </motion.p>
        </motion.div>
      </motion.div>

      {/* Bottom text */}
      <motion.div
        className="absolute bottom-12 left-0 right-0 flex justify-center z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 1, duration: 0.8 }}
      >
        <div className="text-xs text-center max-w-xs">
          <p className="uppercase tracking-widest">SOVEREIGN INTELLIGENCE</p>
          <p className="mt-2 text-white/40 text-[10px]">VERSION 2.0.4 ALPHA</p>
        </div>
      </motion.div>

      {/* Corner decorations */}
      <div className="absolute top-8 left-8 w-16 h-16 border-l-2 border-t-2 border-white/20 z-20"></div>
      <div className="absolute top-8 right-8 w-16 h-16 border-r-2 border-t-2 border-white/20 z-20"></div>
      <div className="absolute bottom-8 left-8 w-16 h-16 border-l-2 border-b-2 border-white/20 z-20"></div>
      <div className="absolute bottom-8 right-8 w-16 h-16 border-r-2 border-b-2 border-white/20 z-20"></div>

      {/* Additional CSS for grid lines */}
      <style jsx global>{`
        .grid-lines {
          background-image: linear-gradient(to right, rgba(139, 92, 246, 0.1) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(139, 92, 246, 0.1) 1px, transparent 1px);
          background-size: 40px 40px;
        }
      `}</style>
    </motion.div>
  )
}