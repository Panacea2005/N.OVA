"use client"

import { useEffect, useState, useRef, Suspense } from "react"
import { motion, AnimatePresence } from "framer-motion"
import dynamic from "next/dynamic"
import LoadingScreen from "@/components/loading-screen"
import { Canvas } from "@react-three/fiber"
import { Environment } from "@react-three/drei"
import Link from "next/link"
import { usePhantom } from "@/hooks/use-phantom"
import { ConnectWalletButton } from "@/components/ui/connect-wallet-button"

// Dynamically import components to reduce initial load time
const Navigation = dynamic(() => import("@/components/navigation"), {
  ssr: false,
  loading: () => <div className="h-16" />,
})

const Footer = dynamic(() => import("@/components/footer"), {
  ssr: false,
  loading: () => <div className="h-16" />,
})

const ParticleBackground = dynamic(() => import("@/components/3d/particle-background"), {
  ssr: false,
})

const ScrollProgress = dynamic(() => import("@/components/ui/scroll-progress"), {
  ssr: false,
})

// Dynamically import 3D models
const ParticleRing = dynamic(() => import("@/components/3d/particle-ring"), {
  ssr: false,
})

const HolographicSphere = dynamic(() => import("@/components/3d/holographic-sphere"), {
  ssr: false,
})

const TechnologySection = dynamic(() => import("@/components/sections/technology-section"), {
  ssr: false,
})

const TimelineSection = dynamic(() => import("@/components/sections/timeline-section"), {
  ssr: false,
})

