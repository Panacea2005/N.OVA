"use client"

import { useEffect, useState, useRef, ChangeEvent } from "react"
import { motion, AnimatePresence } from "framer-motion"
import dynamic from "next/dynamic"
import Image from "next/image"
import { 
  Send, 
  Clipboard, 
  ExternalLink, 
  Trash, 
  Plus, 
  Search, 
  Clock, 
  Pin, 
  MoreVertical,
  Bot,
  User,
  Paperclip,
  X,
  CheckIcon,
  Menu,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { Canvas } from "@react-three/fiber"
import { chatService, Message as ChatServiceMessage } from "@/lib/services/chatbot/chatService"
import { contractAnalyzer } from "@/lib/services/chatbot/contractAnalyzer" 

// Import the Navigation component
const Navigation = dynamic(() => import("@/components/navigation"), {
  ssr: false,
})

// Import the 3D dot arch visualization component
const DynamicDotArchVisualization = dynamic(
  () => import("@/components/3d/dot-arch-visualization"),
  {
    ssr: false,
  }
)

// We'll use a simplified version of the chat store for history
const chatStore = {
  getChatHistory: () => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('chatHistory')
      return stored ? JSON.parse(stored) : []
    }
    return []
  },
  saveChat: (chat: ChatHistory) => {
    if (typeof window !== 'undefined') {
      const history = chatStore.getChatHistory()
      const updatedHistory = [chat, ...history.filter((c: { id: number }) => c.id !== chat.id)]
      localStorage.setItem('chatHistory', JSON.stringify(updatedHistory))
    }
  },
  updateChat: (id: number, messages: Message[]) => {
    if (typeof window !== 'undefined') {
      const history = chatStore.getChatHistory()
      const chatIndex = history.findIndex((c: { id: number }) => c.id === id)
      if (chatIndex >= 0) {
        history[chatIndex].messages = messages
        localStorage.setItem('chatHistory', JSON.stringify(history))
      }
    }
  },
  deleteChat: (id: number) => {
    if (typeof window !== 'undefined') {
      const history = chatStore.getChatHistory()
      const updatedHistory = history.filter((c: { id: number }) => c.id !== id)
      localStorage.setItem('chatHistory', JSON.stringify(updatedHistory))
    }
  },
  pinChat: (id: number) => {
    if (typeof window !== 'undefined') {
      const history = chatStore.getChatHistory()
      const chatIndex = history.findIndex((c: { id: number }) => c.id === id)
      if (chatIndex >= 0) {
        history[chatIndex].pinned = !history[chatIndex].pinned
        localStorage.setItem('chatHistory', JSON.stringify(history))
      }
    }
  },
  generateChatTitle: (messages: Message[]): string => {
    // Get first user message as title, fallback to timestamp if none found
    const firstUserMessage = messages.find(m => m.role === 'user')
    if (firstUserMessage) {
      // Truncate to first 30 chars
      return firstUserMessage.content.substring(0, 30) + (firstUserMessage.content.length > 30 ? '...' : '')
    }
    return `Chat ${new Date().toLocaleString()}`
  }
}

// Model options for the dropdown
const modelOptions: Record<
  string,
  { name: string; tag: string; gradient: string }
> = {
  "llama3-70b-8192": {
    name: "llama3-70b-8192",
    tag: "Best for Coding",
    gradient: "bg-gradient-to-r from-blue-500 to-purple-500",
  },
  "llama-3.3-70b-versatile": {
    name: "llama-3.3-70b-versatile",
    tag: "Gen AI & Reasoning",
    gradient: "bg-gradient-to-r from-green-500 to-teal-500",
  },
  "meta-llama/llama-4-maverick-17b-128e-instruct": {
    name: "meta-llama/llama-4-maverick-17b-128e-instruct",
    tag: "Fast & Balanced",
    gradient: "bg-gradient-to-r from-yellow-500 to-orange-500",
  },
}

// Define the message type that combines features from both implementations
type Message = {
  role: "user" | "assistant" | "system"
  content: string
  timestamp?: Date
  speed?: string
  tokens?: number
  analysisResult?: any
}

