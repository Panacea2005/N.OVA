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
  
  // Define all phases data
  const phases = [
    {
      number: 1,
      title: "$O Coin Release",
      description: "Publish tokenomics and build a community around the Token Generation Event (TGE).",
      component: NetworkMesh,
      secondaryItems: [
        { title: "O.AGENTS Program Launch", description: "" },
        { title: "O.INFRASTRUCTURE Program Launch", description: "" },
      ]
    },
    {
      number: 2,
      title: "$O Coin Release",
      description: "",
      component: CircularOrbits,
      secondaryItems: [
        { 
          title: "O.AGENTS Program Launch", 
          description: "Empowering the community to contribute, shape O's future, and earn rewards along the way."
        },
        { title: "O.INFRASTRUCTURE Program Launch", description: "" },
      ]
    },
    {
      number: 3,
      title: "O.AGENTS Program Launch",
      description: "", 
      component: WireframeCube,
      secondaryItems: [
        { 
          title: "O.INFRASTRUCTURE Program Launch", 
          description: "We're building shutdown resistant compute infrastructure to keep everything scalable, independent and transparent."
        },
        { title: "Launch of O.DAO", description: "" },
      ]
    },
    {
      number: 4,
      title: "O.INFRASTRUCTURE Program Launch",
      description: "",
      component: StackedPlanes,
      secondaryItems: [
        { title: "Launch of O.DAO", description: "Empowering the O.XYZ ecosystem through decentralized governance" },
        { title: "O Becomes CEO", description: "" },
      ]
    },
    {
      number: 5,
      title: "Launch of O.DAO",
      description: "",
      component: WireframeTower,
      secondaryItems: [
        { 
          title: "O Becomes CEO", 
          description: "O autonomously runs and manages O.XYZ, fully decentralizing leadership as its AI-powered CEO."
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

  return (
    <section
      id="technology"
      ref={sectionRef}
      className="relative border-t border-white/10"
      style={{ height: `${window.innerHeight * 5}px` }} // Make section tall enough for scrolling
    >
      {/* Fixed viewport for content */}
      <div className="sticky top-0 w-full h-screen overflow-hidden bg-black">
        {/* Corner dots for decoration (matching your screenshots) */}
        <div className="absolute top-10 left-10 w-1 h-1 bg-white"></div>
        <div className="absolute top-10 right-10 w-1 h-1 bg-white"></div>
        <div className="absolute bottom-10 left-10 w-1 h-1 bg-white"></div>
        <div className="absolute bottom-10 right-10 w-1 h-1 bg-white"></div>
        
        {/* Center content */}
        <div className="container mx-auto h-full flex">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center h-full pt-16 pb-16">
            {/* 3D Visualization Column */}
            <div className="h-full flex items-center justify-center relative">
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

            {/* Content Column */}
            <div className="relative h-full flex flex-col justify-center">
              {/* Phase indicator */}
              <div className="absolute top-0 right-0 text-xs text-white/40 font-mono">
                [ PHASE {currentPhaseData.number} ]
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
                      <h2 className="text-4xl md:text-5xl font-light mb-6">{currentPhaseData.title}</h2>
                      {currentPhaseData.description && (
                        <p className="text-white/60 mb-10 font-mono text-sm max-w-lg">
                          {currentPhaseData.description}
                        </p>
                      )}
                      <div className="w-full h-px bg-white/10 mb-10"></div>
                    </div>

                    {/* Secondary items */}
                    <div className="space-y-10">
                      {currentPhaseData.secondaryItems.map((item, idx) => (
                        <div key={`item-${activePhase}-${idx}`}>
                          <h3 className="text-2xl md:text-3xl font-light mb-4">{item.title}</h3>
                          {item.description && (
                            <p className="text-white/60 font-mono text-sm max-w-lg">{item.description}</p>
                          )}
                        </div>
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
                      <h2 className="text-4xl md:text-5xl font-light mb-6">{nextPhaseData.title}</h2>
                      {nextPhaseData.description && (
                        <p className="text-white/60 mb-10 font-mono text-sm max-w-lg">
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
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                  className="absolute bottom-20 right-0 text-xs text-white/40 flex items-center"
                >
                  SCROLL TO EXPLORE <span className="ml-2">↓</span>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom info bar */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 py-4 bg-black/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
            <div className="flex items-center">
              <span className="text-xs text-white/60 mr-2">00:3</span>
              <span className="text-xs text-white/60">TECHNOLOGY</span>
            </div>
            <div className="flex items-center">
              <span className="text-xs text-white/60">O.XYZ — PHASE {activePhase}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}