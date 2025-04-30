"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import dynamic from "next/dynamic"
import { Canvas } from "@react-three/fiber"
import { Environment } from "@react-three/drei"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

const Navigation = dynamic(() => import("@/components/navigation"), {
  ssr: false,
})

const Footer = dynamic(() => import("@/components/footer"), {
  ssr: false,
})

const ParticleBackground = dynamic(() => import("@/components/3d/particle-background"), {
  ssr: false,
})

const HolographicSphere = dynamic(() => import("@/components/3d/holographic-sphere"), {
  ssr: false,
})

const WireframeCube = dynamic(() => import("@/components/3d/wireframe-cube"), {
  ssr: false,
})

export default function AboutPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const team = [
    {
      name: "Dr. Alexandra Chen",
      role: "Chief AI Architect",
      bio: "Former lead researcher at DeepMind with over 15 years of experience in artificial general intelligence.",
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      name: "Marcus Reynolds",
      role: "Quantum Computing Director",
      bio: "Pioneered quantum neural networks at MIT and led quantum computing initiatives at Google X.",
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      name: "Dr. Sophia Nakamura",
      role: "Ethics & Governance Lead",
      bio: "Internationally recognized expert in AI ethics with advisory roles at the UN and IEEE.",
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      name: "Jamal Washington",
      role: "Infrastructure Architect",
      bio: "Designed resilient systems for NASA and SpaceX before joining O.XYZ to build sovereign infrastructure.",
      image: "/placeholder.svg?height=300&width=300",
    },
  ]

  const timeline = [
    {
      year: "2020",
      title: "Foundation",
      description:
        "O.XYZ was founded by a collective of AI researchers, ethicists, and engineers committed to developing sovereign intelligence.",
    },
    {
      year: "2021",
      title: "Core Research",
      description: "Breakthrough in neural architecture search and quantum-inspired computing models.",
    },
    {
      year: "2022",
      title: "Infrastructure Development",
      description: "Launch of distributed computing network across 7 continents with unprecedented resilience.",
    },
    {
      year: "2023",
      title: "Alpha Release",
      description:
        "First closed ecosystem test with 500 selected participants demonstrating sovereign decision making.",
    },
    {
      year: "2024",
      title: "O.DAO Formation",
      description: "Decentralized governance structure established to ensure alignment with human values.",
    },
    {
      year: "2025",
      title: "Global Launch",
      description: "Projected public release of O.XYZ ecosystem with full feature set.",
    },
  ]

  return (
    <main className="relative min-h-screen bg-black text-white font-mono">
      {/* Background Gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-black via-black to-purple-950 opacity-80 z-0" />

      {/* Particle Background */}
      <ParticleBackground />

      {/* Navigation */}
      <Navigation />

      {/* Main Content */}
      <div className="relative z-10 pt-20">
        {/* Hero Section */}
        <section className="min-h-[70vh] flex flex-col justify-center relative border-b border-white/10">
          <div className="container mx-auto px-4 md:px-6 py-20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div>
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                  className="flex flex-col"
                >
                  <h1 className="text-[5rem] md:text-[7rem] font-bold tracking-tighter leading-none mb-8">
                    ABOUT O.XYZ
                  </h1>

                  <p className="text-xl text-white/70 mb-6">
                    O.XYZ is pioneering the development of sovereign super intelligence - AI systems that serve humanity
                    while maintaining independence from centralized control.
                  </p>

                  <p className="text-xl text-white/70 mb-8">
                    Our mission is to ensure that advanced AI remains aligned with human values while pushing the
                    boundaries of what's possible in artificial intelligence.
                  </p>
                </motion.div>
              </div>

              <div className="h-[60vh]">
                <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                  <HolographicSphere />
                  <Environment preset="night" />
                </Canvas>
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 py-4">
            <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
              <div className="flex items-center">
                <span className="text-xs text-white/60 mr-2">01:1</span>
                <span className="text-xs text-white/60">ABOUT</span>
              </div>
              <div className="flex items-center">
                <span className="text-xs text-white/60">O.XYZ — OUR STORY</span>
              </div>
            </div>
          </div>
        </section>

        {/* Philosophy Section */}
        <section className="py-24 relative border-b border-white/10">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto">
              <motion.h2
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="text-4xl md:text-5xl font-bold mb-12"
              >
                OUR PHILOSOPHY
              </motion.h2>

              <div className="space-y-12">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                  className="flex flex-col md:flex-row gap-8"
                >
                  <div className="md:w-1/4">
                    <h3 className="text-2xl font-bold mb-2">Sovereignty</h3>
                  </div>
                  <div className="md:w-3/4">
                    <p className="text-white/70">
                      We believe AI systems should operate independently from centralized control, with transparent
                      governance and distributed ownership. This ensures no single entity can monopolize or weaponize
                      advanced intelligence.
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  viewport={{ once: true }}
                  className="flex flex-col md:flex-row gap-8"
                >
                  <div className="md:w-1/4">
                    <h3 className="text-2xl font-bold mb-2">Alignment</h3>
                  </div>
                  <div className="md:w-3/4">
                    <p className="text-white/70">
                      Our systems are designed with human values at their core. We implement rigorous alignment
                      techniques to ensure AI goals remain compatible with human flourishing and well-being.
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  viewport={{ once: true }}
                  className="flex flex-col md:flex-row gap-8"
                >
                  <div className="md:w-1/4">
                    <h3 className="text-2xl font-bold mb-2">Transparency</h3>
                  </div>
                  <div className="md:w-3/4">
                    <p className="text-white/70">
                      We maintain open protocols and transparent decision-making processes. Our code, governance, and
                      development roadmap are publicly accessible and subject to community oversight.
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-24 relative border-b border-white/10">
          <div className="container mx-auto px-4 md:px-6">
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold mb-16 text-center"
            >
              CORE TEAM
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {team.map((member, index) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="border border-white/10 p-6"
                >
                  <div className="aspect-square mb-6 overflow-hidden">
                    <img
                      src={member.image || "/placeholder.svg"}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                  <p className="text-purple-400 mb-4">{member.role}</p>
                  <p className="text-white/60 text-sm">{member.bio}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="py-24 relative border-b border-white/10">
          <div className="container mx-auto px-4 md:px-6">
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold mb-16 text-center"
            >
              OUR JOURNEY
            </motion.h2>

            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-0 md:left-[100px] top-0 bottom-0 w-px bg-white/20" />

              {/* Timeline Items */}
              <div className="space-y-16">
                {timeline.map((item, index) => (
                  <motion.div
                    key={item.year}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex flex-col md:flex-row gap-8 md:gap-16 relative"
                  >
                    <div className="md:w-[100px] font-bold text-2xl">
                      {item.year}
                      <div className="absolute left-0 md:left-[100px] w-3 h-3 rounded-full bg-white transform -translate-x-1.5 mt-2" />
                    </div>
                    <div className="flex-1 md:pl-8">
                      <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                      <p className="text-white/70">{item.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 relative">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              className="max-w-4xl mx-auto text-center"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-8">JOIN OUR MISSION</h2>

              <p className="text-xl text-white/70 mb-12 max-w-2xl mx-auto">
                We're building the future of sovereign intelligence and we need brilliant minds to help us shape it.
              </p>

              <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
                <Link
                  href="#"
                  className="px-8 py-4 bg-white text-black text-lg uppercase tracking-widest hover:bg-white/90 transition-colors inline-block"
                >
                  Join Our Team
                </Link>

                <Link href="#" className="group flex items-center text-lg font-medium">
                  <span className="relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-white after:origin-left after:scale-x-0 group-hover:after:scale-x-100 after:transition-transform after:duration-300">
                    Contact Us
                  </span>
                  <ArrowRight className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <Footer />
    </main>
  )
}
