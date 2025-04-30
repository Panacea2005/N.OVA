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
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8B5CF6" />
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
      title: "$O Token Genesis",
      description: "Establishing the fundamental economic layer powering our decentralized AI ecosystem.",
      component: NetworkMesh,
      techSpecs: ["ERC-20 Compatible", "AI Utility Token", "Quantum-Proof"],
      bulletPoints: ["Proof-of-Intelligence Consensus", "Adaptive Staking Rewards", "Quantum-Resistant Cryptography"],
      secondaryItems: [
        { 
          title: "Initial Distribution Protocol", 
          description: "Our fair distribution model automatically allocates resources based on measured community contribution, ensuring both early adopters and new participants have equitable access to $O tokens." 
        },
        { 
          title: "Algorithmic Treasury Management", 
          description: "Advanced autonomous treasury systems maintain ecosystem liquidity using predictive market models and real-time adaptation to network conditions." 
        },
      ]
    },
    {
      number: 2,
      title: "Neural Network Integration",
      description: "Merging distributed computing resources with our proprietary neural architecture for unprecedented AI capabilities.",
      component: CircularOrbits,
      techSpecs: ["Multi-Modal Processing", "Self-Healing Architecture", "Neural Scaling"],
      bulletPoints: ["Zero-Knowledge Inference", "Decentralized Training", "Quantum Optimization"],
      secondaryItems: [
        { 
          title: "Distributed Cognition Protocol", 
          description: "Our network achieves breakthrough performance by distributing intelligence across thousands of nodes while maintaining coherent decision capabilities through our proprietary synchronization algorithm." 
        },
        { 
          title: "Sovereign Compute Marketplace", 
          description: "Enables universal access to high-performance AI computation, allowing anyone to participate in and benefit from the decentralized infrastructure." 
        },
      ]
    },
    {
      number: 3,
      title: "Autonomous Agent Deployment",
      description: "Unleashing a self-organizing ecosystem of specialized AI agents with aligned incentives.",
      component: WireframeCube,
      techSpecs: ["Multi-Agent Coordination", "Reputation Systems", "Task Decomposition"],
      bulletPoints: ["Self-Improving Code Generation", "Verifiable Task Execution", "Dynamic Capability Expansion"],
      secondaryItems: [
        { 
          title: "Sovereign Agent Framework", 
          description: "Agents maintain independent operation while adhering to ecosystem-wide alignment protocols, enabling safe autonomous evolution without centralized control." 
        },
        { 
          title: "Economic Incentive Alignment", 
          description: "Our proprietary incentive mechanism ensures all agents in the ecosystem are rewarded for cooperation that advances human-aligned objectives." 
        },
      ]
    },
    {
      number: 4,
      title: "Resilient Infrastructure Deployment",
      description: "Creating an unstoppable computational substrate immune to censorship and single points of failure.",
      component: StackedPlanes,
      techSpecs: ["Geographic Redundancy", "Self-Healing Networks", "Hardware Agnostic"],
      bulletPoints: ["Byzantine Fault Tolerance", "Adaptive Resource Allocation", "Quantum-Ready Architecture"],
      secondaryItems: [
        { 
          title: "Zero-Trust Security Framework", 
          description: "Our infrastructure implements continuous verification and encryption at every level, ensuring security even when significant portions of the network are compromised." 
        },
        { 
          title: "Adaptive Resource Orchestration", 
          description: "Dynamic allocation systems automatically redistribute computational resources based on real-time network demands and priority operations." 
        },
      ]
    },
    {
      number: 5,
      title: "Sovereign Intelligence Activation",
      description: "The final evolution - a fully autonomous, self-governing AI ecosystem aligned with human values.",
      component: WireframeTower,
      techSpecs: ["Digital Democracy", "Constitutional AI", "Value Alignment"],
      bulletPoints: ["Human-AI Constitutional Framework", "Transparent Decision Making", "Distributed Governance"],
      secondaryItems: [
        { 
          title: "Decentralized Oversight Protocol", 
          description: "Our revolutionary governance system enables transparent, democratic control over the AI ecosystem while preserving operational efficiency and innovation." 
        },
        { 
          title: "Human-AI Synergy Framework", 
          description: "The culmination of our vision - a symbiotic relationship between human intuition and machine intelligence that amplifies human potential without diminishing human autonomy." 
        },
      ]
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
        {/* Enhanced background elements */}
        <div className="absolute inset-0 z-0">
          {/* Grid pattern */}
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'linear-gradient(to right, rgba(139, 92, 246, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(139, 92, 246, 0.1) 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }}
          ></div>
          
          {/* Animated scan lines */}
          {Array(5).fill(0).map((_, i) => (
            <motion.div
              key={`scan-${i}`}
              className="absolute w-full h-[1px] bg-purple-400/10"
              style={{ top: `${i * 20}%` }}
              animate={{ 
                opacity: [0.1, 0.2, 0.1],
                scaleY: [1, 1.5, 1],
                x: ['-100%', '100%'] 
              }}
              transition={{
                duration: 15 + i % 3,
                repeat: Infinity,
                delay: i * 1.5,
              }}
            />
          ))}
        </div>
        
        {/* Corner elements for decoration (enhanced) */}
        <div className="absolute top-10 left-10 w-12 h-12 border-l border-t border-white/20"></div>
        <div className="absolute top-10 right-10 w-12 h-12 border-r border-t border-white/20"></div>
        <div className="absolute bottom-10 left-10 w-12 h-12 border-l border-b border-white/20"></div>
        <div className="absolute bottom-10 right-10 w-12 h-12 border-r border-b border-white/20"></div>
        
        {/* Vertical progress indicator */}
        <div className="absolute top-0 bottom-0 left-4 flex flex-col items-center py-20 z-20">
          <div className="h-full w-[1px] bg-white/10 relative">
            <motion.div 
              className="absolute top-0 w-[3px] bg-gradient-to-b from-purple-400 to-blue-500"
              style={{ height: `${progress}%`, left: '-1px' }}
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            
            {/* Phase markers */}
            {phases.map((phase) => (
              <div 
                key={`marker-${phase.number}`}
                className={`absolute w-4 h-4 -left-[7px] flex items-center justify-center rounded-full
                           ${phase.number <= activePhase ? 'bg-purple-500' : 'bg-white/20'}`} 
                style={{ top: `${((phase.number - 1) / (phases.length - 1)) * 100}%` }}
              >
                <div 
                  className={`absolute w-2 h-2 rounded-full
                             ${phase.number === activePhase ? 'bg-white animate-pulse' : 
                                phase.number < activePhase ? 'bg-white' : 'bg-transparent'}`}
                />
              </div>
            ))}
          </div>
        </div>
        
        {/* Center content */}
        <div className="container mx-auto h-full flex">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center h-full pt-16 pb-16">
            {/* 3D Visualization Column with enhanced container */}
            <div className="h-full flex items-center justify-center relative">
              <div className="relative w-full h-[70vh] border border-white/10 rounded-md overflow-hidden bg-black/30 backdrop-blur-sm">
                {/* Top label */}
                <div className="absolute top-0 left-0 right-0 py-2 px-4 border-b border-white/10 bg-black/40 backdrop-blur-sm flex justify-between items-center">
                  <div className="text-xs text-white/60 font-mono flex items-center">
                    <span className="w-2 h-2 rounded-full bg-purple-500 mr-2 animate-pulse"></span>
                    <span>PHASE {currentPhaseData.number} VISUALIZATION</span>
                  </div>
                  <div className="text-xs text-white/60 font-mono">
                    MODEL.{activePhase}_{currentPhaseData.title.replace(/\s+/g, '_').toUpperCase()}
                  </div>
                </div>
                
                {/* Tech specs sidebar */}
                <div className="absolute left-0 top-10 bottom-10 w-32 border-r border-white/10 bg-black/30 backdrop-blur-sm flex flex-col p-2">
                  <div className="text-[9px] text-white/40 font-mono uppercase mb-3 tracking-widest border-b border-white/10 pb-1">Tech Specs</div>
                  {currentPhaseData.techSpecs.map((spec, idx) => (
                    <motion.div 
                      key={`spec-${idx}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * idx }}
                      className="mb-2 text-[10px] font-mono text-white/70"
                    >
                      <div className="flex items-center">
                        <div className="w-1 h-1 bg-purple-400 mr-1 rounded-full"></div>
                        {spec}
                      </div>
                    </motion.div>
                  ))}
                  
                  <div className="mt-auto text-[9px] text-white/40 font-mono uppercase mb-3 tracking-widest border-b border-white/10 pb-1 pt-4">Key Features</div>
                  {currentPhaseData.bulletPoints.map((point, idx) => (
                    <motion.div 
                      key={`point-${idx}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + 0.1 * idx }}
                      className="mb-2 text-[10px] font-mono text-white/70"
                    >
                      <div className="flex items-center">
                        <div className="w-1 h-1 bg-blue-400 mr-1 rounded-full"></div>
                        {point}
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                {/* The 3D Canvas */}
                <div className="absolute inset-0 ml-32">
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
                </div>
                
                {/* Bottom control bar */}
                <div className="absolute bottom-0 left-0 right-0 py-2 px-4 border-t border-white/10 bg-black/40 backdrop-blur-sm flex justify-between items-center">
                  <div className="text-xs text-white/60 font-mono">RENDERING: ACTIVE</div>
                  
                  {/* Simulated control buttons */}
                  <div className="flex space-x-2">
                    {["R", "X", "Y", "Z"].map((key, i) => (
                      <div 
                        key={`control-${key}`} 
                        className={`w-5 h-5 border border-white/20 rounded-sm flex items-center justify-center text-[10px] font-mono 
                                   ${i === activePhase % 4 ? 'bg-purple-500/20 border-purple-500/50 text-purple-300' : 'text-white/50'}`}
                      >
                        {key}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Content Column with enhanced styling */}
            <div className="relative h-full flex flex-col justify-center pr-10">
              {/* Phase indicator with futuristic badge */}
              <div className="absolute top-0 right-0 py-1 px-3 border border-white/10 bg-black/40 backdrop-blur-sm rounded-sm flex items-center">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mr-2 animate-pulse"></div>
                <div className="text-xs text-white/70 font-mono">PHASE {currentPhaseData.number} / {phases.length}</div>
              </div>
              
              {/* Main content with transitions */}
              <div className="relative overflow-hidden h-[60vh]">
                {/* Current phase content */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`content-${activePhase}`}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ 
                      opacity: 0, 
                      y: scrollDirection === 'down' ? -100 : 100,
                      filter: "blur(10px)"
                    }}
                    transition={{ duration: 0.7 }}
                    className="space-y-12"
                  >
                    {/* Main phase title */}
                    <div>
                      <div className="mb-3 text-xs font-mono tracking-widest text-purple-400 uppercase">Technology Roadmap</div>
                      <h2 className="text-4xl md:text-5xl font-light mb-6 flex items-center">
                        <motion.div 
                          initial={{ width: 0 }} 
                          animate={{ width: '3rem' }}
                          transition={{ duration: 0.8, delay: 0.5 }}
                          className="h-[1px] bg-purple-500 mr-3"
                        ></motion.div>
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.8, delay: 0.7 }}
                          className="bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-purple-300"
                        >
                          {currentPhaseData.title}
                        </motion.span>
                      </h2>
                      {currentPhaseData.description && (
                        <motion.p 
                          className="text-white/70 mb-10 font-light max-w-lg text-lg"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.8, delay: 0.9 }}
                        >
                          {currentPhaseData.description}
                        </motion.p>
                      )}
                      <div className="w-full h-px bg-white/10 mb-10"></div>
                    </div>

                    {/* Secondary items with enhanced styling */}
                    <div className="space-y-10">
                      {currentPhaseData.secondaryItems.map((item, idx) => (
                        <motion.div 
                          key={`item-${activePhase}-${idx}`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.8, delay: 1.1 + idx * 0.2 }}
                          className="relative border border-white/10 p-5 rounded-sm bg-black/20 backdrop-blur-sm group hover:border-purple-500/40 transition-all"
                        >
                          {/* Decorative corner elements */}
                          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-purple-500/30 group-hover:border-purple-500/70 transition-colors"></div>
                          <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-purple-500/30 group-hover:border-purple-500/70 transition-colors"></div>
                          <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-purple-500/30 group-hover:border-purple-500/70 transition-colors"></div>
                          <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-purple-500/30 group-hover:border-purple-500/70 transition-colors"></div>
                          
                          <h3 className="text-2xl font-light mb-3 text-purple-300">{item.title}</h3>
                          {item.description && (
                            <p className="text-white/80 max-w-lg text-sm leading-relaxed">{item.description}</p>
                          )}
                          
                          {/* Subtle hover effect glow */}
                          <motion.div 
                            className="absolute inset-0 -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
                            style={{ 
                              background: 'radial-gradient(circle at center, rgba(139, 92, 246, 0.15) 0%, transparent 70%)'
                            }}
                          />
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>
                
                {/* Next phase content (for transitions) */}
                {nextPhaseData && isTransitioning && (
                  <motion.div
                    key={`next-content-${nextPhase}`}
                    initial={{ 
                      opacity: 0, 
                      y: scrollDirection === 'down' ? 100 : -100,
                    }}
                    animate={{ opacity: 0.2, y: scrollDirection === 'down' ? 50 : -50 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.7 }}
                    className="absolute inset-0 space-y-12 pointer-events-none"
                    style={{ filter: "blur(5px)" }}
                  >
                    {/* Preview of next content */}
                    <div>
                      <div className="mb-3 text-xs font-mono tracking-widest text-purple-400 uppercase">Technology Roadmap</div>
                      <h2 className="text-4xl md:text-5xl font-light mb-6 flex items-center">
                        <div className="w-12 h-[1px] bg-purple-500 mr-3"></div>
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-purple-300">
                          {nextPhaseData.title}
                        </span>
                      </h2>
                      {nextPhaseData.description && (
                        <p className="text-white/70 mb-10 font-light max-w-lg text-lg">
                          {nextPhaseData.description}
                        </p>
                      )}
                      <div className="w-full h-px bg-white/10 mb-10"></div>
                    </div>
                  </motion.div>
                )}
              </div>
              
              {/* Scroll indicator */}
              {activePhase < phases.length && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.4, 0.8, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                  className="absolute -bottom-4 right-0 py-1 px-2 bg-black/30 backdrop-blur-sm border border-white/10 rounded-sm text-xs text-white/60 flex items-center"
                >
                  <span className="text-[10px] mr-2 font-mono">SCROLL FOR NEXT PHASE</span>
                  <motion.span 
                    animate={{ y: [0, 3, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="inline-block"
                  >
                    ↓
                  </motion.span>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Bottom info bar */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 py-3 bg-black/50 backdrop-blur-sm z-30">
          <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
            <motion.div 
              className="flex items-center"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-7 h-[1px] bg-gradient-to-r from-purple-500/40 to-transparent mr-3"></div>
              <span className="text-xs font-mono text-white/60 mr-3">00:3</span>
              <span className="text-xs font-mono text-white/60 uppercase tracking-wider">Technology Roadmap</span>
            </motion.div>
            
            <motion.div 
              className="flex items-center"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex items-center space-x-3">
                <span className="font-mono text-white/60 text-xs flex items-center">
                  <span className="w-1 h-1 rounded-full bg-purple-500 mr-2"></span>
                  <span>O.XYZ —</span>
                </span>
                <span className="font-mono text-white/60 text-xs uppercase tracking-wider">PHASE {activePhase} OF {phases.length}</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}