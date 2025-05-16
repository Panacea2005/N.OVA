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

    // Enhanced effect on scroll
    const handleScroll = () => {
      if (!footerRef.current) return
      const scrollPosition = window.scrollY
      const footerPosition = footerRef.current.getBoundingClientRect().top + window.scrollY
      
      if (scrollPosition > footerPosition - window.innerHeight) {
        const parallaxElements = footerRef.current.querySelectorAll('.parallax-element')
        parallaxElements.forEach((element, index) => {
          const speed = 0.05 * (index + 1)
          const offset = (scrollPosition - (footerPosition - window.innerHeight)) * speed
          // @ts-ignore
          element.style.transform = `translateY(${offset}px)`
        })
      }
    }
    
    // Mouse effect
    const handleMouseMove = (e: MouseEvent) => {
      if (!footerRef.current) return
      const footerRect = footerRef.current.getBoundingClientRect()
      
      if (e.clientY > footerRect.top && e.clientY < footerRect.bottom) {
        setMousePosition({ x: e.clientX, y: e.clientY - footerRect.top })
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
      className="relative z-10 bg-black text-white overflow-hidden"
    >
      {/* Enhanced gradient background - more impressive, next level */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        {/* Main gradient dome with enhanced colors and opacity */}
        <div
          className="absolute w-[200%] h-[200%] left-[-50%] top-[-100%]"
          style={{
            background: "radial-gradient(ellipse at center, rgba(168,85,247,0.6) 0%, rgba(139,92,246,0.4) 15%, rgba(88,28,135,0.2) 30%, rgba(0,0,0,0) 60%)",
            borderRadius: "50%",
            filter: "blur(10px)",
          }}
        />
        
        {/* Secondary pulsing gradient for enhanced effect */}
        <motion.div
          className="absolute w-[180%] h-[180%] left-[-40%] top-[-90%]"
          style={{
            background: "radial-gradient(ellipse at center, rgba(191,97,255,0.5) 0%, rgba(145,81,245,0.3) 20%, rgba(0,0,0,0) 60%)",
            borderRadius: "50%",
          }}
          animate={{
            opacity: [0.7, 0.9, 0.7],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Subtle scanlines for texture */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: "linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "100% 8px"
          }}
        />
      </div>

      {/* Simple content layout matching the reference image */}
      <div className="container mx-auto pt-10 pb-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 px-6 md:px-10 gap-y-6">
          {/* Left side - EMAIL text + address */}
          <div className="flex flex-col items-start">
            <h3 className="text-xs uppercase tracking-widest text-white/50 mb-1">EMAIL</h3>
            <Link 
              href="mailto:contact@n.ova" 
              className="text-xs text-white/70 hover:text-white transition-colors duration-300"
            >
              n.ova.contact.003@gmail.com
            </Link>
          </div>
          
          {/* Right side - Social links */}
          <div className="flex items-center justify-end gap-6">
            {[
              { name: "X", href: "#" },
              { name: "DISCORD", href: "#" },
              { name: "TELEGRAM", href: "#" },
              { name: "BLOG", href: "#" }
            ].map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-xs uppercase tracking-widest text-white/60 hover:text-white transition-colors duration-300"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
        
        {/* Massive Logo - reduced height */}
        <div className="py-16 md:py-20 lg:py-24 px-6 md:px-10">
          <div className="flex justify-center items-center">
            <div className="relative">
              {/* Shadow/glow effect for depth */}
              <h1 className="absolute text-[100px] sm:text-[150px] md:text-[200px] lg:text-[240px] xl:text-[280px] font-bold tracking-tighter text-purple-600/10 blur-md select-none">
                N.OVA
              </h1>
              
              {/* Main logo text */}
              <h1 className="text-[100px] sm:text-[150px] md:text-[200px] lg:text-[240px] xl:text-[280px] font-bold tracking-tighter text-white relative">
                N.OVA
              </h1>
              
              {/* Animated scan line */}
              <motion.div
                className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500/60 to-transparent"
                animate={{ top: ["0%", "100%"] }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity, 
                  ease: "linear" 
                }}
              />
            </div>
          </div>
        </div>
        
        {/* Copyright line - exact match to reference */}
        <div className="border-t border-white/10 px-6 md:px-10 pt-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              <span className="text-xs text-white/30">N.OVA</span>
              <span className="text-xs text-white/30">[C]{currentYear}. ALL RIGHTS RESERVED.</span>
            </div>
          </div>
        </div>
      </div>
    </motion.footer>
  )
}