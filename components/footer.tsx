"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { useEffect, useState, useRef } from "react"

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const [mounted, setMounted] = useState(false)
  const footerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)

    // Add parallax effect on scroll
    const handleScroll = () => {
      if (!footerRef.current) return
      const scrollPosition = window.scrollY
      const footerPosition = footerRef.current.getBoundingClientRect().top + window.scrollY
      const offset = (scrollPosition - footerPosition) * 0.1
      
      if (scrollPosition > footerPosition - window.innerHeight) {
        const gradientElement = footerRef.current.querySelector('.bg-gradient')
        if (gradientElement) {
          // @ts-ignore
          gradientElement.style.transform = `translateY(${offset}px)`
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!mounted) return null

  return (
    <motion.footer
      ref={footerRef}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      className="relative z-10 border-t border-white/10 overflow-hidden"
    >
      {/* Dramatic purple gradient background with animated glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Main gradient background */}
        <div 
          className="bg-gradient absolute w-[200%] h-[200%] left-[-50%] top-[-100%] rounded-[50%]" 
          style={{
            background: "radial-gradient(circle, rgba(168,85,247,0.3) 0%, rgba(124,58,237,0.25) 20%, rgba(88,28,135,0.2) 40%, rgba(76,29,149,0.15) 60%, rgba(0,0,0,0) 80%)",
          }}
        />
        
        {/* Additional animated glow effects */}
        <div className="absolute inset-0 opacity-60">
          <div className="absolute top-0 left-[10%] w-[80%] h-[1px] bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>
          <div className="absolute bottom-[40%] left-[5%] w-[90%] h-[1px] bg-gradient-to-r from-transparent via-purple-400/20 to-transparent"></div>
        </div>
        
        {/* Floating particles effect */}
        <div className="absolute inset-0">
          {Array(20).fill(0).map((_, i) => (
            <motion.div
              key={`particle-${i}`}
              className="absolute w-1 h-1 bg-white/20 rounded-full"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -15, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 5,
              }}
            ></motion.div>
          ))}
        </div>
      </div>

      {/* Full width layout with no constraints */}
      <div className="w-full py-16 md:py-24 relative z-10">
        {/* Email and social links section */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-16 px-8 md:px-16 max-w-screen-2xl mx-auto">
          {/* Left section with email */}
          <div className="mb-10 md:mb-0 text-left">
            <span className="text-sm uppercase text-white/70 tracking-wider block mb-2">EMAIL</span>
            <Link href="mailto:contact@o.xyz" className="text-sm text-white/80 hover:text-white transition-colors">
              contact@o.xyz
            </Link>
          </div>
          
          {/* Center section kept empty for spacing */}
          <div className="hidden md:block"></div>

          {/* Right section with social links */}
          <div className="flex items-center space-x-8">
            {["X", "DISCORD", "TELEGRAM", "BLOG"].map((platform) => (
              <Link
                key={platform}
                href="#"
                className="text-sm uppercase tracking-widest text-white/70 hover:text-white transition-colors"
              >
                [{platform}]
              </Link>
            ))}
          </div>
        </div>
        
        {/* Main logo area - dramatic full viewport width */}
        <motion.div 
          className="flex flex-col items-center justify-center mb-24 md:mb-32"
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, type: "spring", stiffness: 50 }}
          viewport={{ once: true }}
        >
          {/* Ultra-massive O.XYZ Logo */}
          <div className="w-screen overflow-hidden py-8">
            <div className="w-full flex items-center justify-center">
              {/* Outer glow effect */}
              <div className="relative">
                {/* SVG with dramatic sizing */}
                <svg 
                  viewBox="0 0 1200 300" 
                  className="w-screen max-h-[35vh]" 
                  style={{ 
                    maxWidth: "100vw", 
                    filter: "drop-shadow(0 0 20px rgba(168,85,247,0.2))",
                  }}
                  preserveAspectRatio="xMidYMid meet"
                >
                  <defs>
                    {/* Dramatic gradient with light effects */}
                    <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="50%" stopColor="#f8f8f8" />
                      <stop offset="100%" stopColor="#f0f0f0" />
                    </linearGradient>
                    
                    {/* Subtle texture overlay */}
                    <filter id="textureFilter" x="0%" y="0%" width="100%" height="100%">
                      <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="3" result="noise" />
                      <feDisplacementMap in="SourceGraphic" in2="noise" scale="5" />
                    </filter>
                  </defs>
                  
                  {/* Shadow layer for depth */}
                  <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="rgba(76,29,149,0.1)"
                    style={{
                      fontFamily: "monospace",
                      fontWeight: "bold",
                      fontSize: "350px",
                      letterSpacing: "-0.02em",
                      transform: "translateY(4px)",
                    }}
                    filter="blur(8px)"
                  >
                    O.XYZ
                  </text>
                  
                  {/* Main text */}
                  <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="url(#logoGradient)"
                    style={{
                      fontFamily: "monospace",
                      fontWeight: "bold",
                      fontSize: "350px", // Massive size
                      letterSpacing: "-0.02em",
                    }}
                  >
                    O.XYZ
                  </text>
                </svg>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Copyright section */}
        <motion.div 
          className="mt-8 border-t border-white/10 pt-6 flex justify-start max-w-screen-2xl mx-auto px-8 md:px-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          viewport={{ once: true }}
        >
          <p className="text-xs text-white/40 tracking-wider">[C]{currentYear}. ALL RIGHTS RESERVED.</p>
        </motion.div>
      </div>
    </motion.footer>
  )
}