export default function Home() {
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const { isConnected } = usePhantom()

  useEffect(() => {
    // Simulate loading assets
    const timer = setTimeout(() => {
      setLoading(false)
    }, 3000)

    setMounted(true)

    return () => clearTimeout(timer)
  }, [])

  if (!mounted) return null

  if (!isConnected) {
    return (
      <main className="relative min-h-screen bg-black text-white font-mono">
        <div className="fixed inset-0 bg-gradient-to-br from-black via-black to-purple-950 opacity-80 z-0" />
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
          <h1 className="text-4xl font-bold mb-8">Welcome to NOVA</h1>
          <p className="text-xl text-gray-400 mb-8">Connect your Phantom wallet to get started</p>
          <ConnectWalletButton />
        </div>
      </main>
    )
  }

  const partners = [
    { name: "Stanford", logo: "/placeholder.svg?height=80&width=80" },
    { name: "Neuralink", logo: "/placeholder.svg?height=80&width=80" },
    { name: "Apple", logo: "/placeholder.svg?height=80&width=80" },
    { name: "Google", logo: "/placeholder.svg?height=80&width=80" },
    { name: "Amazon", logo: "/placeholder.svg?height=80&width=80" },
    { name: "NASA", logo: "/placeholder.svg?height=80&width=80" },
    { name: "PayPal", logo: "/placeholder.svg?height=80&width=80" },
    { name: "Ethereum", logo: "/placeholder.svg?height=80&width=80" },
  ]

  return (
    <main className="relative min-h-screen bg-black text-white font-mono">
      {/* Loading Screen */}
      <AnimatePresence>{loading && <LoadingScreen />}</AnimatePresence>

      {/* Background Gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-black via-black to-purple-950 opacity-80 z-0" />

      {/* Particle Background */}
      <ParticleBackground />

      {/* Scroll Progress Indicator */}
      <ScrollProgress />

      {/* Navigation */}
      <Navigation />

      {/* Main Content */}
      <div className="relative z-10" ref={containerRef}>
        {/* Hero Section */}
        <section className="min-h-screen flex flex-col justify-center relative">
          <div className="container mx-auto px-4 md:px-6 py-20">
            <div className="flex flex-col items-center">
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                className="text-[10rem] md:text-[15rem] lg:text-[20rem] font-bold tracking-tighter leading-none text-center"
              >
                ONCHAIN AI
              </motion.h1>

              <div className="absolute inset-0 z-0 pointer-events-none">
                <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                  <Suspense fallback={null}>
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} />
                    <HolographicSphere />
                  </Suspense>
                </Canvas>
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 py-4">
            <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
              <div className="flex items-center">
                <span className="text-xs text-white/60 mr-2">00:1</span>
                <span className="text-xs text-white/60 mr-2">O.XYZ</span>
                <span className="text-xs text-white/60">SOVEREIGN SUPER AI</span>
              </div>
              <div className="flex items-center">
                <span className="text-xs text-white/60">O.XYZ — SOVEREIGN SUPER AI</span>
              </div>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section id="mission" className="min-h-screen flex flex-col justify-center relative border-t border-white/10">
          <div className="container mx-auto px-4 md:px-6 py-20">
            <div className="flex flex-col items-center">
              <motion.h2
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 1 }}
                viewport={{ once: true }}
                className="text-[5rem] md:text-[8rem] lg:text-[10rem] font-bold tracking-tighter leading-none text-center mb-8"
              >
                OUR OBJECTIVE:
                <br />
                EMPOWER HUMANITY
              </motion.h2>

              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.3 }}
                viewport={{ once: true }}
                className="text-xl md:text-2xl text-white/70 max-w-3xl text-center"
              >
                O.XYZ exists to create a future where super intelligence serves humanity, not controls it.
              </motion.p>

              <div className="absolute inset-0 z-0 pointer-events-none">
                <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                  <Suspense fallback={null}>
                    <ParticleRing />
                    <Environment preset="night" />
                  </Suspense>
                </Canvas>
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 py-4">
            <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
              <div className="flex items-center">
                <span className="text-xs text-white/60 mr-2">00:2</span>
                <span className="text-xs text-white/60">MISSION OVERVIEW</span>
              </div>
              <div className="flex items-center">
                <span className="text-xs text-white/60">O.XYZ — MORE THAN JUST AN AI</span>
              </div>
            </div>
          </div>
        </section>

        {/* Technology Section */}
        <TechnologySection />

        {/* Timeline Section */}
        <TimelineSection />

        {/* Roadmap Section */}

        {/* Ecosystem Section */}
        <section id="ecosystem" className="min-h-screen flex flex-col justify-center relative border-t border-white/10">
          <div className="container mx-auto px-4 md:px-6 py-20">
            <div className="flex flex-col items-center mb-20">
              <motion.h2
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 1 }}
                viewport={{ once: true }}
                className="text-[4rem] md:text-[6rem] lg:text-[8rem] font-bold tracking-tighter leading-none text-center mb-8"
              >
                INTRODUCING
                <br />
                THE O.XYZ
                <br />
                ECOSYSTEM
              </motion.h2>

              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.3 }}
                viewport={{ once: true }}
                className="text-xl md:text-2xl text-white/70 max-w-3xl text-center"
              >
                From fractional ownership of real-world assets to transparent ecosystem analytics, O.XYZ is driving the
                future of decentralized AI through a suite of revolutionary products.
              </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
              <div className="border border-white/10 p-8">
                <h3 className="text-2xl font-bold mb-4">O.AGENTS</h3>
                <h4 className="text-4xl font-bold mb-6">Become an AI Agent</h4>
                <p className="text-white/70 mb-8">
                  Get involved, contribute your ideas, and earn exclusive rewards as we build something revolutionary
                  together.
                </p>
                <div className="text-sm uppercase tracking-widest text-white/40">COMING SOON</div>
              </div>

              <div className="border border-white/10 p-8">
                <img src="/placeholder.svg?height=300&width=500" alt="Dashboard" className="w-full h-auto" />
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 py-4">
            <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
              <div className="flex items-center">
                <span className="text-xs text-white/60 mr-2">00:4</span>
                <span className="text-xs text-white/60">ECOSYSTEM</span>
              </div>
              <div className="flex items-center">
                <span className="text-xs text-white/60">O.XYZ — PRODUCTS</span>
              </div>
            </div>
          </div>
        </section>

        {/* Partners Section */}
        <section className="py-24 relative border-t border-white/10">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-[4rem] md:text-[5rem] font-bold tracking-tighter mb-8">
                Built by the brightest minds
              </h2>
              <p className="text-lg text-white/70 max-w-2xl mx-auto">
                Discover the world's first sovereign super intelligence, powered by contributors from:
              </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
              {partners.map((partner, index) => (
                <motion.div
                  key={partner.name}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true, margin: "-50px" }}
                  className="flex items-center justify-center p-6 border border-white/10 aspect-square"
                >
                  <div className="relative w-full h-full">
                    <img
                      src={partner.logo || "/placeholder.svg"}
                      alt={partner.name}
                      className="object-contain filter invert"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 relative border-t border-white/10">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              className="max-w-4xl mx-auto text-center"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-7xl md:text-8xl font-bold tracking-tighter mb-8">JOIN THE REVOLUTION</h2>

              <p className="text-xl md:text-2xl text-white/70 mb-12 max-w-2xl mx-auto">
                Be part of the future where sovereign intelligence empowers humanity. Sign up now for early access.
              </p>

              <Link
                href="#"
                className="px-8 py-4 bg-white text-black text-lg uppercase tracking-widest hover:bg-white/90 transition-colors inline-block"
              >
                Get Early Access
              </Link>
            </motion.div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <Footer />
    </main>
  )
}
