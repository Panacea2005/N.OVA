"use client"

import { useRef, useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Canvas } from "@react-three/fiber"
import { Suspense } from "react"
import dynamic from "next/dynamic"

// Dynamically import 3D models for each phase
const WireframeCube = dynamic(() => import("@/components/3d/wireframe-cube"), {
  ssr: false,
})

const WireframeTower = dynamic(() => import("@/components/3d/wireframe-tower"), {
  ssr: false,
})

const NetworkMesh = dynamic(() => import("@/components/3d/network-mesh"), {
  ssr: false,
})

const StackedPlanes = dynamic(() => import("@/components/3d/stacked-planes"), {
  ssr: false,
})

const CircularOrbits = dynamic(() => import("@/components/3d/circular-orbits"), {
  ssr: false,
})

// Custom environment component
const CustomEnvironment = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ffffff" />
      {children}
    </>
  )
}

export default function TechnologySection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [activePhase, setActivePhase] = useState(1)
  const [nextPhase, setNextPhase] = useState<number | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [scrollDirection, setScrollDirection] = useState<null | 'up' | 'down'>(null)
  const [lastScrollY, setLastScrollY] = useState(0)
  
  // Define all phases data with enhanced content
  const phases = [
    {
      number: 1,
      title: "$N Token Genesis",
      description: "Establishing the fundamental economic layer powering our decentralized AI ecosystem.",
      component: NetworkMesh,
      techSpecs: ["ERC-20 Compatible", "AI Utility Token", "Quantum-Proof"],
      bulletPoints: ["Proof-of-Intelligence Consensus", "Adaptive Staking", "Quantum-Resistant"]
    },
    {
      number: 2,
      title: "Neural Network Integration",
      description: "Merging distributed computing resources with our proprietary neural architecture.",
      component: CircularOrbits,
      techSpecs: ["Multi-Modal Processing", "Self-Healing Architecture", "Neural Scaling"],
      bulletPoints: ["Zero-Knowledge Inference", "Decentralized Training", "Quantum Optimization"]
    },
    {
      number: 3,
      title: "Autonomous Agent Deployment",
      description: "Unleashing a self-organizing ecosystem of specialized AI agents with aligned incentives.",
      component: WireframeCube,
      techSpecs: ["Multi-Agent Coordination", "Reputation Systems", "Task Decomposition"],
      bulletPoints: ["Self-Improving Code", "Verifiable Execution", "Capability Expansion"]
    },
    {
      number: 4,
      title: "Resilient Infrastructure",
      description: "Creating an unstoppable computational substrate immune to censorship and single points of failure.",
      component: StackedPlanes,
      techSpecs: ["Geographic Redundancy", "Self-Healing Networks", "Hardware Agnostic"],
      bulletPoints: ["Byzantine Fault Tolerance", "Adaptive Resources", "Quantum-Ready"]
    },
    {
      number: 5,
      title: "Sovereign Intelligence",
      description: "The final evolution - a fully autonomous, self-governing AI ecosystem aligned with human values.",
      component: WireframeTower,
      techSpecs: ["Digital Democracy", "Constitutional AI", "Value Alignment"],
      bulletPoints: ["Human-AI Framework", "Transparent Decisions", "Distributed Governance"]
    },
  ]

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return

      const sectionRect = sectionRef.current.getBoundingClientRect()
      const sectionTop = sectionRect.top
      const sectionHeight = sectionRect.height
      const windowHeight = window.innerHeight
      
      // Check if section is in view
      if (sectionTop < windowHeight && sectionTop > -sectionHeight) {
        // Calculate scroll direction
        const currentScrollY = window.scrollY
        if (currentScrollY > lastScrollY) {
          setScrollDirection('down')
        } else if (currentScrollY < lastScrollY) {
          setScrollDirection('up')
        }
        setLastScrollY(currentScrollY)
        
        // Calculate which phase should be active based on scroll position
        const scrollPosition = (windowHeight - sectionTop) / windowHeight
        const totalPhases = phases.length
        const sectionScrollPercent = Math.max(0, Math.min(1, scrollPosition / (sectionHeight / windowHeight)))
        
        // Calculate phase based on scroll percentage
        const rawPhaseIndex = Math.floor(sectionScrollPercent * totalPhases)
        const newPhaseNumber = Math.min(totalPhases, Math.max(1, rawPhaseIndex + 1))
        
        // Only update if phase changes and we're not already transitioning
        if (newPhaseNumber !== activePhase && !isTransitioning) {
          setNextPhase(newPhaseNumber)
          setIsTransitioning(true)
          
          // Complete the transition after animation
          setTimeout(() => {
            setActivePhase(newPhaseNumber)
            setNextPhase(null)
            setIsTransitioning(false)
          }, 700) // Match transition duration
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [activePhase, isTransitioning, lastScrollY, phases.length])

  // Get current phase data
  const currentPhaseData = phases.find(phase => phase.number === activePhase) || phases[0]
  const nextPhaseData = nextPhase ? phases.find(phase => phase.number === nextPhase) : null
  
  // Determine which component to render
  const CurrentPhaseComponent = currentPhaseData.component
  const NextPhaseComponent = nextPhaseData?.component

  // Progress indicator
  const progress = ((activePhase - 1) / (phases.length - 1)) * 100

  return (
    <section
      id="technology"
      ref={sectionRef}
      className="relative border-t border-white/10"
      style={{ height: `${window.innerHeight * 5}px` }} // Make section tall enough for scrolling
    >
      {/* Fixed viewport for content */}
      <div className="sticky top-0 w-full h-screen overflow-hidden bg-black">
        {/* Minimal background grid pattern */}
        <div 
          className="fixed inset-0 opacity-10 z-0"
          style={{
            backgroundImage: 'linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        ></div>
        
        {/* Center content */}
        <div className="container mx-auto h-full flex">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center h-full pt-24 pb-16 px-2">
            {/* Content Column */}
            <div className="relative h-full flex flex-col justify-center">
              {/* Progress indicator */}
              <div className="flex mb-8 space-x-1">
                {[1, 2, 3, 4, 5].map((phase) => (
                  <div key={`indicator-${phase}`}>
                    <div 
                      className={`w-8 h-0.5 ${phase <= activePhase ? 'bg-white' : 'bg-white/20'} transition-colors duration-300`}
                    ></div>
                  </div>
                ))}
              </div>
              
              {/* Phase number indicator */}
              <div className="mb-4 uppercase text-xs text-white/60">
                PHASE {currentPhaseData.number}/{phases.length}
              </div>
              
              {/* Main content with transitions */}
              <div className="relative overflow-hidden">
                {/* Current phase content */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`content-${activePhase}`}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ 
                      opacity: 0, 
                      y: scrollDirection === 'down' ? -100 : 100,
                    }}
                    transition={{ duration: 0.7 }}
                    className="space-y-8"
                  >
                    {/* Main phase title */}
                    <div>
                      <h2 className="text-7xl font-light mb-4">
                        {currentPhaseData.title}
                      </h2>
                      {currentPhaseData.description && (
                        <motion.p 
                          className="text-white/70 mb-6 max-w-xl"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.8, delay: 0.3 }}
                        >
                          {currentPhaseData.description}
                        </motion.p>
                      )}
                      <div className="w-full h-px bg-white/10 mb-8"></div>
                    </div>

                    {/* Feature lists */}
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <div className="text-xs text-white/60 uppercase mb-3">Key Features</div>
                        <ul className="space-y-2">
                          {currentPhaseData.techSpecs.map((spec, idx) => (
                            <motion.li 
                              key={`tech-${idx}`}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.1 * idx }}
                              className="text-white/80 text-sm"
                            >
                              {spec}
                            </motion.li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <div className="text-xs text-white/60 uppercase mb-3">Technology</div>
                        <ul className="space-y-2">
                          {currentPhaseData.bulletPoints.map((point, idx) => (
                            <motion.li 
                              key={`bullet-${idx}`}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.1 * idx }}
                              className="text-white/80 text-sm"
                            >
                              {point}
                            </motion.li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
              
              {/* Scroll indicator */}
              {activePhase < phases.length && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.4, 0.8, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                  className="absolute -bottom-4 left-0 text-xs text-white/60 uppercase"
                >
                  Scroll to continue
                </motion.div>
              )}
            </div>
            
            {/* 3D Visualization Column */}
            <div className="h-full flex items-center justify-center relative">
              <div className="relative w-full h-[75vh] border border-white/10 overflow-hidden bg-black">
                {/* The 3D Canvas */}
                <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                  <Suspense fallback={null}>
                    <CustomEnvironment>
                      <AnimatePresence mode="wait">
                        {/* Current 3D component */}
                        {currentPhaseData && (
                          <group key={`current-3d-${activePhase}`}>
                            <CurrentPhaseComponent />
                          </group>
                        )}
                        
                        {/* Next 3D component (for transitions) */}
                        {nextPhaseData && isTransitioning && (
                          <group key={`next-3d-${nextPhase}`} 
                            position={[0, scrollDirection === 'down' ? -5 : 5, 0]}
                          >
                            {NextPhaseComponent && <NextPhaseComponent />}
                          </group>
                        )}
                      </AnimatePresence>
                    </CustomEnvironment>
                  </Suspense>
                </Canvas>
                
                {/* Minimal model info */}
                <div className="absolute bottom-4 left-4 text-xs text-white/60 uppercase">
                  Model {activePhase}.0
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Minimal bottom info bar */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 py-3 z-30">
          <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
            <div className="text-xs text-white/60 uppercase">
              N.OVA Technology
            </div>
            <div className="text-xs text-white/60 uppercase">
              {currentPhaseData.title}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}