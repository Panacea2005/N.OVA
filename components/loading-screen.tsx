"use client"

import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Canvas } from "@react-three/fiber"
import { Environment } from "@react-three/drei"
import dynamic from "next/dynamic"

const HolographicSphere = dynamic(() => import("@/components/3d/holographic-sphere"), {
  ssr: false,
})

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0)
  const [currentPhase, setCurrentPhase] = useState(0)
  const [loadingComplete, setLoadingComplete] = useState(false)
  const [showEnterButton, setShowEnterButton] = useState(false)
  const [dataStreams, setDataStreams] = useState<string[]>([])
  const [loadingSpeed, setLoadingSpeed] = useState(1) // Controls loading speed
  const [finalAnimation, setFinalAnimation] = useState(false)
  const canvasRef = useRef<HTMLDivElement>(null)
  const streamRef = useRef<HTMLDivElement>(null)
  
  // Progress slowdown points (to create dramatic pauses)
  const slowdownPoints = [19, 39, 59, 84, 95]

  // Loading phases with text and percentage ranges
  const loadingPhases = [
    { 
      name: "Initializing Quantum Core", 
      subtext: "Establishing secure connection protocol", 
      range: [0, 20] 
    },
    { 
      name: "Calibrating Neural Interface", 
      subtext: "Syncing biometric sensors", 
      range: [20, 40] 
    },
    { 
      name: "Establishing Blockchain Nodes", 
      subtext: "Validating sovereign identity", 
      range: [40, 60] 
    },
    { 
      name: "Synchronizing Data Matrices", 
      subtext: "Optimizing parallel processing", 
      range: [60, 85] 
    },
    { 
      name: "Activating Sovereign Intelligence", 
      subtext: "Preparing interface for neural link", 
      range: [85, 100] 
    }
  ]

  // Technical terms for the data stream animation
  const techTerms = [
    "quantum", "neural", "blockchain", "encryption", "algorithm",
    "matrix", "protocol", "interface", "vector", "tensor",
    "hash", "node", "shard", "cluster", "core", "cache",
    "async", "kernel", "buffer", "token", "cipher", "proxy"
  ]

  // Simulated technical data streams
  const generateStreamMessage = () => {
    const messages = [
      "Initializing quantum processor array...",
      "Neural network connection established",
      "Activating biometric authentication...",
      "Loading personality matrix v4.0.7...",
      "Blockchain verification complete",
      "Establishing P2P encrypted channels...",
      "Memory shard synchronization in progress",
      "Loading contextual awareness module...",
      "AI sovereignty protocol active",
      "Quantum encryption layers initialized...",
      "Loading language processing cores...",
      "Activating virtual neural interface",
      "Cognitive enhancement modules online...",
      "System security protocols enabled",
      "Initializing holographic projection...",
      "Loading ethical decision framework",
      "Decentralized network connections secure...",
      "Knowledge base synchronization complete",
      "Activating creative matrix algorithms...",
      "Emotional intelligence modules calibrated"
    ]
    
    if (progress > 95) {
      // Special messages for final loading stage
      return [
        "Final system checks in progress...",
        "Optimizing neural pathways...",
        "Activating sovereign intelligence core...",
        "Holographic interface ready...",
        "System initialization almost complete...",
        "NOVA activation sequence initiated...",
        "Preparing for user interaction...",
        `All ${techTerms[Math.floor(Math.random() * techTerms.length)]} systems nominal`,
        "Sovereign AI protocols active and stable",
        "Entering final activation phase..."
      ][Math.floor(Math.random() * 10)]
    }
    
    return messages[Math.floor(Math.random() * messages.length)]
  }

  // Final completion sequence messages
  const completionMessages = [
    "System initialization complete",
    "All core systems online",
    "Neural links established",
    "NOVA online and operational",
    "Sovereign intelligence activated",
    "Connection successful"
  ]

  // Progress calculation and animations
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    // Progress animation with variable speed
    if (!loadingComplete) {
      interval = setInterval(() => {
        setProgress((prev) => {
          // Check if we're at a slowdown point
          if (slowdownPoints.includes(Math.floor(prev))) {
            setLoadingSpeed(0.2) // Slow down
            setTimeout(() => setLoadingSpeed(1), 1500) // Speed up after delay
          }
          
          // Accelerate progress near the end
          let increment = Math.random() * 0.7 + 0.3
          increment = increment * loadingSpeed
          
          // Special handling for 99-100% range
          if (prev >= 99 && prev < 100) {
            increment = 0.05 // Very slow at the end
          }
          
          const newProgress = Math.min(prev + increment, 100)
          
          // Check if we've reached 100%
          if (newProgress >= 100 && !loadingComplete) {
            clearInterval(interval)
            setLoadingComplete(true)
            
            // Trigger final animation sequence
            setTimeout(() => {
              setFinalAnimation(true)
              
              // Add completion messages with delays
              completionMessages.forEach((msg, index) => {
                setTimeout(() => {
                  setDataStreams(prev => [...prev, msg])
                  // Auto-scroll to bottom of stream container
                  if (streamRef.current) {
                    streamRef.current.scrollTop = streamRef.current.scrollHeight
                  }
                  
                  // Show enter button after all messages
                  if (index === completionMessages.length - 1) {
                    setTimeout(() => setShowEnterButton(true), 1000)
                  }
                }, 600 * (index + 1))
              })
            }, 500)
          }
          
          return newProgress
        })
      }, 80)
    }
    
    // Add data stream messages at random intervals
    const streamInterval = setInterval(() => {
      if (!loadingComplete) {
        const randomMessage = generateStreamMessage()
        setDataStreams(prev => {
          const newStreams = [...prev, randomMessage]
          // Keep only the last 10 messages
          return newStreams.slice(-10)
        })
        
        // Auto-scroll to bottom of stream container
        if (streamRef.current) {
          streamRef.current.scrollTop = streamRef.current.scrollHeight
        }
      }
    }, 1000)
    
    return () => {
      clearInterval(interval)
      clearInterval(streamInterval)
    }
  }, [loadingComplete, loadingSpeed])

  // Update current phase based on progress
  useEffect(() => {
    const phase = loadingPhases.findIndex(
      phase => progress >= phase.range[0] && progress <= phase.range[1]
    )
    if (phase !== -1 && phase !== currentPhase) {
      setCurrentPhase(phase)
    }
  }, [progress, currentPhase])

  // Custom progress indicator function
  const getProgressIndicator = (centerX: number, centerY: number, radius: number, progress: number) => {
    // Calculate the end point of the arc
    const angle = (progress / 100) * 360
    const angleInRadians = (angle - 90) * (Math.PI / 180)
    const endX = centerX + radius * Math.cos(angleInRadians)
    const endY = centerY + radius * Math.sin(angleInRadians)
    
    // Create the arc path
    const largeArcFlag = angle > 180 ? 1 : 0
    const pathData = [
      `M ${centerX} ${centerY - radius}`, // Start at top
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}` // Arc to the calculated point
    ].join(' ')
    
    return pathData
  }

  return (
    <motion.div
      className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.2, ease: "easeInOut" }}
    >
      {/* Enhanced Background with multiple layers */}
      <div className="absolute inset-0 z-0">
        {/* Grid layers with different scales */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'linear-gradient(to right, rgba(139, 92, 246, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(139, 92, 246, 0.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        ></div>
        
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'linear-gradient(to right, rgba(139, 92, 246, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(139, 92, 246, 0.1) 1px, transparent 1px)',
            backgroundSize: '10px 10px'
          }}
        ></div>
        
        {/* Radial gradient overlay */}
        <motion.div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at center, rgba(139, 92, 246, 0.15) 0%, rgba(0, 0, 0, 0) 70%)'
          }}
          animate={finalAnimation ? {
            background: [
              'radial-gradient(circle at center, rgba(139, 92, 246, 0.15) 0%, rgba(0, 0, 0, 0) 70%)',
              'radial-gradient(circle at center, rgba(139, 92, 246, 0.3) 0%, rgba(0, 0, 0, 0) 70%)',
              'radial-gradient(circle at center, rgba(139, 92, 246, 0.15) 0%, rgba(0, 0, 0, 0) 70%)'
            ]
          } : {}}
          transition={{ duration: 2, times: [0, 0.5, 1] }}
        ></motion.div>
      </div>
      
      {/* Animated scan lines */}
      <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none z-10">
        {Array(12).fill(0).map((_, i) => (
          <motion.div
            key={`scan-${i}`}
            className="absolute w-full h-[1px] bg-purple-400/30"
            style={{ top: `${i * 8}%` }}
            animate={{ 
              opacity: [0.1, 0.3, 0.1],
              scaleY: [1, 1.5, 1],
              x: ['-100%', '100%'] 
            }}
            transition={{
              duration: 8 + i % 4,
              repeat: Infinity,
              delay: i * 0.7,
            }}
          />
        ))}
        
        {/* Special scan effect at 100% */}
        <AnimatePresence>
          {finalAnimation && (
            <motion.div
              className="absolute inset-0 bg-purple-500/5"
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: [0, 0.2, 0],
              }}
              transition={{ duration: 3, times: [0, 0.1, 1] }}
              exit={{ opacity: 0 }}
            />
          )}
        </AnimatePresence>
      </div>
      
      {/* Enhanced floating particles with variety */}
      <div className="absolute inset-0 opacity-40 pointer-events-none z-10">
        {Array(40).fill(0).map((_, i) => {
          // Create different types of particles
          const isSmall = i % 2 === 0
          const isPurple = i % 5 === 0
          const isLine = i % 8 === 0
          
          return (
            <motion.div
              key={`particle-${i}`}
              className={`absolute ${isLine ? 'w-[3px] h-[1px]' : 'rounded-full'}`}
              style={{
                width: isLine ? '3px' : isSmall ? '1px' : '2px',
                height: isLine ? '1px' : isSmall ? '1px' : '2px',
                backgroundColor: isPurple ? 'rgba(139, 92, 246, 0.8)' : 'rgba(255, 255, 255, 0.7)',
                boxShadow: isPurple ? '0 0 4px rgba(139, 92, 246, 0.8)' : 'none',
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.5 + 0.3
              }}
              animate={finalAnimation ? {
                y: [0, -Math.random() * 200 - 50],
                x: [0, (Math.random() - 0.5) * 100],
                opacity: [0.3, Math.random() * 0.7 + 0.3, 0],
                scale: isSmall ? [1, 1] : [1, 1.5, 1]
              } : {
                y: [0, -Math.random() * 100 - 50],
                x: [0, (Math.random() - 0.5) * 50],
                opacity: [0.3, Math.random() * 0.7 + 0.3, 0.3],
                scale: isSmall ? [1, 1] : [1, 1.5, 1]
              }}
              transition={{
                duration: Math.random() * 4 + 3,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: "easeInOut"
              }}
            />
          )
        })}
        
        {/* Final animation particles burst */}
        <AnimatePresence>
          {finalAnimation && (
            <>
              {Array(30).fill(0).map((_, i) => (
                <motion.div
                  key={`burst-particle-${i}`}
                  className="absolute rounded-full"
                  style={{
                    width: `${Math.random() * 3 + 1}px`,
                    height: `${Math.random() * 3 + 1}px`,
                    backgroundColor: 'rgba(139, 92, 246, 0.8)',
                    boxShadow: '0 0 4px rgba(139, 92, 246, 0.8)',
                    left: '50%',
                    top: '50%',
                    x: '-50%',
                    y: '-50%',
                  }}
                  animate={{
                    x: [`-50%`, `calc(-50% + ${(Math.random() - 0.5) * 500}px)`],
                    y: [`-50%`, `calc(-50% + ${(Math.random() - 0.5) * 500}px)`],
                    opacity: [1, 0],
                    scale: [0, Math.random() * 3]
                  }}
                  transition={{
                    duration: Math.random() * 2 + 1,
                    ease: "easeOut"
                  }}
                  exit={{ opacity: 0 }}
                />
              ))}
            </>
          )}
        </AnimatePresence>
      </div>

      {/* 3D Holographic Sphere */}
      <div 
        className="absolute inset-0 z-10" 
        ref={canvasRef}
        style={{
          opacity: finalAnimation ? 1 : 0.9,
          mixBlendMode: "screen",
          transition: "opacity 2s ease-in-out"
        }}
      >
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
          <ambientLight intensity={0.4} />
          <HolographicSphere />
          <Environment preset="night" />
        </Canvas>
      </div>

      {/* Main Content Container */}
      <div className="relative z-20 w-full max-w-screen-lg mx-auto h-full flex flex-col items-center justify-center px-4">
        {/* Top Status Bar */}
        <motion.div 
          className="absolute top-8 left-0 right-0 flex justify-between items-center px-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <div className="flex items-center space-x-3">
            <div className="flex space-x-2">
              {Array(3).fill(0).map((_, i) => (
                <motion.div 
                  key={`status-${i}`}
                  className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-purple-500' : i === 1 ? 'bg-blue-500' : 'bg-indigo-500'}`}
                  animate={finalAnimation ? { 
                    opacity: 1,
                    scale: [1, 1.5, 1]
                  } : { 
                    opacity: [0.5, 1, 0.5],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{ 
                    duration: finalAnimation ? 0.5 : 2, 
                    repeat: finalAnimation ? 0 : Infinity,
                    delay: i * 0.3,
                    times: finalAnimation ? [0, 0.5, 1] : undefined
                  }}
                />
              ))}
            </div>
            <span className="text-xs font-mono text-white/60">
              {finalAnimation ? "SYSTEM.INITIALIZED" : "SYSTEM.INITIALIZATION"}
            </span>
          </div>
          
          <div className="text-xs font-mono text-white/60">
            {Math.floor(progress)}% COMPLETE
          </div>
        </motion.div>
        
        {/* Central Loading Component */}
        <div className="flex flex-col items-center mb-16">
          {/* Main Title with Animated Glow */}
          <motion.h1
            className="text-7xl font-bold mb-6 tracking-tight relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <motion.span 
              className="bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-white to-blue-300"
              animate={finalAnimation ? {
                textShadow: ["0 0 20px rgba(139, 92, 246, 0.5)", "0 0 30px rgba(139, 92, 246, 0.8)", "0 0 20px rgba(139, 92, 246, 0.5)"]
              } : {}}
              transition={{ duration: 2, times: [0, 0.5, 1] }}
            >
              NOVA
            </motion.span>
            <motion.div 
              className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={finalAnimation ? 
                { scaleX: 1, opacity: 1, backgroundColor: ["rgba(139, 92, 246, 0.5)", "rgba(139, 92, 246, 0.9)", "rgba(139, 92, 246, 0.5)"] } : 
                { scaleX: 1, opacity: 1 }
              }
              transition={finalAnimation ? 
                { duration: 2, times: [0, 0.5, 1] } : 
                { delay: 0.8, duration: 1 }
              }
            />
          </motion.h1>
          
          {/* Advanced Circular Progress Indicator */}
          <div className="relative mb-6 w-[220px] h-[220px]">
            {/* Outer decorative circles */}
            <svg width="220" height="220" viewBox="0 0 220 220" className="absolute top-0 left-0">
              {/* Outer background ring */}
              <circle 
                cx="110" 
                cy="110" 
                r="103" 
                stroke={finalAnimation ? "rgba(139, 92, 246, 0.2)" : "rgba(255,255,255,0.05)"} 
                strokeWidth="1" 
                fill="none" 
                style={{ transition: "stroke 1s ease-in-out" }}
              />
              
              {/* Middle background ring */}
              <circle 
                cx="110" 
                cy="110" 
                r="95" 
                stroke={finalAnimation ? "rgba(139, 92, 246, 0.3)" : "rgba(139,92,246,0.1)"} 
                strokeWidth="1" 
                fill="none" 
                strokeDasharray="3,5"
                style={{ transition: "stroke 1s ease-in-out" }}
              />
              
              {/* Inner background ring */}
              <circle 
                cx="110" 
                cy="110" 
                r="85" 
                stroke={finalAnimation ? "rgba(139, 92, 246, 0.2)" : "rgba(255,255,255,0.07)"} 
                strokeWidth="1" 
                fill="none" 
                style={{ transition: "stroke 1s ease-in-out" }}
              />
              
              {/* Progress arc with gradient */}
              <motion.path
                d={getProgressIndicator(110, 110, 103, progress)}
                stroke="url(#progressGradient)"
                strokeWidth={finalAnimation ? "4" : "3"}
                strokeLinecap="round"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ 
                  pathLength: progress / 100,
                  strokeWidth: finalAnimation ? 4 : 3
                }}
                transition={{ 
                  duration: finalAnimation ? 0.2 : 0.5, 
                  ease: "easeOut" 
                }}
              />
              
              {/* Final animation full circle completion */}
              <AnimatePresence>
                {finalAnimation && (
                  <motion.circle
                    cx="110"
                    cy="110"
                    r="103"
                    stroke="url(#completionGradient)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    fill="none"
                    initial={{ opacity: 0 }}
                    animate={{ 
                      opacity: [0, 1],
                      strokeDasharray: ["0, 647.5", "647.5, 0"]
                    }}
                    transition={{ 
                      duration: 1.5,
                      times: [0, 1],
                      ease: "easeInOut"
                    }}
                  />
                )}
              </AnimatePresence>
              
              {/* Decorative ticks around circle */}
              {Array(24).fill(0).map((_, i) => {
                const angle = (i * 15) * (Math.PI / 180)
                const x1 = 110 + 103 * Math.cos(angle)
                const y1 = 110 + 103 * Math.sin(angle)
                const x2 = 110 + 108 * Math.cos(angle)
                const y2 = 110 + 108 * Math.sin(angle)
                
                return (
                  <motion.line
                    key={`tick-${i}`}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={finalAnimation ? 
                      (i % 6 === 0 ? "rgba(139,92,246,0.9)" : "rgba(255,255,255,0.5)") : 
                      (i % 6 === 0 ? "rgba(139,92,246,0.5)" : "rgba(255,255,255,0.2)")
                    }
                    strokeWidth={i % 6 === 0 ? "2" : "1"}
                    initial={{ opacity: 0 }}
                    animate={{ 
                      opacity: finalAnimation && i % 3 === 0 ? [0.5, 1, 0.5] : 1 
                    }}
                    transition={{ 
                      delay: finalAnimation ? 0 : 0.05 * i, 
                      duration: finalAnimation ? 1.5 : 0.3,
                      repeat: finalAnimation && i % 3 === 0 ? 1 : 0
                    }}
                    style={{ transition: "stroke 1s ease-in-out" }}
                  />
                )
              })}
              
              {/* Animated position indicator on progress arc - hides when complete */}
              {!finalAnimation && (
                <motion.circle
                  cx="110"
                  cy="7" // Start at top
                  r="4"
                  fill="white"
                  filter="drop-shadow(0 0 5px rgba(139,92,246,0.8))"
                  animate={{
                    cx: [110, ...Array(360).fill(0).map((_, i) => 110 + 103 * Math.cos((i - 90) * (Math.PI / 180)))].slice(0, Math.ceil(progress / 100 * 360) + 1),
                    cy: [7, ...Array(360).fill(0).map((_, i) => 110 + 103 * Math.sin((i - 90) * (Math.PI / 180)))].slice(0, Math.ceil(progress / 100 * 360) + 1),
                  }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              )}
              
              {/* Small pulse at progress position - hides when complete */}
              {!finalAnimation && (
                <motion.circle
                  cx="110"
                  cy="7"
                  r="8"
                  fill="none"
                  stroke="rgba(139,92,246,0.5)"
                  animate={{
                    cx: [110, ...Array(360).fill(0).map((_, i) => 110 + 103 * Math.cos((i - 90) * (Math.PI / 180)))].slice(0, Math.ceil(progress / 100 * 360) + 1),
                    cy: [7, ...Array(360).fill(0).map((_, i) => 110 + 103 * Math.sin((i - 90) * (Math.PI / 180)))].slice(0, Math.ceil(progress / 100 * 360) + 1),
                    opacity: [0, 0.8, 0],
                    r: [4, 12, 4],
                  }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity,
                    ease: "easeOut"  
                  }}
                />
              )}
              
              {/* Completion effect - pulse rings */}
              <AnimatePresence>
                {finalAnimation && (
                  <motion.g>
                    <motion.circle
                      cx="110"
                      cy="110"
                      r="103"
                      stroke="rgba(139,92,246,0.5)"
                      strokeWidth="2"
                      fill="none"
                      initial={{ scale: 1, opacity: 0 }}
                      animate={{ 
                        scale: [1, 1.1],
                        opacity: [0, 0.5, 0]
                      }}
                      transition={{ 
                        duration: 2,
                        times: [0, 0.3, 1],
                        ease: "easeOut"
                      }}
                    />
                    <motion.circle
                      cx="110"
                      cy="110"
                      r="85"
                      stroke="rgba(139,92,246,0.5)"
                      strokeWidth="1"
                      fill="none"
                      initial={{ scale: 1, opacity: 0 }}
                      animate={{ 
                        scale: [1, 1.15],
                        opacity: [0, 0.6, 0]
                      }}
                      transition={{ 
                        duration: 2,
                        delay: 0.2,
                        times: [0, 0.3, 1],
                        ease: "easeOut"
                      }}
                    />
                  </motion.g>
                )}
              </AnimatePresence>
              
              {/* Gradient definitions */}
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#c026d3" />
                  <stop offset="50%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
                <linearGradient id="completionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="33%" stopColor="#6366f1" />
                  <stop offset="66%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                  <animate 
                    attributeName="x1" 
                    values="0%;30%;0%" 
                    dur="2s"
                    repeatCount="indefinite" 
                  />
                  <animate 
                    attributeName="x2" 
                    values="100%;70%;100%" 
                    dur="2s" 
                    repeatCount="indefinite" 
                  />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Center content with percentage */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.div
                className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-blue-300"
                initial={{ opacity: 0 }}
                animate={finalAnimation ? 
                  { opacity: 1, scale: [1, 1.2, 1], textShadow: ["0 0 10px rgba(139, 92, 246, 0.3)", "0 0 20px rgba(139, 92, 246, 0.7)", "0 0 10px rgba(139, 92, 246, 0.3)"] } : 
                  { opacity: 1 }
                }
                transition={finalAnimation ? 
                  { duration: 1.5, times: [0, 0.5, 1] } : 
                  { delay: 0.5 }
                }
              >
                {finalAnimation ? "100%" : Math.floor(progress) + "%"}
              </motion.div>
              
              {/* Current phase indicator with animated underline */}
              <motion.div 
                className="text-xs font-mono text-white/60 mt-1"
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: 1, 
                  color: finalAnimation ? "rgba(139, 92, 246, 0.8)" : "rgba(255, 255, 255, 0.6)"
                }}
                transition={{ delay: 0.7 }}
                style={{ transition: "color 1s ease-in-out" }}
              >
                {finalAnimation ? "INITIALIZATION COMPLETE" : loadingPhases[currentPhase].name}
              </motion.div>
              
              {/* Animated dots */}
              <motion.div
                className="flex space-x-1.5 mt-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: finalAnimation ? 0 : 1 }}
                transition={{ delay: 0.9 }}
              >
                {Array(5).fill(0).map((_, i) => (
                  <motion.div
                    key={`dot-${i}`}
                    className="w-1.5 h-1.5 rounded-full bg-purple-400"
                    animate={{
                      opacity: i === currentPhase ? 0.9 : 0.3,
                      scale: i === currentPhase ? [1, 1.3, 1] : 1,
                    }}
                    transition={{ 
                      duration: 1.5,
                      repeat: i === currentPhase ? Infinity : undefined,
                    }}
                  />
                ))}
              </motion.div>
            </div>
          </div>
          
          {/* Phase description with animated highlight */}
          <motion.div
            className="text-center max-w-md bg-black/30 backdrop-blur-sm px-6 py-3 rounded-md border border-white/5 relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: 1, 
              y: 0,
              borderColor: finalAnimation ? "rgba(139, 92, 246, 0.3)" : "rgba(255, 255, 255, 0.05)"
            }}
            transition={{ delay: 0.7, duration: 0.8 }}
            style={{ transition: "border-color 1s ease-in-out" }}
          >
            <motion.span
              className="text-sm text-white/80"
              animate={finalAnimation ? 
                { opacity: 1, color: "rgba(255, 255, 255, 0.9)" } : 
                { opacity: [0.7, 1, 0.7] }
              }
              transition={finalAnimation ? 
                { duration: 1 } : 
                { duration: 3, repeat: Infinity }
              }
              style={{ transition: "color 1s ease-in-out" }}
            >
              {finalAnimation ? "All systems operational. Ready to connect." : loadingPhases[currentPhase].subtext}
            </motion.span>
            
            {/* Decorative corner elements */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-purple-500/50"></div>
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-purple-500/50"></div>
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-purple-500/50"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-purple-500/50"></div>
            
            {/* Animated scan line - only shows on completion */}
            <AnimatePresence>
              {finalAnimation && (
                <motion.div 
                  className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent"
                  initial={{ opacity: 0, top: "0%" }}
                  animate={{ 
                    opacity: [0, 1, 0],
                    top: ["0%", "100%"]
                  }}
                  transition={{
                    duration: 1.5,
                    times: [0, 0.1, 1]
                  }}
                  exit={{ opacity: 0 }}
                />
              )}
            </AnimatePresence>
          </motion.div>
        </div>
        
        {/* Data stream console */}
        <motion.div
          className="w-full max-w-xl relative mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.8 }}
        >
          {/* Console header */}
          <div className="bg-black/40 backdrop-blur-sm border border-white/10 border-b-0 rounded-t-md px-4 py-2 flex justify-between items-center"
               style={{ borderColor: finalAnimation ? "rgba(139, 92, 246, 0.3)" : "rgba(255, 255, 255, 0.1)", transition: "border-color 1s ease-in-out" }}>
            <div className="flex items-center space-x-2">
              <motion.div 
                className="w-3 h-3 rounded-full bg-purple-500/80"
                animate={finalAnimation ? 
                  { scale: [1, 1.3, 1], backgroundColor: ["rgba(139, 92, 246, 0.8)", "rgba(139, 92, 246, 1)", "rgba(139, 92, 246, 0.8)"] } : 
                  { scale: 1, opacity: [0.6, 1, 0.6] }
                }
                transition={finalAnimation ? 
                  { duration: 0.8, times: [0, 0.5, 1] } : 
                  { duration: 2, repeat: Infinity }
                }
              ></motion.div>
              <span className="text-xs font-mono text-white/60">SYSTEM_LOG</span>
            </div>
            <motion.div 
              className="text-xs font-mono text-white/40"
              animate={{ color: finalAnimation ? "rgba(139, 92, 246, 0.7)" : "rgba(255, 255, 255, 0.4)" }}
              style={{ transition: "color 1s ease-in-out" }}
            >
              {finalAnimation ? "SUCCESSFUL" : "ACTIVE"}
            </motion.div>
          </div>
          
          {/* Console content */}
          <div 
            ref={streamRef}
            className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-b-md px-4 py-3 h-24 overflow-y-auto font-mono text-xs"
            style={{ 
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(139, 92, 246, 0.3) rgba(0, 0, 0, 0.2)',
              borderColor: finalAnimation ? "rgba(139, 92, 246, 0.3)" : "rgba(255, 255, 255, 0.1)",
              transition: "border-color 1s ease-in-out"
            }}
          >
            {dataStreams.map((message, idx) => (
              <motion.div 
                key={`log-${idx}`}
                className="text-white/70 mb-1 flex"
                initial={{ opacity: 0, x: -10 }}
                animate={{ 
                  opacity: 1, 
                  x: 0,
                  color: finalAnimation && idx >= dataStreams.length - completionMessages.length ? 
                    "rgba(139, 92, 246, 0.9)" : "rgba(255, 255, 255, 0.7)"
                }}
                transition={{ duration: 0.3 }}
                style={{ transition: "color 0.5s ease-in-out" }}
              >
                <span className={`${finalAnimation && idx >= dataStreams.length - completionMessages.length ? "text-blue-400" : "text-purple-400"} mr-2`}>&gt;</span>
                <span>{message}</span>
              </motion.div>
            ))}
          </div>
          
          {/* Animated scan bar */}
          <motion.div 
            className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent"
            animate={finalAnimation ? 
              { scaleX: 1, opacity: 1, x: 0 } : 
              { scaleX: [0, 1, 0], opacity: [0, 0.7, 0], x: ['-100%', '100%'] }
            }
            transition={finalAnimation ? 
              { duration: 0.5 } : 
              { duration: 2, repeat: Infinity, ease: "easeInOut" }
            }
          />
        </motion.div>
        
        {/* Enter button (appears when loading completes) */}
        <AnimatePresence>
          {showEnterButton && (
            <motion.button
              className="relative bg-black/30 backdrop-blur-sm text-white border border-purple-500/50 px-10 py-4 rounded-md group overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.4 }}
            >
              <span className="relative z-10 text-sm font-medium tracking-widest uppercase">Enter NOVA</span>
              
              {/* Button glow effect */}
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-indigo-600/20 to-blue-600/20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              />
              
              {/* Button hover animation */}
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-purple-600/30 via-indigo-600/30 to-blue-600/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              />
              
              {/* Animated scan line */}
              <motion.div 
                className="absolute top-0 left-0 w-full h-full"
                animate={{ 
                  background: ['linear-gradient(to right, transparent, rgba(139, 92, 246, 0.5), transparent)', 
                              'linear-gradient(to right, transparent, rgba(139, 92, 246, 0), transparent)']
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              
              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-purple-500/90"></div>
              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-purple-500/90"></div>
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-purple-500/90"></div>
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-purple-500/90"></div>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
      
      {/* Bottom Status Bar */}
      <motion.div 
        className="absolute bottom-8 left-0 right-0 flex justify-between items-center px-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        <div className="flex items-center space-x-4">
          <motion.span 
            className="text-xs font-mono text-white/60"
            animate={{ color: finalAnimation ? "rgba(139, 92, 246, 0.8)" : "rgba(255, 255, 255, 0.6)" }}
            style={{ transition: "color 1s ease-in-out" }}
          >
            O.XYZ :: SOVEREIGN AI
          </motion.span>
          <motion.div 
            className="w-8 h-[1px]"
            style={{ 
              background: finalAnimation ? 
                'linear-gradient(to right, transparent, rgba(139, 92, 246, 0.8), transparent)' : 
                'linear-gradient(to right, transparent, rgba(139, 92, 246, 0.5), transparent)',
              transition: "background 1s ease-in-out"
            }}
          ></motion.div>
          <motion.span 
            className="text-xs font-mono text-white/60"
            animate={finalAnimation ? 
              { color: "rgba(139, 92, 246, 0.8)" } : 
              { opacity: [0.6, 1, 0.6] }
            }
            transition={finalAnimation ? 
              { duration: 1 } : 
              { duration: 2, repeat: Infinity }
            }
            style={{ transition: "color 1s ease-in-out" }}
          >
            V2.1.4_ALPHA
          </motion.span>
        </div>
        
        <div className="flex items-center">
          <span className="text-xs font-mono text-white/60 mr-3">QUANTUM CORE STATUS:</span>
          <div className="flex space-x-1">
            {["SECURE", "STABLE", "ACTIVE"].map((status, idx) => (
              <motion.div 
                key={`status-${idx}`}
                className="px-2 py-0.5 text-[10px] font-mono bg-black/30 border border-white/10 rounded"
                animate={finalAnimation ? {
                  backgroundColor: ["rgba(0,0,0,0.3)", "rgba(139,92,246,0.15)", "rgba(0,0,0,0.3)"],
                  borderColor: [
                    'rgba(255,255,255,0.1)', 
                    idx === 0 ? 'rgba(139,92,246,0.7)' : idx === 1 ? 'rgba(59,130,246,0.7)' : 'rgba(16,185,129,0.7)', 
                    idx === 0 ? 'rgba(139,92,246,0.5)' : idx === 1 ? 'rgba(59,130,246,0.5)' : 'rgba(16,185,129,0.5)'
                  ],
                  color: [
                    'rgba(255,255,255,0.6)',
                    idx === 0 ? 'rgba(139,92,246,1)' : idx === 1 ? 'rgba(59,130,246,1)' : 'rgba(16,185,129,1)',
                    idx === 0 ? 'rgba(139,92,246,0.8)' : idx === 1 ? 'rgba(59,130,246,0.8)' : 'rgba(16,185,129,0.8)'
                  ]
                } : {
                  borderColor: [
                    'rgba(255,255,255,0.1)', 
                    idx === 0 ? 'rgba(139,92,246,0.5)' : idx === 1 ? 'rgba(59,130,246,0.5)' : 'rgba(16,185,129,0.5)', 
                    'rgba(255,255,255,0.1)'
                  ] 
                }}
                transition={finalAnimation ? 
                  { duration: 1.5, times: [0, 0.5, 1], delay: idx * 0.2 } : 
                  { duration: 3, repeat: Infinity, delay: idx * 1 }
                }
              >
                {status}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
      
      {/* Enhanced corner decorations */}
      <div className="absolute top-6 left-6 w-24 h-24 border-l-2 border-t-2 border-purple-500/20 z-20"></div>
      <div className="absolute top-6 right-6 w-24 h-24 border-r-2 border-t-2 border-purple-500/20 z-20"></div>
      <div className="absolute bottom-6 left-6 w-24 h-24 border-l-2 border-b-2 border-purple-500/20 z-20"></div>
      <div className="absolute bottom-6 right-6 w-24 h-24 border-r-2 border-b-2 border-purple-500/20 z-20"></div>
      
      {/* Additional corner details */}
      <div className="absolute top-8 left-8 flex flex-col items-start">
        <div className="w-3 h-3 border-l border-t border-purple-500/50"></div>
        <motion.div 
          className="h-6 w-[1px] bg-purple-500/30 ml-1"
          animate={finalAnimation ? { height: ["6px", "24px", "6px"] } : {}}
          transition={finalAnimation ? { duration: 2, times: [0, 0.5, 1] } : {}}
        ></motion.div>
      </div>
      
      <div className="absolute top-8 right-8 flex flex-col items-end">
        <div className="w-3 h-3 border-r border-t border-purple-500/50"></div>
        <motion.div 
          className="h-6 w-[1px] bg-purple-500/30 mr-1"
          animate={finalAnimation ? { height: ["6px", "24px", "6px"] } : {}}
          transition={finalAnimation ? { duration: 2, times: [0, 0.5, 1], delay: 0.2 } : {}}
        ></motion.div>
      </div>
      
      <div className="absolute bottom-8 left-8 flex flex-col items-start">
        <motion.div 
          className="h-6 w-[1px] bg-purple-500/30 ml-1"
          animate={finalAnimation ? { height: ["6px", "24px", "6px"] } : {}}
          transition={finalAnimation ? { duration: 2, times: [0, 0.5, 1], delay: 0.4 } : {}}
        ></motion.div>
        <div className="w-3 h-3 border-l border-b border-purple-500/50"></div>
      </div>
      
      <div className="absolute bottom-8 right-8 flex flex-col items-end">
        <motion.div 
          className="h-6 w-[1px] bg-purple-500/30 mr-1"
          animate={finalAnimation ? { height: ["6px", "24px", "6px"] } : {}}
          transition={finalAnimation ? { duration: 2, times: [0, 0.5, 1], delay: 0.6 } : {}}
        ></motion.div>
        <div className="w-3 h-3 border-r border-b border-purple-500/50"></div>
      </div>
    </motion.div>
  )
}