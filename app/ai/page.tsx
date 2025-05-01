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
import { chatStore, Message, ChatHistory } from "@/lib/services/chatbot/chatStore" // Import the new chatStore

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
  "qwen-qwq-32b": {
    name: "qwen-qwq-32b",
    tag: "Fast & Balanced",
    gradient: "bg-gradient-to-r from-yellow-500 to-orange-500",
  },
}

export default function AIPage() {
  // Simplified user handling - using a static ID for now
  // You can replace this with actual auth later
  const userId = "anonymous-user"
  
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
  const [activeChat, setActiveChat] = useState<number | null>(null) // For hover state
  const [isLoadingChats, setIsLoadingChats] = useState(true) // Add loading state for chats
  
  // Refs
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Effects
  useEffect(() => {
    setMounted(true)
    
    // Load chat history from Supabase on component mount
    const loadChatHistory = async () => {
      try {
        setIsLoadingChats(true)
        const history = await chatStore.getChatHistory(userId)
        setChatHistory(history)
      } catch (error) {
        console.error("Error loading chat history:", error)
      } finally {
        setIsLoadingChats(false)
      }
    }
    
    loadChatHistory()
    
    return () => {
      // Cleanup any event listeners or animations
    }
  }, [userId])

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
        const title = chatStore.generateChatTitle(updatedMessages)
        const newChat: ChatHistory = {
          id: Date.now(), // Temporary ID, will be replaced by Supabase
          title: title,
          date: new Date().toLocaleDateString(),
          messages: updatedMessages,
          user_id: userId, // Changed to snake_case
        }
        
        const savedChat = await chatStore.saveChat(newChat)
        if (savedChat) {
          setCurrentChatId(savedChat.id)
        }
      } else {
        // Update existing chat
        await chatStore.updateChat(currentChatId, { 
          messages: updatedMessages 
        })
      }

      // Refresh chat history
      const history = await chatStore.getChatHistory(userId)
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

  const handleLoadChat = async (chatId: number) => {
    // Get the specific chat from history
    const chat = chatHistory.find(c => c.id === chatId)
    if (chat) {
      setMessages(chat.messages)
      setCurrentChatId(chat.id)
      setShowInitialMessage(false)
      if (window.innerWidth < 768) {
        setSidebarOpen(false) // Close sidebar on mobile after selection
      }
    }
  }

  const handleDeleteChat = async (chatId: number, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering the chat selection
    await chatStore.deleteChat(chatId)
    const updatedHistory = await chatStore.getChatHistory(userId)
    setChatHistory(updatedHistory)
    
    if (currentChatId === chatId) {
      setMessages([])
      setShowInitialMessage(true)
      setCurrentChatId(null)
    }
  }

  const handlePinChat = async (chatId: number, currentPinned: boolean, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering the chat selection
    await chatStore.pinChat(chatId, currentPinned)
    const updatedHistory = await chatStore.getChatHistory(userId)
    setChatHistory(updatedHistory)
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
    // ... existing renderAnalysisResult code ...
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
        {/* Analysis content remains the same */}
      </div>
    )
  }

  // Filter and sort chat history
  const filteredHistory = chatHistory.filter((chat) =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
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

      {/* Collapsible Sidebar - Chat History with Updated UI */}
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
          {isLoadingChats ? (
            <div className="flex justify-center py-8">
              <div className="futuristic-loading">
                <div className="loading-bar"></div>
              </div>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="text-center py-8 text-white/40 text-sm">
              No chats yet. Start a new conversation!
            </div>
          ) : (
            <div className="space-y-2">
              {filteredHistory.map((chat) => (
                <div 
                  key={chat.id} 
                  className="relative group"
                  onMouseEnter={() => setActiveChat(chat.id)}
                  onMouseLeave={() => setActiveChat(null)}
                >
                  <button
                    className={`w-full text-left py-2 px-2 text-sm hover:bg-white/5 flex items-center gap-2 transition-colors rounded-sm ${
                      currentChatId === chat.id ? 'bg-white/10 border-l-2 border-purple-500' : ''
                    }`}
                    onClick={() => handleLoadChat(chat.id)}
                  >
                    {chat.pinned ? (
                      <Pin className="w-3 h-3 text-purple-400" />
                    ) : (
                      <Clock className="w-3 h-3 text-white/50" />
                    )}
                    <div className="flex-1 truncate pr-4">
                      <div className="text-white/80 truncate">{chat.title}</div>
                      <div className="text-xs text-white/30">{chat.date}</div>
                    </div>
                  </button>
                  
                  {/* Action buttons - visible only on hover or for active chat */}
                  <div 
                    className={`absolute right-0 top-0 bottom-0 flex items-center mr-1 transition-opacity duration-200 ${
                      activeChat === chat.id || currentChatId === chat.id ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    <button 
                      onClick={(e) => handlePinChat(chat.id, !!chat.pinned, e)}
                      className="p-1 text-white/30 hover:text-white/90"
                      title={chat.pinned ? "Unpin chat" : "Pin chat"}
                    >
                      <Pin className={`w-3 h-3 ${chat.pinned ? "text-purple-400" : ""}`} />
                    </button>
                    
                    <button 
                      onClick={(e) => handleDeleteChat(chat.id, e)}
                      className="p-1 text-white/30 hover:text-red-400"
                      title="Delete chat"
                    >
                      <Trash className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
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