// Chat history type
type ChatHistory = {
  id: number
  title: string
  date: string
  messages: Message[]
  pinned?: boolean
}

export default function AIPage() {
  // State management
  const [mounted, setMounted] = useState(false)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentChatId, setCurrentChatId] = useState<number | null>(null)
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [showInitialMessage, setShowInitialMessage] = useState(true)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadedFileContent, setUploadedFileContent] = useState<string | null>(null)
  const [selectedModel, setSelectedModel] = useState<keyof typeof modelOptions>("llama3-70b-8192")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [copied, setCopied] = useState(false)
  const [copiedSuggestions, setCopiedSuggestions] = useState(false)
  
  // Refs
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Effects
  useEffect(() => {
    setMounted(true)
    
    // Load chat history on component mount
    const history = chatStore.getChatHistory().map((chat: any) => ({
      ...chat,
      title: chatStore.generateChatTitle(chat.messages),
    }))
    setChatHistory(history)
    
    return () => {
      // Cleanup any event listeners or animations
    }
  }, [])

  useEffect(() => {
    // Scroll to bottom when messages change
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

  // Event handlers
  const handleSend = async () => {
    if ((!input.trim() && !uploadedFile) || isLoading) return
    
    if (showInitialMessage) setShowInitialMessage(false)
    
    try {
      setIsLoading(true)
      const userMessage: Message = {
        role: "user",
        // Include file information in the message content for proper display
        content: uploadedFile 
          ? input.trim() 
            ? `${input}\n\nFile: ${uploadedFile.name}` 
            : `File: ${uploadedFile.name}`
          : input,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, userMessage])
      setInput("")
      setUploadedFile(null)

      // Add temporary loading message
      setMessages((prev) => [...prev, { role: "assistant", content: "..." }])

      let codeContent = uploadedFileContent || input
      const isSolana = chatService.detectSolanaCode(codeContent)
      let displayedResponse = ""
      
      if (isSolana) {
        const analysis = await contractAnalyzer.analyzeContract(
          codeContent,
          selectedModel
        )
        setMessages((prev) => [
          ...prev.slice(0, -1),
          { role: "assistant", content: "", analysisResult: analysis },
        ])
        setUploadedFileContent(null)
      } else {
        const response = await chatService.sendMessage(
          [userMessage as ChatServiceMessage],
          selectedModel
        )
        
        // Simulate typewriter effect
        const words = response.split(" ")
        for (let i = 0; i < words.length; i++) {
          displayedResponse += words[i] + " "
          setMessages((prev) =>
            prev
              .slice(0, -1)
              .concat({ 
                role: "assistant", 
                content: displayedResponse,
                timestamp: new Date(),
                speed: "2.3x FASTER",
                tokens: Math.floor(displayedResponse.length / 4) // Rough token estimate
              })
          )
          if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
          }
          await new Promise((resolve) => setTimeout(resolve, 50))
        }
      }

      // Save the chat after the message exchange
      const updatedMessages: Message[] = [...messages, userMessage, { 
        role: "assistant" as "assistant", 
        content: displayedResponse || "",
        timestamp: new Date()
      }]
      
      if (currentChatId === null) {
        // New chat
        const newChat: ChatHistory = {
          id: Date.now(), // Unique ID based on timestamp
          title: chatStore.generateChatTitle(updatedMessages),
          date: new Date().toLocaleDateString(),
          messages: updatedMessages,
        }
        chatStore.saveChat(newChat)
        setCurrentChatId(newChat.id)
      } else {
        // Update existing chat
        chatStore.updateChat(currentChatId, updatedMessages)
      }

      // Refresh chat history in the sidebar
      const history = chatStore.getChatHistory().map((chat: any) => ({
        ...chat,
        title: chatStore.generateChatTitle(chat.messages),
      }))
      setChatHistory(history)

    } catch (error) {
      console.error("Error in handleSend:", error)
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { 
          role: "assistant", 
          content: "I encountered an error processing your request. Please try again.",
          timestamp: new Date()
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setUploadedFile(file)
      const fileContent = await file.text()
      setUploadedFileContent(fileContent)
    }
  }

  const handleCopyText = (text: string, type: "full" | "suggestions" = "full") => {
    navigator.clipboard.writeText(text).then(() => {
      if (type === "full") {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } else {
        setCopiedSuggestions(true)
        setTimeout(() => setCopiedSuggestions(false), 2000)
      }
    })
  }

  const handleLoadChat = (chatId: number) => {
    const chat = chatStore.getChatHistory().find((c: any) => c.id === chatId)
    if (chat) {
      setMessages(chat.messages)
      setCurrentChatId(chat.id)
      setShowInitialMessage(false)
      if (window.innerWidth < 768) {
        setSidebarOpen(false) // Close sidebar on mobile after selection
      }
    }
  }

  const handleDeleteChat = (chatId: number) => {
    chatStore.deleteChat(chatId)
    setChatHistory(chatStore.getChatHistory())
    if (currentChatId === chatId) {
      setMessages([])
      setShowInitialMessage(true)
      setCurrentChatId(null)
    }
  }

  const handlePinChat = (chatId: number) => {
    chatStore.pinChat(chatId)
    setChatHistory(chatStore.getChatHistory())
  }

  const handleNewChat = () => {
    setMessages([])
    setShowInitialMessage(true)
    setCurrentChatId(null)
    if (window.innerWidth < 768) {
      setSidebarOpen(false) // Close sidebar on mobile
    }
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  // Render helper functions
  const renderAnalysisResult = (analysis: any) => {
    // Calculate security score color and gradient
    const getScoreColor = (score: number) => {
      if (score < 30) return { color: "text-red-500", gradient: "from-red-700 to-red-500", width: `${score}%` };
      if (score < 50) return { color: "text-orange-500", gradient: "from-orange-700 to-orange-500", width: `${score}%` };
      if (score < 70) return { color: "text-yellow-500", gradient: "from-yellow-700 to-yellow-500", width: `${score}%` };
      if (score < 90) return { color: "text-green-500", gradient: "from-green-700 to-green-500", width: `${score}%` };
      return { color: "text-emerald-500", gradient: "from-emerald-700 to-emerald-500", width: `${score}%` };
    };
    
    const scoreStyle = getScoreColor(analysis.securityScore);
    
    // Count issues by severity
    const criticalCount = analysis.critical?.length || 0;
    const highCount = analysis.high?.length || 0;
    const mediumCount = analysis.medium?.length || 0;
    const lowCount = analysis.low?.length || 0;
    const infoCount = analysis.informational?.length || 0;
    const optCount = analysis.optimizations?.length || 0;
    
    return (
      <div className="w-full flex flex-col space-y-8">
        {/* Futuristic Analysis Header */}
        <div className="relative border border-white/10 rounded-md overflow-hidden">
          <div 
            className="absolute inset-0 z-0 opacity-20"
            style={{ 
              backgroundImage: 'radial-gradient(rgba(138, 75, 255, 0.2) 1px, transparent 1px)', 
              backgroundSize: '10px 10px' 
            }}>
          </div>
          
          <div className="relative z-10 p-6 backdrop-blur-sm bg-gradient-to-b from-black/60 to-black/80">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                    <AlertCircle className="w-3 h-3 text-white" />
                  </div>
                  Contract Security Analysis
                </h3>
                <p className="text-white/60 text-sm max-w-lg">
                  {analysis.summary || "Analysis of potential security concerns and optimizations in your Solana program."}
                </p>
              </div>
              
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-white/60">SCAN TIME</span>
                  <span className="text-sm font-mono text-blue-400">{analysis.scanDuration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/60">LOC</span>
                  <span className="text-sm font-mono text-purple-400">{analysis.linesOfCode}</span>
                </div>
              </div>
            </div>
            
            {/* Animated Security Score */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-medium text-white">Security Score</h4>
                <span className={`text-xl font-bold font-mono ${scoreStyle.color}`}>
                  {analysis.securityScore}/100
                </span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: "0%" }}
                  animate={{ width: scoreStyle.width }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={`h-full bg-gradient-to-r ${scoreStyle.gradient} rounded-full`}
                />
              </div>
            </div>
            
            {/* Issues Summary - Hexagonal Design */}
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-4">
              {criticalCount > 0 && (
                <div className="relative overflow-hidden border border-red-700/50 bg-black/30 p-3 rounded-md backdrop-blur-sm">
                  <div className="absolute top-0 right-0 w-1 h-1 bg-red-500 rounded-full animate-pulse"></div>
                  <p className="text-red-500 text-xl font-bold">{criticalCount}</p>
                  <p className="text-xs text-white/60">Critical</p>
                </div>
              )}
              
              {highCount > 0 && (
                <div className="relative overflow-hidden border border-orange-700/50 bg-black/30 p-3 rounded-md backdrop-blur-sm">
                  <div className="absolute top-0 right-0 w-1 h-1 bg-orange-500 rounded-full animate-pulse"></div>
                  <p className="text-orange-500 text-xl font-bold">{highCount}</p>
                  <p className="text-xs text-white/60">High</p>
                </div>
              )}
              
              {mediumCount > 0 && (
                <div className="relative overflow-hidden border border-yellow-700/50 bg-black/30 p-3 rounded-md backdrop-blur-sm">
                  <p className="text-yellow-500 text-xl font-bold">{mediumCount}</p>
                  <p className="text-xs text-white/60">Medium</p>
                </div>
              )}
              
              {lowCount > 0 && (
                <div className="relative overflow-hidden border border-blue-700/50 bg-black/30 p-3 rounded-md backdrop-blur-sm">
                  <p className="text-blue-500 text-xl font-bold">{lowCount}</p>
                  <p className="text-xs text-white/60">Low</p>
                </div>
              )}
              
              {infoCount > 0 && (
                <div className="relative overflow-hidden border border-indigo-700/50 bg-black/30 p-3 rounded-md backdrop-blur-sm">
                  <p className="text-indigo-500 text-xl font-bold">{infoCount}</p>
                  <p className="text-xs text-white/60">Info</p>
                </div>
              )}
              
              {optCount > 0 && (
                <div className="relative overflow-hidden border border-green-700/50 bg-black/30 p-3 rounded-md backdrop-blur-sm">
                  <p className="text-green-500 text-xl font-bold">{optCount}</p>
                  <p className="text-xs text-white/60">Optimizations</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Code Suggestions */}
        {analysis.modificationSuggestions && (
          <div className="w-full relative overflow-hidden border border-white/10 rounded-md bg-gradient-to-b from-black/60 to-black/80 backdrop-blur-sm">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-70"></div>
            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-purple-500 opacity-70 animate-pulse"></div>
            
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-white flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-r from-blue-600 to-green-600 flex items-center justify-center">
                    <CheckIcon className="w-3 h-3 text-white" />
                  </div>
                  Suggested Modifications
                </h3>
                <button
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-xs text-white/80 hover:text-white border border-white/10 hover:border-white/30 transition-colors flex items-center gap-2 rounded-md"
                  onClick={() => handleCopyText(analysis.modificationSuggestions, "suggestions")}
                >
                  {copiedSuggestions ? (
                    <>
                      <CheckIcon className="w-3 h-3 text-green-500" />
                      <span className="text-green-500">Copied</span>
                    </>
                  ) : (
                    <>
                      <Clipboard className="w-3 h-3" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>

              {/* Code Container with line numbers */}
              <div className="rounded-md overflow-hidden border border-white/10">
                <div className="bg-black/50 text-white/90 overflow-x-auto text-sm font-mono leading-5">
                  <pre className="p-4 relative">
                    <code>
                      {analysis.modificationSuggestions}
                    </code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Issues Detail Section */}
        {(criticalCount > 0 || highCount > 0) && (
          <div className="w-full relative overflow-hidden border border-white/10 rounded-md bg-gradient-to-b from-black/60 to-black/80 backdrop-blur-sm">
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-70"></div>
            
            <div className="p-6">
              <h3 className="text-lg font-medium text-white flex items-center gap-2 mb-4">
                <div className="w-5 h-5 rounded-full bg-gradient-to-r from-red-600 to-orange-600 flex items-center justify-center">
                  <AlertCircle className="w-3 h-3 text-white" />
                </div>
                Critical Issues
              </h3>
              
              {criticalCount > 0 && analysis.critical.map((issue: any, idx: number) => (
                <div key={`critical-${idx}`} className="mb-4 last:mb-0 border-l-2 border-red-500/50 pl-4">
                  <h4 className="text-red-400 font-medium">{issue.type}</h4>
                  <p className="text-white/80 text-sm mb-2">{issue.description}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs mb-2">
                    <div>
                      <span className="text-white/50">Location: </span>
                      <span className="text-white/80">{issue.location || "Unknown"}</span>
                    </div>
                    <div>
                      <span className="text-white/50">Impact: </span>
                      <span className="text-white/80">{issue.impact}</span>
                    </div>
                  </div>
                  <p className="text-green-400 text-sm">
                    <span className="text-white/50">Recommendation: </span>
                    {issue.recommendation}
                  </p>
                </div>
              ))}
              
              {highCount > 0 && analysis.high.map((issue: any, idx: number) => (
                <div key={`high-${idx}`} className="mb-4 last:mb-0 border-l-2 border-orange-500/50 pl-4">
                  <h4 className="text-orange-400 font-medium">{issue.type}</h4>
                  <p className="text-white/80 text-sm mb-2">{issue.description}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs mb-2">
                    <div>
                      <span className="text-white/50">Location: </span>
                      <span className="text-white/80">{issue.location || "Unknown"}</span>
                    </div>
                    <div>
                      <span className="text-white/50">Impact: </span>
                      <span className="text-white/80">{issue.impact}</span>
                    </div>
                  </div>
                  <p className="text-green-400 text-sm">
                    <span className="text-white/50">Recommendation: </span>
                    {issue.recommendation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Filter and sort chat history
  const filteredHistory = chatHistory.filter((chat) =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const sortedHistory = [...filteredHistory].sort(
    (a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0)
  )

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
      
      {/* Navigation */}
      <Navigation />
      
      {/* Mobile Sidebar Toggle */}
      <button 
        onClick={toggleSidebar}
        className="fixed z-30 top-20 left-4 md:hidden bg-black/50 p-2 rounded-md border border-white/10"
      >
        <Menu className="w-5 h-5 text-white/70" />
      </button>

      {/* Collapsible Sidebar - Chat History */}
      <div 
        className={`fixed left-0 top-0 bottom-0 w-64 bg-black/80 backdrop-blur-sm z-20 border-r border-white/10 pt-16 transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ boxShadow: sidebarOpen ? '0 0 15px rgba(0, 0, 0, 0.5)' : 'none' }}
      >
        <div className="p-4">
          <button
            onClick={handleNewChat}
            className="w-full py-2 px-3 text-sm flex items-center gap-2 border border-white/10 hover:border-white/30 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </button>
        </div>
        
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-white/30" />
            <input
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border border-white/10 py-2 pl-8 pr-2 text-sm focus:outline-none focus:border-purple-500/50 transition-colors"
            />
          </div>
        </div>
        
        <div className="px-4 overflow-y-auto max-h-[calc(100vh-200px)]">
          <div className="space-y-2">
            {sortedHistory.map((chat) => (
              <div key={chat.id} className="flex justify-between items-center">
                <button
                  className="w-full text-left py-2 px-2 text-sm hover:bg-white/5 flex items-center gap-2 transition-colors"
                  onClick={() => handleLoadChat(chat.id)}
                >
                  <Clock className="w-3 h-3 text-white/50" />
                  <div className="flex-1 truncate">
                    <div className="text-white/80">{chat.title}</div>
                    <div className="text-xs text-white/30">{chat.date}</div>
                  </div>
                </button>
                <div className="flex">
                  <button 
                    onClick={() => handlePinChat(chat.id)}
                    className="p-1 text-white/30 hover:text-white/90"
                  >
                    <Pin className={`w-3 h-3 ${chat.pinned ? "text-purple-400" : ""}`} />
                  </button>
                  <button 
                    onClick={() => handleDeleteChat(chat.id)}
                    className="p-1 text-white/30 hover:text-red-400"
                  >
                    <Trash className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Models Selector in Sidebar */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10 bg-black/80">
          <h3 className="text-xs text-white/50 mb-2">MODEL</h3>
          <div className="space-y-2">
            {Object.entries(modelOptions).map(([modelKey, modelData]) => (
              <button
                key={modelKey}
                onClick={() => setSelectedModel(modelKey as keyof typeof modelOptions)}
                className={`w-full text-left py-1 px-2 text-sm border ${
                  selectedModel === modelKey ? 'border-purple-500/50 bg-purple-900/20' : 'border-white/5 hover:border-white/20'
                } transition-colors rounded-sm`}
              >
                <div className="flex flex-col">
                  <span className="text-white/80 text-xs">{modelData.name}</span>
                  <span className={`text-transparent bg-clip-text text-xs ${modelData.gradient}`}>
                    {modelData.tag}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar Toggle Button - Integrated into sidebar border */}
      <button 
        onClick={toggleSidebar}
        className={`fixed z-30 transition-all duration-300 ${
          sidebarOpen ? 
          'left-64 top-1/2 -translate-y-1/2 h-16 w-6 rounded-r-md' : 
          'left-0 top-1/2 -translate-y-1/2 h-16 w-6 rounded-r-md'
        } hidden md:flex items-center justify-center bg-black/80 border-r border-t border-b border-white/10 backdrop-blur-sm`}
        style={{ borderLeft: sidebarOpen ? 'none' : '1px solid rgba(255, 255, 255, 0.1)' }}
      >
        {sidebarOpen ? 
          <ChevronLeft className="w-4 h-4 text-white/70" /> : 
          <ChevronRight className="w-4 h-4 text-white/70" />
        }
      </button>

      {/* Dark overlay when sidebar is open on mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-10 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content - Adjust padding to accommodate sidebar */}
      <div className={`relative z-10 pt-16 min-h-screen ${sidebarOpen ? 'md:pl-64' : 'md:pl-0'} transition-all duration-300`}>
        {/* Welcome Visualization State (before first message) */}
        {showInitialMessage && (
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
          {(!showInitialMessage || messages.length > 0) && (
            <motion.div 
              className={`absolute inset-0 flex flex-col pt-16 ${sidebarOpen ? 'md:pl-64' : 'md:pl-0'} transition-all duration-300`}
              initial={{ opacity: messages.length > 0 ? 1 : 0 }}
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
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className={`mb-8 ${message.role === "user" ? "ml-auto" : "ml-0"}`}
                        style={{ maxWidth: "90%" }}
                      >
                        {message.role === "user" ? (
                          /* User message - right aligned with user avatar */
                          <div className="flex items-start gap-3 justify-end ml-auto">
                            <div className="bg-black/80 border border-white/10 p-3 rounded-sm">
                              {message.content}
                            </div>
                            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-white/10 overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600">
                              <Image 
                                src="/images/user.png" 
                                alt="User" 
                                width={32} 
                                height={32}
                                className="object-cover"
                              />
                            </div>
                          </div>
                        ) : (
                          /* Assistant message - left aligned with bot avatar */
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-white/10 overflow-hidden bg-gradient-to-r from-indigo-600 to-violet-600">
                              <Image 
                                src="/images/logo.png" 
                                alt="NOVA" 
                                width={32} 
                                height={32}
                                className="object-cover"
                              />
                            </div>
                            
                            <div className="flex-1">
                              {/* Performance metrics - only show token count */}
                              {message.tokens && (
                                <div className="flex items-center text-xs text-white/50 mb-1">
                                  <span className="flex items-center">
                                    <span className="opacity-50 mr-1">|</span> {message.tokens} T/C
                                  </span>
                                </div>
                              )}
                              
                              {/* Message content or analysis result */}
                              {message.analysisResult ? (
                                renderAnalysisResult(message.analysisResult)
                              ) : (
                                <div className="text-white whitespace-pre-line">
                                  {message.content === "..." ? (
                                    <div className="futuristic-loading">
                                      <div className="loading-bar"></div>
                                    </div>
                                  ) : (
                                    message.content.split('\n\n').map((paragraph, i) => (
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
                                    ))
                                  )}
                                </div>
                              )}
                              
                              {/* Action buttons */}
                              {message.content !== "..." && (
                                <div className="flex space-x-2 mt-3">
                                  <button 
                                    className="text-xs text-white/50 hover:text-white border border-white/10 hover:border-white/30 px-2 py-1 transition-colors flex items-center"
                                    onClick={() => handleCopyText(message.content)}
                                  >
                                    {copied ? (
                                      <>
                                        <CheckIcon className="w-3 h-3 text-green-500 mr-1" />
                                        <span className="text-green-500">Copied</span>
                                      </>
                                    ) : (
                                      <>
                                        <Clipboard className="w-3 h-3 mr-1" />
                                        Copy
                                      </>
                                    )}
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Input Area - Always at bottom */}
        <div className={`fixed bottom-0 left-0 right-0 z-20 border-t border-white/10 bg-gradient-to-t from-black via-black to-black/80 ${sidebarOpen ? 'md:pl-64' : 'md:pl-0'} transition-all duration-300`}>
          <div className="max-w-4xl mx-auto relative">
            {/* Uploaded file display - Redesigned with pulse effect */}
            {uploadedFile && (
              <div className="px-6 pt-2 pb-0">
                <div className="flex items-center gap-2 p-3 border border-purple-500/30 rounded-sm bg-gradient-to-r from-purple-900/20 to-black/30 text-white/80 text-sm relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-indigo-600/5 opacity-30"></div>
                  <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50"></div>
                  
                  <div className="relative z-10 flex items-center gap-3 w-full">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-r from-purple-600 to-indigo-600 animate-pulse">
                      <Paperclip className="w-4 h-4 text-white" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="font-medium">{uploadedFile.name}</div>
                      <div className="text-xs text-white/50">Ready for analysis</div>
                    </div>
                    
                    <button 
                      onClick={() => setUploadedFile(null)}
                      className="ml-auto text-white/50 hover:text-white/90 w-8 h-8 rounded-full flex items-center justify-center border border-white/10 hover:border-white/30 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="relative">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={messages.length > 0 ? "Message NOVA..." : "Ask NOVA..."}
                className="w-full bg-transparent px-6 py-5 focus:outline-none placeholder-white/30 text-white"
                onKeyDown={handleKeyDown}
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
              
              {/* File upload button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute right-16 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors"
              >
                <Paperclip className="w-5 h-5" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".rs"
                className="hidden"
                onChange={handleFileUpload}
              />
            </form>
            
            {/* Footer control bar */}
            <div className="px-6 py-3 flex justify-between items-center border-t border-white/5 text-xs text-white/40">
              <div className="flex items-center space-x-8">
                <span className="flex items-center">
                  <span className="opacity-70 mr-1">Press</span>
                  <span className="bg-white/10 px-1">Enter</span>
                  <span className="ml-2">TO SEND</span>
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

      {/* CSS for loading animation and other styles */}
      <style jsx global>{`
        .futuristic-loading {
          width: 100%;
          max-width: 150px;
          height: 4px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
          overflow: hidden;
          position: relative;
          margin: 10px 0;
        }
        
        .loading-bar {
          width: 30%;
          height: 100%;
          background: linear-gradient(90deg, rgba(138, 75, 255, 0.2), rgba(214, 51, 255, 1), rgba(138, 75, 255, 0.2));
          position: absolute;
          animation: moveBar 1.5s infinite ease-in-out;
          border-radius: 2px;
          box-shadow: 0 0 10px rgba(214, 51, 255, 0.5);
        }
        
        @keyframes moveBar {
          0% { left: -30%; }
          100% { left: 100%; }
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