"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { 
  Download, 
  Share, 
  Zap, 
  RefreshCw, 
  ChevronDown, 
  Sparkles,
  Save,
  Upload,
  ImagePlus,
  Sliders,
  Camera,
  Copy,
  Check,
  Edit3,
  Shield,
  Key,
  QrCode,
  History
} from "lucide-react"
import Navigation from "@/components/navigation" // Import the Navigation component
import Footer from "@/components/footer" // Import the Footer component

export default function IdentityCardGenerator() {
  // State for the ID card and generation
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false)
  const [selectedStyle, setSelectedStyle] = useState("cyberpunk")
  const [generationHistory, setGenerationHistory] = useState<string[]>([])
  const canvasRef = useRef<HTMLDivElement>(null)
  
  // ID Card specific state
  const [userName, setUserName] = useState("NOVA.USER_0357")
  const [userAddress, setUserAddress] = useState("0x742d35Cc6634C0532925a3b844Bc454e4438f44e")
  const [userRank, setUserRank] = useState("SOVEREIGN")
  const [userAvatar, setUserAvatar] = useState("/placeholder.svg?height=100&width=100")
  const [isEditing, setIsEditing] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  
  // QR Code simulated data
  const qrCodeData = {
    address: userAddress,
    tokens: "3,427 $O",
    created: "2024-04-30",
    security: "QUANTUM SECURED"
  }

  // Example styles for the generator
  const styles = [
    { id: "cyberpunk", name: "Cyberpunk", description: "Neon city vibes" },
    { id: "quantum", name: "Quantum Field", description: "Abstract patterns" },
    { id: "neural", name: "Neural Network", description: "AI visualization" },
    { id: "digital", name: "Digital Space", description: "Virtual reality" },
    { id: "cosmic", name: "Cosmic", description: "Space and galaxies" },
    { id: "matrix", name: "Matrix", description: "Digital code rain" }
  ]

  // Function to handle image generation
  const handleGenerate = () => {
    if (!prompt.trim()) return
    
    setIsGenerating(true)
    
    // Simulated generation process - in real implementation, this would call your API
    setTimeout(() => {
      // For demo, just set a placeholder image
      setPreviewImage("/placeholder.svg?height=600&width=800")
      setIsGenerating(false)
      
      // Add to history
      setGenerationHistory(prev => [prompt, ...prev].slice(0, 10))
    }, 3000)
  }

  // Function to save current prompt
  const savePrompt = () => {
    if (!prompt.trim()) return
    alert("Prompt saved to your collection")
  }

  // Function to copy address
  const copyAddress = () => {
    navigator.clipboard.writeText(userAddress)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  // Function to download card
  const downloadCard = () => {
    if (!previewImage) return
    alert("Downloading your O.XYZ Identity Card...")
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background elements */}
      <div className="fixed inset-0 z-0">
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'linear-gradient(to right, rgba(139, 92, 246, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(139, 92, 246, 0.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        />
        
        {/* Subtle radial gradient overlay */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: 'radial-gradient(circle at center, rgba(139, 92, 246, 0.2) 0%, rgba(0, 0, 0, 0) 70%)'
          }}
        />
        
        {/* Scan lines */}
        {Array(4).fill(0).map((_, i) => (
          <motion.div
            key={`scan-${i}`}
            className="absolute w-full h-[1px] bg-purple-400/10"
            style={{ top: `${i * 25}%` }}
            animate={{ 
              opacity: [0.1, 0.2, 0.1],
              scaleY: [1, 1.5, 1],
              x: ['-100%', '100%'] 
            }}
            transition={{
              duration: 15 + i % 3,
              repeat: Infinity,
              delay: i * 1.5,
            }}
          />
        ))}
      </div>
      
      {/* Navigation */}
      <Navigation />
      
      {/* Main Content */}
      <main className="container mx-auto px-4 pt-20 pb-32 relative z-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-purple-300">
            O.IDENTITY
          </h1>
          <p className="text-white/70">Generate your unique AI-powered Sovereign Identity Card</p>
        </div>
        
        {/* Main Interface Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left Side - Controls */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Prompt Input */}
            <div className="relative bg-black/40 backdrop-blur-sm border border-white/10 rounded-sm p-4 group hover:border-purple-500/30 transition-all duration-300">
              {/* Decorative corner elements */}
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-purple-500/30 group-hover:border-purple-500/70 transition-colors"></div>
              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-purple-500/30 group-hover:border-purple-500/70 transition-colors"></div>
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-purple-500/30 group-hover:border-purple-500/70 transition-colors"></div>
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-purple-500/30 group-hover:border-purple-500/70 transition-colors"></div>
              
              <label className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-2 flex items-center">
                <Sparkles className="w-3 h-3 mr-1 text-purple-400" />
                Background Prompt
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the background for your identity card..."
                className="w-full h-32 bg-black/30 text-white/90 border border-white/10 rounded-sm p-3 focus:outline-none focus:border-purple-500/50 transition-colors resize-none"
              />
              
              <div className="flex justify-between items-center mt-2">
                <div className="text-xs text-white/40">
                  {prompt.length} / 500
                </div>
                <div className="space-x-2">
                  <button 
                    className="p-1 text-white/60 hover:text-purple-400 transition-colors"
                    onClick={savePrompt}
                  >
                    <Save className="w-4 h-4" />
                  </button>
                  <button 
                    className="p-1 text-white/60 hover:text-purple-400 transition-colors"
                    onClick={() => setPrompt("")}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Style Selection */}
            <div className="relative bg-black/40 backdrop-blur-sm border border-white/10 rounded-sm p-4 group hover:border-purple-500/30 transition-all duration-300">
              {/* Decorative corner elements */}
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-purple-500/30 group-hover:border-purple-500/70 transition-colors"></div>
              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-purple-500/30 group-hover:border-purple-500/70 transition-colors"></div>
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-purple-500/30 group-hover:border-purple-500/70 transition-colors"></div>
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-purple-500/30 group-hover:border-purple-500/70 transition-colors"></div>
              
              <label className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-3 flex items-center">
                <ImagePlus className="w-3 h-3 mr-1 text-purple-400" />
                Background Style
              </label>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {styles.map((style) => (
                  <button
                    key={style.id}
                    className={`p-2 rounded-sm text-xs flex flex-col items-center justify-center transition-colors ${
                      selectedStyle === style.id 
                        ? "bg-purple-500/20 border border-purple-500/50 text-white" 
                        : "bg-black/30 border border-white/10 text-white/70 hover:border-purple-500/30"
                    }`}
                    onClick={() => setSelectedStyle(style.id)}
                  >
                    <span className="font-medium">{style.name}</span>
                    <span className="text-[10px] mt-1 opacity-70">{style.description}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* User Identity Information */}
            <div className="relative bg-black/40 backdrop-blur-sm border border-white/10 rounded-sm p-4 group hover:border-purple-500/30 transition-all duration-300">
              {/* Decorative corner elements */}
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-purple-500/30 group-hover:border-purple-500/70 transition-colors"></div>
              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-purple-500/30 group-hover:border-purple-500/70 transition-colors"></div>
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-purple-500/30 group-hover:border-purple-500/70 transition-colors"></div>
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-purple-500/30 group-hover:border-purple-500/70 transition-colors"></div>
              
              <div className="flex justify-between items-center mb-4">
                <label className="block text-xs font-mono uppercase tracking-wider text-white/60 flex items-center">
                  <Shield className="w-3 h-3 mr-1 text-purple-400" />
                  Identity Information
                </label>
                
                <button 
                  className="text-xs text-white/60 hover:text-white/90 transition-colors flex items-center"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Edit3 className="w-3 h-3 mr-1" />
                  {isEditing ? "Save" : "Edit"}
                </button>
              </div>
              
              <div className="space-y-4">
                {/* User Name */}
                <div>
                  <label className="text-xs text-white/60 block mb-1">Display Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="w-full bg-black/30 text-white/90 border border-white/10 rounded-sm p-2 focus:outline-none focus:border-purple-500/50 transition-colors"
                    />
                  ) : (
                    <div className="bg-black/30 text-white/90 border border-white/10 rounded-sm p-2 font-mono">
                      {userName}
                    </div>
                  )}
                </div>
                
                {/* Wallet Address */}
                <div>
                  <label className="text-xs text-white/60 block mb-1 flex justify-between">
                    <span>Wallet Address</span>
                    <button 
                      className="text-purple-400 hover:text-purple-300 transition-colors flex items-center"
                      onClick={copyAddress}
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3 h-3 mr-1" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 mr-1" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </label>
                  <div className="bg-black/30 text-white/90 border border-white/10 rounded-sm p-2 font-mono text-xs truncate">
                    {userAddress}
                  </div>
                </div>
                
                {/* User Rank */}
                <div>
                  <label className="text-xs text-white/60 block mb-1">Sovereign Rank</label>
                  {isEditing ? (
                    <select
                      value={userRank}
                      onChange={(e) => setUserRank(e.target.value)}
                      className="w-full bg-black/30 text-white/90 border border-white/10 rounded-sm p-2 focus:outline-none focus:border-purple-500/50 transition-colors"
                    >
                      <option value="INITIATE">INITIATE</option>
                      <option value="AGENT">AGENT</option>
                      <option value="ADVANCED">ADVANCED</option>
                      <option value="SOVEREIGN">SOVEREIGN</option>
                      <option value="ARCHITECT">ARCHITECT</option>
                    </select>
                  ) : (
                    <div className="bg-black/30 text-white/90 border border-white/10 rounded-sm p-2 font-mono">
                      {userRank}
                    </div>
                  )}
                </div>
                
                {/* User Avatar */}
                <div>
                  <label className="text-xs text-white/60 block mb-1">Profile Image</label>
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-black/50 border border-white/10 rounded-sm overflow-hidden">
                      <img src={userAvatar} alt="User avatar" className="w-full h-full object-cover" />
                    </div>
                    
                    {isEditing && (
                      <button className="px-3 py-1 border border-white/10 rounded-sm text-xs text-white/70 hover:border-purple-500/30 hover:text-white transition-colors flex items-center">
                        <Upload className="w-3 h-3 mr-1" />
                        Upload
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Advanced Settings Toggle */}
            <div className="relative bg-black/40 backdrop-blur-sm border border-white/10 rounded-sm p-4 group hover:border-purple-500/30 transition-all duration-300">
              {/* Decorative corner elements */}
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-purple-500/30 group-hover:border-purple-500/70 transition-colors"></div>
              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-purple-500/30 group-hover:border-purple-500/70 transition-colors"></div>
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-purple-500/30 group-hover:border-purple-500/70 transition-colors"></div>
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-purple-500/30 group-hover:border-purple-500/70 transition-colors"></div>
              
              <button 
                className="w-full flex justify-between items-center"
                onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
              >
                <div className="flex items-center">
                  <Sliders className="w-4 h-4 mr-2 text-purple-400" />
                  <span className="text-sm font-medium">Advanced Settings</span>
                </div>
                <ChevronDown 
                  className={`w-4 h-4 text-white/60 transition-transform ${showAdvancedSettings ? 'rotate-180' : ''}`} 
                />
              </button>
              
              <AnimatePresence>
                {showAdvancedSettings && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-4 space-y-4">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-black/30 border border-white/10 rounded-sm p-2">
                          <label className="text-xs text-white/60 block mb-1">Card Design</label>
                          <select className="w-full bg-black/50 border border-white/10 rounded-sm p-1 text-sm focus:outline-none focus:border-purple-500/50">
                            <option value="standard">Standard</option>
                            <option value="premium">Premium</option>
                            <option value="founder">Founder</option>
                          </select>
                        </div>
                        <div className="bg-black/30 border border-white/10 rounded-sm p-2">
                          <label className="text-xs text-white/60 block mb-1">Encryption Level</label>
                          <select className="w-full bg-black/50 border border-white/10 rounded-sm p-1 text-sm focus:outline-none focus:border-purple-500/50">
                            <option value="standard">Standard</option>
                            <option value="advanced">Advanced</option>
                            <option value="quantum">Quantum</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-2 bg-black/30 border border-white/10 rounded-sm text-sm">
                        <span className="text-xs text-white/60 flex items-center">
                          <Key className="w-3 h-3 mr-1 text-purple-400" />
                          Enable Secret Key Access
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" />
                          <div className="w-9 h-5 bg-black/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Generate Button */}
            <div className="relative group">
              <button
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-sm font-medium text-lg relative z-10 overflow-hidden group"
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
              >
                <span className="relative z-10 flex items-center justify-center">
                  {isGenerating ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating Card...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-5 w-5" />
                      Generate Identity Card
                    </>
                  )}
                </span>
                
                {/* Light scan effect */}
                <motion.div
                  className="absolute top-0 -right-40 w-32 h-full bg-white transform rotate-12 translate-x-0 -translate-y-0 opacity-20 group-hover:translate-x-80 transition-transform duration-1000"
                />
              </button>
              
              {/* Button glow effect */}
              <motion.div 
                className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-sm blur-lg opacity-30 group-hover:opacity-100 transition-opacity duration-500 -z-10"
              />
            </div>
            
            {/* History */}
            <div className="relative bg-black/40 backdrop-blur-sm border border-white/10 rounded-sm p-4 group hover:border-purple-500/30 transition-all duration-300">
              {/* Decorative corner elements */}
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-purple-500/30 group-hover:border-purple-500/70 transition-colors"></div>
              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-purple-500/30 group-hover:border-purple-500/70 transition-colors"></div>
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-purple-500/30 group-hover:border-purple-500/70 transition-colors"></div>
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-purple-500/30 group-hover:border-purple-500/70 transition-colors"></div>
              
              <div className="flex justify-between items-center mb-3">
                <label className="block text-xs font-mono uppercase tracking-wider text-white/60 flex items-center">
                  <History className="w-3 h-3 mr-1 text-purple-400" />
                  Recent Cards
                </label>
              </div>
              
              <div className="max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-900 scrollbar-track-transparent">
                {generationHistory.length > 0 ? (
                  <div className="space-y-2">
                    {generationHistory.map((historyPrompt, index) => (
                      <div 
                        key={index}
                        className="text-xs p-2 bg-black/30 border border-white/10 rounded-sm hover:border-purple-500/30 cursor-pointer transition-colors"
                        onClick={() => setPrompt(historyPrompt)}
                      >
                        {historyPrompt.length > 60 ? historyPrompt.substring(0, 60) + "..." : historyPrompt}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-white/40 text-xs py-4">No generation history yet</div>
                )}
              </div>
            </div>
          </div>
          
          {/* Right Side - ID Card Preview */}
          <div className="lg:col-span-3">
            <div className="relative bg-black/40 backdrop-blur-sm border border-white/10 rounded-sm p-4 h-full group hover:border-purple-500/30 transition-all duration-300">
              {/* Decorative corner elements */}
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-purple-500/30 group-hover:border-purple-500/70 transition-colors"></div>
              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-purple-500/30 group-hover:border-purple-500/70 transition-colors"></div>
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-purple-500/30 group-hover:border-purple-500/70 transition-colors"></div>
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-purple-500/30 group-hover:border-purple-500/70 transition-colors"></div>
              
              {/* Preview Header */}
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse mr-2"></div>
                  <span className="text-sm font-mono text-white/70">
                    {previewImage ? "IDENTITY CARD PREVIEW" : "IDENTITY CARD PREVIEW"}
                  </span>
                </div>
                
                <div className="flex space-x-3">
                  <button 
                    className={`p-1.5 rounded-sm ${previewImage ? 'text-white/80 hover:bg-white/5' : 'text-white/20'} transition-colors flex items-center text-xs`}
                    onClick={downloadCard}
                    disabled={!previewImage}
                  >
                    <Download className="w-3 h-3 mr-1" />
                    <span>SAVE</span>
                  </button>
                  <button 
                    className={`p-1.5 rounded-sm ${previewImage ? 'text-white/80 hover:bg-white/5' : 'text-white/20'} transition-colors flex items-center text-xs`}
                    disabled={!previewImage}
                  >
                    <Share className="w-3 h-3 mr-1" />
                    <span>SHARE</span>
                  </button>
                </div>
              </div>
              
              {/* ID Card Display Area */}
              <div 
                ref={canvasRef}
                className="flex items-center justify-center bg-black/60 border border-white/5 rounded-sm relative overflow-hidden"
                style={{ minHeight: "550px" }}
              >
                {isGenerating ? (
                  <div className="text-center">
                    <div className="w-16 h-16 border-t-2 border-b-2 border-purple-500 rounded-full animate-spin mb-4 mx-auto"></div>
                    <div className="text-white/70 animate-pulse">Generating your identity card...</div>
                    <div className="text-xs text-white/40 mt-2">Creating sovereign credentials</div>
                  </div>
                ) : (
                  <div className="relative w-full max-w-md mx-auto my-10">
                    {/* ID Card */}
                    <div className="relative aspect-[1.58/1] rounded-lg overflow-hidden border-2 border-white/10 shadow-lg shadow-purple-900/20">
                      {/* Card Background */}
                      <div className="absolute inset-0 z-0">
                        {previewImage ? (
                          <img 
                            src={previewImage}
                            alt="Card background"
                            className="w-full h-full object-cover opacity-60"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-purple-900/40 via-black/60 to-indigo-900/40"></div>
                        )}
                        
                        {/* Grid overlay */}
                        <div 
                          className="absolute inset-0 pointer-events-none opacity-10"
                          style={{
                            backgroundImage: 'linear-gradient(to right, rgba(139, 92, 246, 0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(139, 92, 246, 0.5) 1px, transparent 1px)',
                            backgroundSize: '20px 20px'
                          }}
                        />
                        
                        {/* Scan line effect */}
                        <motion.div 
                          className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent"
                          animate={{ 
                            top: ["0%", "100%"],
                            opacity: [0, 0.7, 0] 
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "linear"
                          }}
                        />
                      </div>
                      
                      {/* Card Content */}
                      <div className="absolute inset-0 z-10 p-5 flex flex-col">
                        {/* Card Header */}
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="text-xs text-white/80 font-mono mb-1">O.XYZ IDENTITY</div>
                            <div className="text-xl font-bold text-white">SOVEREIGN CARD</div>
                          </div>
                          <div className="px-2 py-1 bg-purple-500/20 border border-purple-500/40 rounded-sm">
                            <div className="text-xs text-white/80 font-mono">{userRank}</div>
                          </div>
                        </div>
                        
                        {/* User Info */}
                        <div className="flex space-x-4 mb-6">
                          {/* Avatar */}
                          <div className="w-16 h-16 rounded-md overflow-hidden border border-white/20">
                            <img src={userAvatar} alt="User" className="w-full h-full object-cover" />
                          </div>
                          
                          {/* User Details */}
                          <div className="flex-1">
                            <div className="text-sm font-bold text-white mb-1">{userName}</div>
                            <div className="text-xs text-white/70 font-mono mb-2 truncate">{userAddress.substring(0, 20)}...</div>
                            <div className="text-[10px] text-white/50 font-mono">VERIFIED: {new Date().toLocaleDateString()}</div>
                          </div>
                        </div>
                        
                        {/* Card Body */}
                        <div className="flex-1 flex flex-col">
                          {/* Features and Privileges */}
                          <div className="text-xs text-white/60 font-mono mb-1">PRIVILEGES</div>
                          <div className="grid grid-cols-2 gap-2 mb-auto">
                            <div className="text-[10px] text-white/80 flex items-center">
                              <div className="w-1 h-1 rounded-full bg-purple-400 mr-1"></div>
                              <span>DAO VOTING RIGHTS</span>
                            </div>
                            <div className="text-[10px] text-white/80 flex items-center">
                              <div className="w-1 h-1 rounded-full bg-purple-400 mr-1"></div>
                              <span>EARLY ACCESS</span>
                            </div>
                            <div className="text-[10px] text-white/80 flex items-center">
                              <div className="w-1 h-1 rounded-full bg-purple-400 mr-1"></div>
                              <span>TOKEN REWARDS</span>
                            </div>
                            <div className="text-[10px] text-white/80 flex items-center">
                              <div className="w-1 h-1 rounded-full bg-purple-400 mr-1"></div>
                              <span>AGENT STATUS</span>
                            </div>
                          </div>
                          
                          {/* Secure Element + QR Code */}
                          <div className="flex justify-between items-end mt-6">
                            <div className="max-w-[60%]">
                              <div className="text-xs text-white/60 font-mono mb-1">SECURE ELEMENT</div>
                              <div className="text-[9px] font-mono text-white/70 leading-tight">
                                Quantum secured identity credentials<br />
                                Blockchain verified • Non-transferable<br />
                                Soulbound NFT • Level {Math.floor(Math.random() * 10) + 1} access
                              </div>
                            </div>
                            
                            <div className="w-20 h-20 bg-white p-1 rounded-md">
                              <div className="w-full h-full bg-black relative flex items-center justify-center">
                                <QrCode className="w-16 h-16 text-white" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-4 h-4 bg-purple-500 rounded-sm flex items-center justify-center">
                                    <div className="w-2 h-2 bg-white rounded-sm"></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Holographic effect overlay */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 via-transparent to-blue-500/10 pointer-events-none z-20"></div>
                      
                      {/* Card bottom edge illumination */}
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-500 z-20"></div>
                    </div>
                    
                    {/* Card shadow */}
                    <div className="absolute -bottom-4 left-4 right-4 h-4 bg-black blur-xl"></div>
                    
                    {/* Card info label */}
                    <div className="absolute -bottom-10 left-0 right-0 text-center">
                      <div className="text-xs text-white/50 font-mono">BLOCKCHAIN ID: #{Math.floor(Math.random() * 10000).toString().padStart(4, '0')}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          <div className="relative bg-black/30 backdrop-blur-sm border border-white/10 rounded-sm p-4 group hover:border-purple-500/30 transition-all duration-300">
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-purple-500/30 group-hover:border-purple-500/70 transition-colors"></div>
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-purple-500/30 group-hover:border-purple-500/70 transition-colors"></div>
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-purple-500/30 group-hover:border-purple-500/70 transition-colors"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-purple-500/30 group-hover:border-purple-500/70 transition-colors"></div>
            
            <h3 className="text-lg font-medium mb-2 text-purple-300">Soulbound Identity</h3>
            <p className="text-white/70 text-sm">Your O.IDENTITY card is cryptographically bound to your wallet and cannot be transferred or duplicated.</p>
          </div>
          
          <div className="relative bg-black/30 backdrop-blur-sm border border-white/10 rounded-sm p-4 group hover:border-purple-500/30 transition-all duration-300">
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-purple-500/30 group-hover:border-purple-500/70 transition-colors"></div>
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-purple-500/30 group-hover:border-purple-500/70 transition-colors"></div>
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-purple-500/30 group-hover:border-purple-500/70 transition-colors"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-purple-500/30 group-hover:border-purple-500/70 transition-colors"></div>
            
            <h3 className="text-lg font-medium mb-2 text-purple-300">Quantum Security</h3>
            <p className="text-white/70 text-sm">Advanced cryptographic protection ensures your identity remains secure even against quantum computing attacks.</p>
          </div>
          
          <div className="relative bg-black/30 backdrop-blur-sm border border-white/10 rounded-sm p-4 group hover:border-purple-500/30 transition-all duration-300">
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-purple-500/30 group-hover:border-purple-500/70 transition-colors"></div>
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-purple-500/30 group-hover:border-purple-500/70 transition-colors"></div>
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-purple-500/30 group-hover:border-purple-500/70 transition-colors"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-purple-500/30 group-hover:border-purple-500/70 transition-colors"></div>
            
            <h3 className="text-lg font-medium mb-2 text-purple-300">DAO Access</h3>
            <p className="text-white/70 text-sm">Your identity card grants you voting rights in the O.DAO governance system and access to exclusive ecosystem features.</p>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <Footer />
      
      {/* Corner decorations */}
      <div className="fixed top-10 left-10 w-16 h-16 border-l border-t border-white/10 z-10"></div>
      <div className="fixed top-10 right-10 w-16 h-16 border-r border-t border-white/10 z-10"></div>
      <div className="fixed bottom-10 left-10 w-16 h-16 border-l border-b border-white/10 z-10"></div>
      <div className="fixed bottom-10 right-10 w-16 h-16 border-r border-b border-white/10 z-10"></div>
      
      {/* Custom scrollbar styling */}
      <style jsx global>{`
        /* Custom scrollbar for webkit browsers */
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
        
        /* Firefox scrollbar */
        * {
          scrollbar-width: thin;
          scrollbar-color: rgba(139, 92, 246, 0.3) transparent;
        }
      `}</style>
    </div>
  )
}