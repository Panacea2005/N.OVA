"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight, Quote } from "lucide-react"

export default function TestimonialsSection() {
  const [current, setCurrent] = useState(0)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const testimonials = [
    {
      quote:
        "NOVA has completely transformed how we approach AI integration in our research. The capabilities are beyond anything we've seen before.",
      author: "Dr. Sarah Chen",
      title: "AI Research Director, Stanford University",
      image: "/placeholder.svg?height=100&width=100",
    },
    {
      quote:
        "The processing power and response time of NOVA's systems have given us a competitive edge that was previously unimaginable.",
      author: "Michael Rodriguez",
      title: "CTO, Quantum Dynamics",
      image: "/placeholder.svg?height=100&width=100",
    },
    {
      quote:
        "Working with sovereign intelligence has opened new frontiers in how we approach complex problem solving across multiple domains.",
      author: "Dr. James Wilson",
      title: "Lead Researcher, Global AI Initiative",
      image: "/placeholder.svg?height=100&width=100",
    },
  ]

  useEffect(() => {
    resetTimeout()
    timeoutRef.current = setTimeout(() => {
      setCurrent((prevIndex) => (prevIndex + 1) % testimonials.length)
    }, 8000)

    return () => {
      resetTimeout()
    }
  }, [current, testimonials.length])

  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }

  const nextSlide = () => {
    resetTimeout()
    setCurrent((prevIndex) => (prevIndex + 1) % testimonials.length)
  }

  const prevSlide = () => {
    resetTimeout()
    setCurrent((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length)
  }

  return (
    <section className="relative py-32">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-purple-950/20" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-sm uppercase tracking-[0.3em] mb-4 text-purple-300">Testimonials</h2>
          <h3 className="text-4xl md:text-5xl font-bold tracking-tighter mb-8">
            What{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-500">
              experts say
            </span>
          </h3>
        </motion.div>

        <div className="relative max-w-4xl mx-auto">
          <div className="absolute -top-12 -left-12 text-purple-500/20">
            <Quote size={80} />
          </div>

          <div className="overflow-hidden">
            <div className="relative h-[300px] md:h-[250px]">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center"
                  initial={{ opacity: 0, x: 100 }}
                  animate={{
                    opacity: current === index ? 1 : 0,
                    x: current === index ? 0 : current > index ? -100 : 100,
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <p className="text-xl md:text-2xl italic text-white/80 mb-8">"{testimonial.quote}"</p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full overflow-hidden mr-4 bg-white/10">
                      <img
                        src={testimonial.image || "/placeholder.svg"}
                        alt={testimonial.author}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-left">
                      <h4 className="font-bold">{testimonial.author}</h4>
                      <p className="text-sm text-white/60">{testimonial.title}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full ${current === index ? "bg-purple-500" : "bg-white/20"}`}
                onClick={() => setCurrent(index)}
              />
            ))}
          </div>

          <div className="absolute top-1/2 -left-12 -translate-y-1/2">
            <button
              onClick={prevSlide}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
          </div>

          <div className="absolute top-1/2 -right-12 -translate-y-1/2">
            <button
              onClick={nextSlide}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 transition-colors"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
