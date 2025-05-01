"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { useEffect, useState, useRef } from "react"

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const [mounted, setMounted] = useState(false)
  const footerRef = useRef<HTMLDivElement>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    setMounted(true)

    // Enhanced parallax effect on scroll with more elements
    const handleScroll = () => {
      if (!footerRef.current) return
      const scrollPosition = window.scrollY
      const footerPosition = footerRef.current.getBoundingClientRect().top + window.scrollY
      const distanceFromTop = scrollPosition - footerPosition
      
      if (scrollPosition > footerPosition - window.innerHeight) {
        // Multiple parallax layers with different speeds
        const elements = footerRef.current.querySelectorAll('.parallax-element')
        elements.forEach((element, index) => {
          const speed = 0.05 * (index + 1)
          const offset = distanceFromTop * speed
          // @ts-ignore
          element.style.transform = `translateY(${offset}px)`
        })
        
        // Opacity effect for grid lines
        const gridLines = footerRef.current.querySelectorAll('.grid-line')
        gridLines.forEach((line, index) => {
          const opacityBase = 0.1 + (index % 3) * 0.05
          const opacityChange = Math.min(0.2, distanceFromTop / 1000)
          // @ts-ignore
          line.style.opacity = Math.max(0, opacityBase + opacityChange)
        })
      }
    }
    
    // Interactive mouse follow effect
    const handleMouseMove = (e: MouseEvent) => {
      if (!footerRef.current) return
      const footerRect = footerRef.current.getBoundingClientRect()
      
      // Only apply effect when mouse is over footer
      if (e.clientY > footerRect.top && e.clientY < footerRect.bottom) {
        // Calculate relative mouse position within footer
        const x = e.clientX
        const y = e.clientY - footerRect.top
        
        setMousePosition({ x, y })
        
        // Apply subtle highlight effect where mouse is
        const glowElement = footerRef.current.querySelector('.mouse-glow')
        if (glowElement) {
          // @ts-ignore
          glowElement.style.left = `${x}px`
          // @ts-ignore
          glowElement.style.top = `${y}px`
          // @ts-ignore
          glowElement.style.opacity = '1'
        }
      } else {
        // Fade out glow when mouse leaves footer
        const glowElement = footerRef.current.querySelector('.mouse-glow')
        if (glowElement) {
          // @ts-ignore
          glowElement.style.opacity = '0'
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    window.addEventListener('mousemove', handleMouseMove)
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  if (!mounted) return null

  return (
    <motion.footer
      ref={footerRef}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      className="relative z-10 border-t border-white/10 overflow-hidden bg-gradient-to-b from-black via-black to-[#090012]"
    >
      {/* Enhanced background effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Futuristic grid lines */}
        <div className="absolute inset-0">
          {/* Horizontal grid lines */}
          {Array(20).fill(0).map((_, i) => (
            <div 
              key={`h-grid-${i}`} 
              className="grid-line absolute w-full h-[1px] bg-purple-700/5"
              style={{ 
                top: `${(i * 5) + 2}%`,
                opacity: 0.05 + (i % 5) * 0.01,
                left: 0
              }}
            />
          ))}
          
          {/* Vertical grid lines */}
          {Array(20).fill(0).map((_, i) => (
            <div 
              key={`v-grid-${i}`} 
              className="grid-line absolute h-full w-[1px] bg-purple-700/5"
              style={{ 
                left: `${(i * 5) + 2}%`,
                opacity: 0.05 + (i % 4) * 0.01,
                top: 0
              }}
            />
          ))}
        </div>
        
        {/* Main radial gradient background - more dramatic */}
        <div 
          className="parallax-element absolute w-[150%] h-[150%] left-[-25%] top-[-25%]" 
          style={{
            background: "radial-gradient(circle, rgba(130,45,220,0.15) 0%, rgba(88,28,135,0.12) 20%, rgba(76,29,149,0.08) 40%, rgba(45,20,60,0.05) 60%, rgba(0,0,0,0) 80%)",
            transform: "translateY(0px)"
          }}
        />
        
        {/* Secondary smaller, brighter gradient */}
        <div 
          className="parallax-element absolute w-[120%] h-[120%] left-[-10%] top-[10%]" 
          style={{
            background: "radial-gradient(circle, rgba(168,85,247,0.1) 0%, rgba(139,92,246,0.07) 30%, rgba(0,0,0,0) 70%)",
            transform: "translateY(0px)"
          }}
        />
        
        {/* Mouse follow glow effect */}
        <div 
          className="mouse-glow absolute w-[300px] h-[300px] pointer-events-none transition-opacity duration-700"
          style={{
            background: "radial-gradient(circle, rgba(168,85,247,0.15) 0%, rgba(139,92,246,0.05) 40%, rgba(0,0,0,0) 70%)",
            borderRadius: "50%",
            transform: "translate(-50%, -50%)",
            left: mousePosition.x,
            top: mousePosition.y,
            opacity: 0
          }}
        />
        
        {/* Enhanced floating particles - more varied */}
        <div className="absolute inset-0">
          {Array(30).fill(0).map((_, i) => {
            // Determine if particle should be a dot or line
            const isLine = i % 5 === 0
            const size = isLine ? { width: '3px', height: '1px' } : { width: `${1 + Math.random() * 2}px`, height: `${1 + Math.random() * 2}px` }
            
            return (
              <motion.div
                key={`particle-${i}`}
                className="absolute bg-white/20 rounded-full parallax-element"
                style={{
                  ...size,
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  opacity: 0.3 + Math.random() * 0.7,
                  boxShadow: i % 7 === 0 ? '0 0 3px rgba(168,85,247,0.8)' : 'none',
                  background: i % 10 === 0 ? 'rgba(168,85,247,0.6)' : 'rgba(255,255,255,0.3)'
                }}
                animate={{
                  y: [0, -20 - Math.random() * 30, 0],
                  opacity: [0, 0.7 + Math.random() * 0.3, 0],
                  scale: i % 8 === 0 ? [1, 1.5, 1] : [1, 1, 1]
                }}
                transition={{
                  duration: 5 + Math.random() * 5,
                  repeat: Infinity,
                  delay: Math.random() * 5,
                }}
              ></motion.div>
            )
          })}
        </div>
        
        {/* Animated accent lines - more dramatic */}
        <div className="absolute inset-0">
          <motion.div 
            className="absolute top-0 left-0 w-full h-[1px] parallax-element"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(168,85,247,0.4) 50%, transparent 100%)',
            }}
            animate={{
              left: ['-100%', '100%']
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          
          <motion.div 
            className="absolute top-[30%] right-0 w-full h-[1px] parallax-element"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(139,92,246,0.3) 50%, transparent 100%)',
            }}
            animate={{
              right: ['-100%', '100%']
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          
          <motion.div 
            className="absolute bottom-[20%] left-0 w-full h-[1px] parallax-element"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(168,85,247,0.3) 50%, transparent 100%)',
            }}
            animate={{
              left: ['-100%', '100%']
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
              delay: 5
            }}
          />
        </div>
      </div>

      {/* Full width content layout */}
      <div className="w-full py-20 md:py-32 relative z-10">
        {/* Email and social links section - improved layout */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-20 px-6 md:px-12 lg:px-20 max-w-screen-2xl mx-auto">
          {/* Left section with email */}
          <div className="mb-10 md:mb-0 text-left">
            <span className="text-sm uppercase text-white/70 tracking-wider block mb-2">CONTACT</span>
            <Link 
              href="mailto:contact@o.xyz" 
              className="group text-sm text-white/80 hover:text-white relative inline-block"
            >
              <span>contact@n.ova</span>
              <span className="absolute left-0 right-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-purple-400 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
            </Link>
          </div>
          
          {/* Center section kept empty for spacing */}
          <div className="hidden md:block"></div>

          {/* Right section with enhanced social links */}
          <div className="flex flex-wrap justify-center md:justify-end gap-5 md:gap-8">
            {[
              { name: "X", icon: "✕" },
              { name: "DISCORD", icon: "◆" },
              { name: "TELEGRAM", icon: "◇" },
              { name: "BLOG", icon: "○" }
            ].map((platform) => (
              <Link
                key={platform.name}
                href="#"
                className="text-sm uppercase tracking-widest text-white/70 hover:text-white group relative"
              >
                <span className="flex items-center gap-2">
                  <span className="text-purple-400 opacity-80 group-hover:opacity-100 transition-opacity">
                    {platform.icon}
                  </span>
                  <span>{platform.name}</span>
                </span>
                <span className="absolute left-0 right-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-purple-400 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
              </Link>
            ))}
          </div>
        </div>
        
        {/* Ultra-dramatic full width logo */}
        <motion.div 
          className="relative w-full overflow-hidden py-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.2 }}
          viewport={{ once: true }}
        >
          {/* Logo wrapper */}
          <div className="relative w-full flex flex-col items-center justify-center">
            {/* Subtle purple glow behind the logo */}
            <div 
              className="absolute left-1/2 top-1/2 w-[70%] max-w-5xl h-40 -translate-x-1/2 -translate-y-1/2 parallax-element"
              style={{
                background: 'radial-gradient(ellipse, rgba(168,85,247,0.15) 0%, rgba(88,28,135,0.05) 50%, transparent 80%)',
                borderRadius: '50%',
                filter: 'blur(40px)',
                transform: 'translateY(0px)'
              }}
            />
            
            {/* Full width logo SVG with enhanced effects */}
            <svg 
              viewBox="0 0 1200 300" 
              className="w-full max-w-[95vw] max-h-[40vh]"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                {/* Enhanced gradient with more complex color transitions */}
                <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="20%" stopColor="#f0f0f0" />
                  <stop offset="50%" stopColor="#e0e0e0" />
                  <stop offset="80%" stopColor="#f0f0f0" />
                  <stop offset="100%" stopColor="#ffffff" />
                </linearGradient>
                
                {/* Animating light effect */}
                <linearGradient id="shimmerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(255,255,255,0)" />
                  <stop offset="10%" stopColor="rgba(255,255,255,0)" />
                  <stop offset="15%" stopColor="rgba(255,255,255,0.5)" />
                  <stop offset="20%" stopColor="rgba(255,255,255,0)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                  <animateTransform
                    attributeName="gradientTransform"
                    type="translate"
                    from="-1 0"
                    to="1 0"
                    dur="3s"
                    repeatCount="indefinite"
                  />
                </linearGradient>
                
                {/* Thin futuristic outline */}
                <filter id="outlineGlow" x="-10%" y="-10%" width="120%" height="120%">
                  <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
                  <feFlood floodColor="#a855f7" floodOpacity="0.5" result="color" />
                  <feComposite in="color" in2="blur" operator="in" result="shadow" />
                  <feComposite in="SourceGraphic" in2="shadow" operator="over" />
                </filter>
                
                {/* Overlay mask for shimmer effect */}
                <mask id="textMask">
                  <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="white"
                    style={{
                      fontFamily: "monospace",
                      fontWeight: "bold",
                      fontSize: "350px",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    N.OVA
                  </text>
                </mask>
              </defs>
              
              {/* Deep shadow layer for enhanced depth */}
              <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="middle"
                fill="rgba(88,28,135,0.2)"
                style={{
                  fontFamily: "monospace",
                  fontWeight: "bold",
                  fontSize: "350px",
                  letterSpacing: "-0.02em",
                  transform: "translateY(6px)",
                }}
                filter="blur(10px)"
              >
                N.OVA
              </text>
              
              {/* Medium shadow layer for enhanced depth */}
              <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="middle"
                fill="rgba(76,29,149,0.3)"
                style={{
                  fontFamily: "monospace",
                  fontWeight: "bold",
                  fontSize: "350px",
                  letterSpacing: "-0.02em",
                  transform: "translateY(3px)",
                }}
                filter="blur(5px)"
              >
                N.OVA
              </text>
              
              {/* Main text with gradient fill */}
              <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="middle"
                fill="url(#logoGradient)"
                style={{
                  fontFamily: "monospace",
                  fontWeight: "bold",
                  fontSize: "350px",
                  letterSpacing: "-0.02em",
                }}
                filter="url(#outlineGlow)"
              >
                N.OVA
              </text>
              
              {/* Animated shimmer overlay */}
              <rect 
                x="0" 
                y="0" 
                width="100%" 
                height="100%" 
                fill="url(#shimmerGradient)"
                mask="url(#textMask)"
              />
            </svg>
            
            {/* Subtle scanning line animation */}
            <motion.div
              className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"
              animate={{ top: ["0%", "100%"] }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                ease: "linear",
                repeatType: "reverse"
              }}
            />
          </div>
        </motion.div>

        {/* Enhanced copyright section with animated accents */}
        <motion.div 
          className="mt-16 pt-6 flex justify-between items-center flex-col md:flex-row max-w-screen-2xl mx-auto px-6 md:px-12 lg:px-20 border-t border-white/5 relative"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          viewport={{ once: true }}
        >
          {/* Copyright text with futuristic brackets */}
          <p className="text-xs text-white/40 tracking-wider mb-4 md:mb-0">
            <span className="inline-block mr-1 text-purple-400/60">[</span>
            <span>C</span>
            <span className="inline-block ml-1 text-purple-400/60">]</span>
            <span>{currentYear}. ALL RIGHTS RESERVED.</span>
          </p>
          
          {/* Additional futuristic elements */}
          <div className="flex items-center space-x-4">
            <div className="w-6 h-[1px] bg-gradient-to-r from-transparent via-purple-500/20 to-transparent"></div>
            <div className="w-2 h-2 rounded-full bg-purple-500/20"></div>
            <div className="w-10 h-[1px] bg-gradient-to-r from-transparent via-purple-500/20 to-transparent"></div>
          </div>
        </motion.div>
      </div>
    </motion.footer>
  )
}