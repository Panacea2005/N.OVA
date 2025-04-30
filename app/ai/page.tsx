"use client"

import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import dynamic from "next/dynamic"
import Link from "next/link"
import { Send, Clipboard, ExternalLink } from "lucide-react"
import { Canvas } from "@react-three/fiber"

// Import the Navigation component
const Navigation = dynamic(() => import("@/components/navigation"), {
  ssr: false,
})

// Import the 3D dot arch visualization component
// We'll use proper dynamic loading to avoid SSR issues
const DynamicDotArchVisualization = dynamic(
  () => import("@/components/3d/dot-arch-visualization"),
  {
    ssr: false,
  }
)

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  speed?: string
  tokens?: number
}

export default function AIPage() {
  const [mounted, setMounted] = useState(false)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [promptsLeft, setPromptsLeft] = useState(45)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [showWelcome, setShowWelcome] = useState(true)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setMounted(true)
    return () => {
      // Cleanup any event listeners or animations
    }
  }, [])

  useEffect(() => {
    // Scroll to bottom on new messages
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!input.trim()) return
    
    // Set that we've had at least one interaction
    if (!hasInteracted) {
      setHasInteracted(true)
      // Remove welcome message after a short delay
      setTimeout(() => {
        setShowWelcome(false)
      }, 500)
    }
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsTyping(true)
    setPromptsLeft(prev => prev - 1)
    
    // Simulate AI response after a delay
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm Miss O, your friendly AI assistant from O.XYZ. It's great to meet you! How can I assist you today? Do you have any questions or need help with something? I'm here to help.\n\nIf you're looking for O.XYZ's social media links:\n\n• Twitter: https://x.com/o_fndn\n• YouTube: https://www.youtube.com/@o-official-channel\n• LinkedIn: http://linkedin.com/company/oxyz-official\n• Medium: https://medium.com/oxyz\n\nLet me know how I can help!",
        timestamp: new Date(),
        speed: "2.3x FASTER",
        tokens: 447
      }
      
      setMessages(prev => [...prev, assistantMessage])
      setIsTyping(false)
    }, 1500)
  }

  const handleNewChat = () => {
    setMessages([])
    setShowWelcome(true)
    setHasInteracted(false)
    setPromptsLeft(45)
  }

  if (!mounted) return null

  return (
    <main className="relative min-h-screen bg-black text-white font-mono">
      {/* Background with dot pattern */}
      <div className="fixed inset-0 z-0 opacity-20" 
           style={{ 
             backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px)', 
             backgroundSize: '20px 20px' 
           }}>
      </div>
      
      {/* Navigation - Added to make it visible */}
      <Navigation />

      {/* Main Content */}
      <div className="relative z-10 pt-16 min-h-screen">
        {/* Welcome Visualization State (before first message) */}
        {showWelcome && (
          <motion.div 
            className="h-screen flex flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex-1 relative">
              {/* Use Canvas to properly wrap the 3D component */}
              <div className="w-full h-full">
                <Canvas>
                  <DynamicDotArchVisualization 
                    greeting="// HI, I'm NOVA."
                    dotSize={0.02}
                    arcWidth={10}
                    arcHeight={5}
                    arcDepth={2}
                    rows={30}
                    dotsPerRow={60}
                  />
                </Canvas>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Chat Interface (after first message or always visible but transparent initially) */}
        <AnimatePresence>
          {(!showWelcome || hasInteracted) && (
            <motion.div 
              className="absolute inset-0 flex flex-col pt-16"
              initial={{ opacity: hasInteracted ? 1 : 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {/* Chat Messages Container */}
              <div 
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto px-6 py-4 scrollbar-none"
              >
                <div className="max-w-4xl mx-auto">
                  <AnimatePresence>
                    {messages.map((message, index) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className={`mb-8 ${message.role === "assistant" ? "ml-0" : "ml-auto"}`}
                        style={{ maxWidth: "90%" }}
                      >
                        {message.role === "user" ? (
                          /* User message - right aligned, simple */
                          <div className="ml-auto bg-black/80 border border-white/5 p-3 rounded-sm">
                            {message.content}
                          </div>
                        ) : (
                          /* Assistant message - left aligned, more detailed */
                          <div>
                            {/* Performance metrics */}
                            {message.speed && (
                              <div className="flex items-center text-xs text-white/50 mb-1 space-x-3">
                                <span className="flex items-center">
                                  <span className="text-green-400 mr-1">↗</span> {message.speed}
                                </span>
                                <span className="flex items-center">
                                  <span className="opacity-50 mr-1">|</span> {message.tokens} T/C
                                </span>
                              </div>
                            )}
                            
                            {/* Message content */}
                            <div className="text-white whitespace-pre-line">
                              {message.content.split('\n\n').map((paragraph, i) => (
                                <div key={i} className="mb-4 last:mb-0">
                                  {paragraph.includes('https://') ? (
                                    // Handle paragraphs with links
                                    paragraph.split('\n').map((line, j) => {
                                      if (line.includes('•')) {
                                        // It's a bullet point with link
                                        const parts = line.split(': ');
                                        if (parts.length === 2) {
                                          return (
                                            <div key={j} className="flex items-start mb-1">
                                              <span>{parts[0]}: </span>
                                              <a 
                                                href={parts[1]} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-blue-400 hover:underline ml-1 flex items-center"
                                              >
                                                {parts[1]}
                                                <ExternalLink className="w-3 h-3 ml-1" />
                                              </a>
                                            </div>
                                          );
                                        }
                                      }
                                      return <div key={j}>{line}</div>;
                                    })
                                  ) : (
                                    // Regular paragraph
                                    paragraph
                                  )}
                                </div>
                              ))}
                            </div>
                            
                            {/* Action buttons */}
                            <div className="flex space-x-2 mt-3">
                              <button className="text-xs text-white/50 hover:text-white border border-white/10 hover:border-white/30 px-2 py-1 transition-colors flex items-center">
                                <Clipboard className="w-3 h-3 mr-1" />
                                Copy
                              </button>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                    
                    {isTyping && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mb-6"
                      >
                        <div className="h-6 flex items-center">
                          <div className="typing-indicator">
                            <span></span>
                            <span></span>
                            <span></span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Input Area - Always at bottom */}
        <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-white/10 bg-gradient-to-t from-black via-black to-black/80">
          <div className="max-w-4xl mx-auto relative">
            <form onSubmit={handleSubmit} className="relative">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={hasInteracted ? "Message NOVA..." : "Ask NOVA..."}
                className="w-full bg-transparent px-6 py-5 focus:outline-none placeholder-white/30 text-white"
                onFocus={() => {
                  if (showWelcome && !hasInteracted) {
                    // Add a subtle highlight effect when focusing before first message
                    if (inputRef.current) {
                      inputRef.current.style.boxShadow = "0 0 20px rgba(138, 75, 255, 0.2)";
                    }
                  }
                }}
                onBlur={() => {
                  if (inputRef.current) {
                    inputRef.current.style.boxShadow = "none";
                  }
                }}
              />
              
              {/* Purple gradient effect when typing */}
              {input && (
                <div 
                  className="absolute bottom-0 left-0 right-0 h-[1px]"
                  style={{
                    background: 'linear-gradient(to right, rgba(138, 75, 255, 0.2), rgba(214, 51, 255, 0.6), rgba(138, 75, 255, 0.2))'
                  }}
                ></div>
              )}
              
              {/* Send button appears when typing */}
              {input && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  type="submit"
                  className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-3 py-1 text-sm rounded-sm"
                >
                  TO SEND
                </motion.button>
              )}
            </form>
            
            {/* Footer control bar */}
            <div className="px-6 py-3 flex justify-between items-center border-t border-white/5 text-xs text-white/40">
              <div className="flex items-center space-x-8">
                <span className="flex items-center">
                  <span className="opacity-70 mr-1">Ctrl</span>
                  <span className="bg-white/10 px-1">D</span>
                  <span className="ml-2">TO DICTATE</span>
                </span>
                
                <span className="flex items-center">
                  <span className="opacity-70 mr-1">Ctrl</span>
                  <span className="bg-white/10 px-1">O</span>
                  <span className="ml-2">TO SPEAK</span>
                </span>
              </div>
              
              {/* Help text instead of circular button */}
              <span className="text-white/40 hover:text-white/70 transition-colors cursor-pointer">
                HELP
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* CSS for typing indicator and other styles */}
      <style jsx global>{`
        .typing-indicator {
          display: flex;
          align-items: center;
        }
        
        .typing-indicator span {
          height: 7px;
          width: 7px;
          background: rgba(255, 255, 255, 0.5);
          border-radius: 50%;
          display: inline-block;
          margin-right: 5px;
          animation: bounce 1.5s infinite ease-in-out;
        }
        
        .typing-indicator span:nth-child(1) {
          animation-delay: 0s;
        }
        
        .typing-indicator span:nth-child(2) {
          animation-delay: 0.2s;
        }
        
        .typing-indicator span:nth-child(3) {
          animation-delay: 0.4s;
          margin-right: 0;
        }
        
        @keyframes bounce {
          0%, 60%, 100% {
            transform: translateY(0);
          }
          30% {
            transform: translateY(-4px);
          }
        }
        
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
        
        .scrollbar-none {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </main>
  )
}