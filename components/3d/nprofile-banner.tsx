"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import dynamic from "next/dynamic"

// Import the original 3D banner as a fallback
const NProfileBanner = dynamic(() => import("@/components/3d/nprofile-banner"), {
  ssr: false,
});

const NIdentityBanner = () => {
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [userCardData, setUserCardData] = useState<any>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Load saved card image and data from localStorage
    if (typeof window !== 'undefined') {
      const savedImage = localStorage.getItem("previewImage")
      const savedCardData = localStorage.getItem("identityCardData")
      
      if (savedImage) {
        setPreviewImage(savedImage)
      }
      
      if (savedCardData) {
        try {
          setUserCardData(JSON.parse(savedCardData))
        } catch (err) {
          console.error("Error parsing saved card data:", err)
        }
      }
    }
  }, [])

  if (!mounted) {
    return null
  }

  // If no card has been generated yet, show the 3D banner instead
  if (!previewImage) {
    return <NProfileBanner />
  }

  // Function to format the wallet address
  const formatAddress = (address: string | null) => {
    if (!address) return "Not connected"
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  return (
    <div className="relative w-full h-80 md:h-96 bg-black border border-white/30 p-0.5 overflow-hidden">
      <div className="absolute inset-0 border border-white/10">
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: "linear-gradient(to right, rgba(255, 255, 255, 0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.5) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }} 
        />
        
        {/* ID Card Display (centered) */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
            className="card-preview relative aspect-[1.58/1] h-[80%] overflow-hidden border border-white/20"
          >
            {/* Background Image Layer */}
            <div className="absolute inset-0 z-0">
              <img
                src={previewImage}
                alt="Card background"
                className="w-full h-full object-cover opacity-30"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/70" />
              <div
                className="absolute inset-0 pointer-events-none opacity-10"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px)",
                  backgroundSize: "20px 20px",
                }}
              />
              {/* Animated Scan Line */}
              <motion.div
                className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-white to-transparent"
                animate={{
                  top: ["0%", "100%"],
                  opacity: [0, 0.3, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            </div>

            {/* Card Content Layer */}
            <div className="absolute inset-0 z-10 p-5 flex flex-col">
              {/* Header Section */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-xs text-white/80 font-mono mb-1 uppercase">
                    N.IDENTITY
                  </div>
                  <div className="text-xl font-light text-white uppercase tracking-wider">
                    Sovereign Card
                  </div>
                </div>
                <div className="px-2 py-1 bg-black border border-white/30 text-xs uppercase">
                  {userCardData?.userRank || "ECHO"}
                </div>
              </div>

              {/* Main Content Section */}
              <div className="flex space-x-4 mb-6">
                <div className="w-16 h-16 overflow-hidden border border-white/20">
                  <img
                    src={userCardData?.userAvatar || "/placeholder.svg?height=100&width=100"}
                    alt="User"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-white mb-1">
                    {userCardData?.userName || "N.OVA User"}
                  </div>
                  <div className="text-xs text-white/70 font-mono mb-1 truncate">
                    {formatAddress(userCardData?.userAddress)}
                  </div>
                  <div className="text-[10px] text-white/50 font-mono uppercase">
                    VERIFIED: {userCardData?.dateVerified || new Date().toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Visual Accent Elements */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white z-20" />
          </motion.div>
        </div>
        
        {/* Overlay Status Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="absolute top-4 right-4 text-lg font-medium text-white uppercase"
        >
          ACTIVE IDENTITY
        </motion.div>

        {/* Animated scan lines */}
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <motion.div
              key={`scan-${i}`}
              className="absolute w-full h-[1px] bg-white/5"
              style={{ top: `${i * 25}%` }}
              animate={{
                opacity: [0.05, 0.1, 0.05],
                scaleY: [1, 1.5, 1],
                x: ["-100%", "100%"],
              }}
              transition={{
                duration: 15 + (i % 3),
                repeat: Infinity,
                delay: i * 1.5,
              }}
            />
          ))}
          
        {/* Corner decorative elements */}
        <div className="absolute top-4 left-4 w-8 h-8 border-l border-t border-white/10" />
        <div className="absolute top-4 right-4 w-8 h-8 border-r border-t border-white/10" />
        <div className="absolute bottom-4 left-4 w-8 h-8 border-l border-b border-white/10" />
        <div className="absolute bottom-4 right-4 w-8 h-8 border-r border-b border-white/10" />
      </div>
    </div>
  )
}

export default NIdentityBanner