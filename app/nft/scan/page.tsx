"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"

interface IdentityCardData {
  userName: string
  userAddress: string
  userRank: string
  userAvatar: string
  walletData: {
    balance: string
    nftCount: number
  }
  privileges: string[]
  dateVerified: string
}

export default function IdentityCardScan() {
  const [cardData, setCardData] = useState<IdentityCardData | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Retrieve data and background image from local storage
  useEffect(() => {
    try {
      // Retrieve identity card data
      const storedData = localStorage.getItem("identityCardData")
      if (storedData) {
        setCardData(JSON.parse(storedData))
      } else {
        setError("No identity card data found. Please generate a card first.")
      }

      // Retrieve generated background image
      const storedPreview = localStorage.getItem("previewImage")
      if (storedPreview) {
        setPreviewImage(storedPreview)
      }
    } catch (err) {
      console.error("Error retrieving card data or background image:", err)
      setError("Failed to load identity card data or background image.")
    }
  }, [])

  // Handle image load errors
  const handleImageError = () => {
    setPreviewImage(null)
    setError("Failed to load background image. Using default background.")
  }

  // Truncate wallet address for display
  const truncatedAddress = cardData
    ? `${cardData.userAddress.substring(0, 6)}...${cardData.userAddress.substring(cardData.userAddress.length - 4)}`
    : ""

  return (
    <>
      <div className="min-h-screen bg-black text-white relative overflow-hidden">
        <div className="fixed inset-0 z-0">
          {/* Background Image */}
          {previewImage ? (
            <img
              src={previewImage}
              alt="Card background"
              className="absolute inset-0 w-full h-full object-cover opacity-30"
              onError={handleImageError}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-black/60 to-indigo-900/40" />
          )}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(139, 92, 246, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(139, 92, 246, 0.1) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background: 'radial-gradient(circle at center, rgba(139, 92, 246, 0.2) 0%, rgba(0, 0, 0, 0) 70%)',
            }}
          />
          {Array(4).fill(0).map((_, i) => (
            <motion.div
              key={`scan-${i}`}
              className="absolute w-full h-[1px] bg-purple-400/10"
              style={{ top: `${i * 25}%` }}
              animate={{
                opacity: [0.1, 0.2, 0.1],
                scaleY: [1, 1.5, 1],
                x: ['-100%', '100%'],
              }}
              transition={{
                duration: 15 + i % 3,
                repeat: Infinity,
                delay: i * 1.5,
              }}
            />
          ))}
        </div>

        <Navigation />

        <main className="container mx-auto px-4 pt-20 pb-32 relative z-10">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-purple-300">
              O.IDENTITY - SCAN
            </h1>
            <p className="text-white/70">View your Sovereign Identity Card details</p>
          </div>

          <div className="flex items-center justify-center">
            <div className="relative bg-black/40 backdrop-blur-sm border border-white/10 rounded-sm p-6 w-full max-w-lg group hover:border-purple-500/30 transition-all duration-300">
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-purple-500/30 group-hover:border-purple-500/70 transition-colors" />
              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-purple-500/30 group-hover:border-purple-500/70 transition-colors" />
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-purple-500/30 group-hover:border-purple-500/70 transition-colors" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-purple-500/30 group-hover:border-purple-500/70 transition-colors" />

              {error ? (
                <div className="text-center">
                  <div className="text-white/70">Error loading data</div>
                  <div className="text-xs text-red-400 mt-2">{error}</div>
                </div>
              ) : cardData ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-md overflow-hidden border border-white/20">
                      <img src={cardData.userAvatar} alt="User" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">{cardData.userName}</div>
                      <div className="text-xs text-white/70 font-mono">{truncatedAddress}</div>
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-4">
                    <div className="grid grid-cols-1 gap-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/60 font-mono">Identity Type</span>
                        <span className="text-sm text-white font-mono">O.XYZ IDENTITY</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/60 font-mono">Sovereign Rank</span>
                        <span className="text-sm text-white font-mono">{cardData.userRank}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/60 font-mono">Wallet Address</span>
                        <span className="text-sm text-white font-mono truncate max-w-[200px]">{truncatedAddress}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/60 font-mono">Balance</span>
                        <span className="text-sm text-white font-mono">{cardData.walletData.balance}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/60 font-mono">NFT Count</span>
                        <span className="text-sm text-white font-mono">{cardData.walletData.nftCount}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/60 font-mono">Verified</span>
                        <span className="text-sm text-white font-mono">{cardData.dateVerified}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-4">
                    <div className="text-xs text-white/60 font-mono mb-2">Privileges</div>
                    <div className="grid grid-cols-1 gap-2">
                      {cardData.privileges.map((privilege, index) => (
                        <div key={index} className="flex items-center text-sm text-white/80">
                          <div className="w-1 h-1 rounded-full bg-purple-400 mr-2" />
                          <span>{privilege}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="text-center mt-6">
                    <div className="text-xs text-white/50 font-mono">
                      BLOCKCHAIN ID: #{Math.floor(Math.random() * 10000).toString().padStart(4, '0')}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-16 h-16 border-t-2 border-b-2 border-purple-500 rounded-full animate-spin mb-4 mx-auto" />
                  <div className="text-white/70 animate-pulse">Loading identity card...</div>
                </div>
              )}
            </div>
          </div>
        </main>

        <Footer />

        <div className="fixed top-10 left-10 w-16 h-16 border-l border-t border-white/10 z-10" />
        <div className="fixed top-10 right-10 w-16 h-16 border-r border-t border-white/10 z-10" />
        <div className="fixed bottom-10 left-10 w-16 h-16 border-l border-b border-white/10 z-10" />
        <div className="fixed bottom-10 right-10 w-16 h-16 border-r border-b border-white/10 z-10" />
      </div>

      <style jsx global>
        {`
          ::-webkit-scrollbar {
            width: 6px;
            height: 6px;
          }

          ::-webkit-scrollbar-track {
            background: transparent;
          }

          ::-webkit-scrollbar-thumb {
            background-color: rgba(139, 92, 246, 0.3);
            border-radius: 3px;
          }

          ::-webkit-scrollbar-thumb:hover {
            background-color: rgba(139, 92, 246, 0.5);
          }

          * {
            scrollbar-width: thin;
            scrollbar-color: rgba(139, 92, 246, 0.3) transparent;
          }
        `}
      </style>
    </>
  )
}