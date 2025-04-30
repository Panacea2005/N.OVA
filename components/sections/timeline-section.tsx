"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export default function TimelineSection() {
  const timelineItems = [
    {
      phase: "PHASE 1",
      title: "Foundation",
      description: "Establishing core infrastructure and research foundations.",
      date: "Q2 2023",
      status: "Completed",
    },
    {
      phase: "PHASE 2",
      title: "Alpha Release",
      description: "Launch of initial platform capabilities and early access program.",
      date: "Q4 2023",
      status: "In Progress",
    },
    {
      phase: "PHASE 3",
      title: "Beta Expansion",
      description: "Scaling infrastructure and expanding feature set with community feedback.",
      date: "Q2 2024",
      status: "Upcoming",
    },
    {
      phase: "PHASE 4",
      title: "Global Launch",
      description: "Full public release with complete feature set and ecosystem integration.",
      date: "Q4 2024",
      status: "Planned",
    },
    {
      phase: "PHASE 5",
      title: "Ecosystem Growth",
      description: "Expansion of partner network and third-party integrations.",
      date: "Q2 2025",
      status: "Roadmap",
    },
  ]

  return (
    <section id="timeline" className="relative py-32">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-purple-950/20" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-sm uppercase tracking-[0.3em] mb-4 text-purple-300">Roadmap</h2>
          <h3 className="text-5xl md:text-7xl font-bold tracking-tighter mb-8">
            OUR{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-500">JOURNEY</span>
          </h3>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Charting our course toward a future of sovereign intelligence and technological advancement.
          </p>
        </motion.div>

        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-white/20 transform md:-translate-x-px" />

          {/* Timeline Items */}
          {timelineItems.map((item, index) => (
            <div key={item.phase} className="relative mb-16 last:mb-0">
              <div
                className={cn(
                  "flex flex-col md:flex-row items-start",
                  index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse",
                )}
              >
                {/* Timeline Dot */}
                <div className="absolute left-0 md:left-1/2 w-4 h-4 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 transform -translate-x-1/2 mt-1.5" />

                {/* Content */}
                <motion.div
                  className={cn("w-full md:w-1/2 pl-8 md:pl-0", index % 2 === 0 ? "md:pr-16" : "md:pl-16")}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  <div className="p-6 bg-white/5 backdrop-blur-md rounded-lg border border-white/10">
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-sm uppercase tracking-widest text-purple-300">{item.phase}</span>
                      <span
                        className={cn(
                          "px-2 py-1 text-xs rounded",
                          item.status === "Completed"
                            ? "bg-green-500/20 text-green-300"
                            : item.status === "In Progress"
                              ? "bg-blue-500/20 text-blue-300"
                              : "bg-white/10 text-white/70",
                        )}
                      >
                        {item.status}
                      </span>
                    </div>
                    <h4 className="text-2xl font-bold mb-2">{item.title}</h4>
                    <p className="text-white/70 mb-4">{item.description}</p>
                    <div className="text-sm text-white/50">{item.date}</div>
                  </div>
                </motion.div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
