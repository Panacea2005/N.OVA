"use client"

import { motion } from "framer-motion"
import Image from "next/image"

export default function PartnersSection() {
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
    <section className="relative py-24">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-purple-950/20" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-sm uppercase tracking-[0.3em] mb-4 text-purple-300">Contributors</h2>
          <h3 className="text-4xl md:text-5xl font-bold tracking-tighter mb-8">
            Built by the{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-500">
              brightest minds
            </span>
          </h3>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Discover the world's first sovereign super intelligence, powered by contributors from:
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {partners.map((partner, index) => (
            <motion.div
              key={partner.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true, margin: "-50px" }}
              className="flex items-center justify-center p-6 bg-white/5 backdrop-blur-md rounded-lg border border-white/10 aspect-square"
            >
              <div className="relative w-full h-full">
                <Image
                  src={partner.logo || "/placeholder.svg"}
                  alt={partner.name}
                  fill
                  className="object-contain filter invert"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
