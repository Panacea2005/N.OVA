"use client"

import { motion } from "framer-motion"
import { Cpu, Globe, Shield, Zap, Code, BarChart3 } from "lucide-react"
import GlassmorphicCard from "@/components/ui/glassmorphic-card"

export default function FeaturesGrid() {
  const features = [
    {
      title: "Quantum Processing",
      description: "Leveraging quantum computing principles for unprecedented processing capabilities.",
      icon: <Cpu className="h-8 w-8" />,
      color: "from-purple-500 to-blue-500",
    },
    {
      title: "Global Network",
      description: "Distributed infrastructure across continents ensuring maximum uptime and resilience.",
      icon: <Globe className="h-8 w-8" />,
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Advanced Security",
      description: "Military-grade encryption and multi-layered security protocols protect all data.",
      icon: <Shield className="h-8 w-8" />,
      color: "from-cyan-500 to-emerald-500",
    },
    {
      title: "Lightning Speed",
      description: "Ultra-low latency responses with real-time processing capabilities.",
      icon: <Zap className="h-8 w-8" />,
      color: "from-emerald-500 to-yellow-500",
    },
    {
      title: "Open Source Core",
      description: "Transparent, community-driven development with open source foundations.",
      icon: <Code className="h-8 w-8" />,
      color: "from-yellow-500 to-orange-500",
    },
    {
      title: "Advanced Analytics",
      description: "Real-time data visualization and predictive modeling capabilities.",
      icon: <BarChart3 className="h-8 w-8" />,
      color: "from-orange-500 to-red-500",
    },
  ]

  return (
    <section id="features" className="relative py-32">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-purple-950/20" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-sm uppercase tracking-[0.3em] mb-4 text-purple-300">Features</h2>
          <h3 className="text-5xl md:text-7xl font-bold tracking-tighter mb-8">
            CUTTING-EDGE{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-500">
              TECHNOLOGY
            </span>
          </h3>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Our platform leverages the most advanced technologies to deliver unparalleled performance and capabilities.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true, margin: "-50px" }}
            >
              <GlassmorphicCard
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
                gradient={feature.color}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
