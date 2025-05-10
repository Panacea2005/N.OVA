"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { usePhantom } from "@/hooks/use-phantom"

interface IdentityCardData {
  userName: string
  userAddress: string
  userRank: string
  userAvatar: string
  dateVerified: string
}

export default function IdentityCardScan() {
  const { novaBalance, walletAddress } = usePhantom()
  const [cardData, setCardData] = useState<IdentityCardData | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true);
  }, []);

  // Retrieve data and background image from local storage
  useEffect(() => {
    if (!mounted) return;
    
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
  }, [mounted])

  // Handle image load errors
  const handleImageError = () => {
    setPreviewImage(null)
    setError("Failed to load background image. Using default background.")
  }

  // Function to determine rank based on token balance
  const determineRank = (novaBalance: number | null | undefined) => {
    if (novaBalance === null || novaBalance === undefined)
      return { name: "ECHO", color: "border-gray-500", textColor: "text-gray-400" };

    // Convert raw balance by removing 9 decimals (standard for Solana tokens)
    const convertedBalance = novaBalance / Math.pow(10, 9);

    if (convertedBalance >= 100000)
      return { name: "SOVEREIGN", color: "border-amber-500", textColor: "text-amber-400" };
    if (convertedBalance >= 20000)
      return { name: "ORACLE", color: "border-pink-500", textColor: "text-pink-400" };
    if (convertedBalance >= 5000)
      return { name: "NEXUS", color: "border-purple-500", textColor: "text-purple-400" };
    if (convertedBalance >= 1500)
      return { name: "CIPHER", color: "border-teal-500", textColor: "text-teal-400" };
    if (convertedBalance >= 500)
      return { name: "SIGNAL", color: "border-cyan-500", textColor: "text-cyan-400" };
    if (convertedBalance >= 100)
      return { name: "PULSE", color: "border-blue-500", textColor: "text-blue-400" };
    return { name: "ECHO", color: "border-gray-500", textColor: "text-gray-400" };
  };

  // Get actual user rank from NOVA balance
  const userRank = determineRank(novaBalance);
  
  // Format NOVA balance for display
  const formattedNovaBalance = novaBalance 
    ? (novaBalance / Math.pow(10, 9)).toLocaleString(undefined, { maximumFractionDigits: 2 })
    : "0";

  // Get privileges based on rank
  const getPrivileges = (rankName: string) => {
    switch (rankName) {
      case "ECHO":
        return ["IDENTITY CREATION", "TOKEN CLAIMS"];
      case "PULSE":
        return ["IDENTITY CREATION", "TOKEN CLAIMS", "N.AI BASIC"];
      case "SIGNAL":
        return ["IDENTITY CREATION", "TOKEN CLAIMS", "N.AI BASIC", "ADVANCED ANALYTICS"];
      case "CIPHER":
        return ["IDENTITY CREATION", "TOKEN CLAIMS", "N.AI BASIC", "ADVANCED ANALYTICS", "CUSTOM IDENTITY"];
      case "NEXUS":
        return ["IDENTITY CREATION", "TOKEN CLAIMS", "N.AI PREMIUM", "ADVANCED ANALYTICS", "CUSTOM IDENTITY"];
      case "ORACLE":
        return ["IDENTITY CREATION", "TOKEN CLAIMS", "N.AI PREMIUM", "ADVANCED ANALYTICS", "CUSTOM IDENTITY", "DAO VOTING"];
      case "SOVEREIGN":
        return ["IDENTITY CREATION", "TOKEN CLAIMS", "N.AI PREMIUM", "ADVANCED ANALYTICS", "CUSTOM IDENTITY", "DAO VOTING", "ECOSYSTEM CONTROL"];
      default:
        return ["IDENTITY CREATION", "TOKEN CLAIMS"];
    }
  };

  // Truncate wallet address for display
  const truncatedAddress = walletAddress
    ? `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`
    : "Not connected";

  // Generate verification code from wallet address
  const generateVerificationCode = () => {
    if (!walletAddress) return "0000";
    const hash = walletAddress.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return (hash % 10000).toString().padStart(4, '0');
  };

  return (
    <main className="min-h-screen bg-black text-white relative overflow-hidden">
      <div className="fixed inset-0 z-0">
        {/* Background Image */}
        {previewImage ? (
          <img
            src={previewImage}
            alt="Card background"
            className="absolute inset-0 w-full h-full object-cover opacity-20"
            onError={handleImageError}
          />
        ) : (
          <div className="absolute inset-0 bg-black" />
        )}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        {Array(4).fill(0).map((_, i) => (
          <motion.div
            key={`scan-${i}`}
            className="absolute w-full h-[1px] bg-white/10"
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

      <div className="container mx-auto px-4 pt-20 pb-32 relative z-10">
        <div className="mb-16">
          <h1 className="text-8xl font-light mb-6">N.IDENTITY</h1>
          <p className="text-white/70 uppercase max-w-4xl">
            SECURE VERIFICATION OF YOUR SOVEREIGN IDENTITY CARD
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
          {/* Card visualization */}
          <div className="w-full max-w-lg">
            <div className="border border-white/30 p-0.5">
              <div className="border border-white/10 p-6 bg-black/40 backdrop-blur-sm">
                {error ? (
                  <div className="text-center py-12">
                    <div className="text-white/70">Error loading data</div>
                    <div className="text-xs text-red-400 mt-2">{error}</div>
                  </div>
                ) : cardData ? (
                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <div className="text-xs text-white/60 mb-1 uppercase tracking-widest">
                          N.IDENTITY
                        </div>
                        <div className="text-2xl font-light text-white uppercase tracking-widest">
                          NOVA PASSPORT
                        </div>
                      </div>
                      <div className={`px-2 py-1 bg-black ${userRank.color}/30 text-xs uppercase border ${userRank.color}`}>
                        {userRank.name}
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="w-full h-px bg-white/10 mb-6"></div>

                    {/* Main Content Section */}
                    <div className="flex space-x-6 mb-8">
                      <div className="w-20 h-20 overflow-hidden border border-white/10">
                        <img
                          src={cardData.userAvatar}
                          alt="User"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="text-lg font-light text-white mb-1 tracking-wider">
                          {cardData.userName}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-sm text-white/50 font-mono truncate">
                            {truncatedAddress}
                          </div>
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                        </div>
                        <div className="text-xs text-white/50 mt-2">
                          <span className="uppercase">BALANCE:</span> {formattedNovaBalance} NOVA
                        </div>
                        <div className="text-xs text-white/40 mt-1">
                          <span className="uppercase">VERIFIED:</span> {cardData.dateVerified || new Date().toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {/* Privileges */}
                    <div className="mb-6">
                      <div className="text-xs text-white/60 uppercase tracking-widest mb-4">
                        Access & Privileges
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {getPrivileges(userRank.name).map((privilege, index) => (
                          <div key={index} className="text-xs text-white/80 flex items-center">
                            <div className="w-1 h-1 bg-white/30 mr-2" />
                            <span>{privilege}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Verification */}
                    <div className="flex justify-between items-end mt-8">
                      <div className="text-xs text-white/40 tracking-wider">
                        NOVA · SECURE BLOCKCHAIN IDENTITY
                      </div>
                      <div className="text-xs text-white/50 font-mono">
                        ID:#{generateVerificationCode()}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 border-t-2 border-b-2 border-white rounded-full animate-spin mb-4 mx-auto" />
                    <div className="text-white/70 animate-pulse uppercase">
                      Loading identity card...
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Verification details */}
          <div className="w-full max-w-md">
            <div className="border border-white/30 p-0.5">
              <div className="border border-white/10 p-6 bg-black/40 backdrop-blur-sm">
                <h2 className="text-2xl font-light mb-6 uppercase">Verification Details</h2>
                
                {error ? (
                  <div className="text-center py-4">
                    <div className="text-white/70">Error loading data</div>
                    <div className="text-xs text-red-400 mt-2">{error}</div>
                  </div>
                ) : cardData ? (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center border-b border-white/10 pb-3">
                        <span className="text-white/60">IDENTITY TYPE</span>
                        <span className="text-white font-light">NOVA PASSPORT</span>
                      </div>
                      
                      <div className="flex justify-between items-center border-b border-white/10 pb-3">
                        <span className="text-white/60">IDENTITY OWNER</span>
                        <span className="text-white font-light">{cardData.userName}</span>
                      </div>
                      
                      <div className="flex justify-between items-center border-b border-white/10 pb-3">
                        <span className="text-white/60">WALLET ADDRESS</span>
                        <span className="text-white font-light font-mono">{truncatedAddress}</span>
                      </div>
                      
                      <div className="flex justify-between items-center border-b border-white/10 pb-3">
                        <span className="text-white/60">NOVA BALANCE</span>
                        <span className="text-white font-light">{formattedNovaBalance} NOVA</span>
                      </div>
                      
                      <div className="flex justify-between items-center border-b border-white/10 pb-3">
                        <span className="text-white/60">SOVEREIGN RANK</span>
                        <span className={`${userRank.textColor} font-medium uppercase`}>{userRank.name}</span>
                      </div>
                      
                      <div className="flex justify-between items-center border-b border-white/10 pb-3">
                        <span className="text-white/60">VERIFICATION DATE</span>
                        <span className="text-white font-light font-mono">{cardData.dateVerified || new Date().toLocaleDateString()}</span>
                      </div>
                      
                      <div className="flex justify-between items-center border-b border-white/10 pb-3">
                        <span className="text-white/60">VERIFICATION ID</span>
                        <span className="text-white font-light font-mono">#{generateVerificationCode()}</span>
                      </div>
                    </div>
                    
                    <div className="pt-4">
                      <div className="uppercase text-white/60 mb-3">VERIFICATION STATUS</div>
                      <div className="flex items-center space-x-2 text-green-500">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="uppercase font-light">VERIFIED AND ACTIVE</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 border-t-2 border-b-2 border-white rounded-full animate-spin mb-4 mx-auto" />
                    <div className="text-white/70 animate-pulse uppercase">
                      Loading verification data...
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      <style jsx global>{`
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }

        ::-webkit-scrollbar-track {
          background: transparent;
        }

        ::-webkit-scrollbar-thumb {
          background-color: rgba(255, 255, 255, 0.3);
          border-radius: 0;
        }

        ::-webkit-scrollbar-thumb:hover {
          background-color: rgba(255, 255, 255, 0.5);
        }

        * {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
        }
      `}</style>
    </main>
  )
}