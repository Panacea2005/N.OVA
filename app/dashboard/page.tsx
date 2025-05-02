"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  BarChart3, 
  Wallet, 
  MessageCircle, 
  Users, 
  Sparkles, 
  ChevronDown, 
  Settings, 
  Bell, 
  Search, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown, 
  ArrowRight, 
  ChevronRight, 
  Filter,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
  Menu,
  X,
  ExternalLink,
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import dynamic from "next/dynamic"

const Navigation = dynamic(() => import("@/components/navigation"), {
  ssr: false,
  loading: () => <div className="h-16 border-b border-white/10"></div>,
})

const Footer = dynamic(() => import("@/components/footer"), {
  ssr: false,
  loading: () => <div className="h-16 border-t border-white/10"></div>,
})

// 3D Banner Component - Dynamically imported
const NovaBanner = dynamic(() => import('@/components/3d/nova-banner'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-40 bg-gradient-to-r from-purple-900/30 to-blue-900/30 animate-pulse rounded-xl flex items-center justify-center">
      <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
        Loading N.OVA
      </div>
    </div>
  )
})

// Main tab components with dynamic imports
const PortfolioTab = dynamic(() => import('./components/portfolio-tab'), {
  ssr: false,
  loading: () => <div className="space-y-6 animate-pulse">
    <div className="h-80 bg-white/5 rounded-xl border border-white/10 mb-6"></div>
    <div className="h-96 bg-white/5 rounded-xl border border-white/10"></div>
  </div>
})

const SentimentTab = dynamic(() => import('./components/sentiment-tab'), {
  ssr: false,
  loading: () => <div className="space-y-6 animate-pulse">
    <div className="h-80 bg-white/5 rounded-xl border border-white/10 mb-6"></div>
    <div className="h-96 bg-white/5 rounded-xl border border-white/10"></div>
  </div>
})

const CopyTradingTab = dynamic(() => import('./components/copy-trading-tab'), {
  ssr: false,
  loading: () => <div className="space-y-6 animate-pulse">
    <div className="h-80 bg-white/5 rounded-xl border border-white/10 mb-6"></div>
    <div className="h-96 bg-white/5 rounded-xl border border-white/10"></div>
  </div>
})

const AIInsightsTab = dynamic(() => import('./components/ai-insights-tab'), {
  ssr: false,
  loading: () => <div className="space-y-6 animate-pulse">
    <div className="h-80 bg-white/5 rounded-xl border border-white/10 mb-6"></div>
    <div className="h-96 bg-white/5 rounded-xl border border-white/10"></div>
  </div>
})

type TabType = "dashboard" | "sentiment" | "copyTrading" | "aiInsights"

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<TabType>("dashboard")
  const [walletConnected, setWalletConnected] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [loaded, setLoaded] = useState(false)
  
  // Mock user data
  const userData = {
    name: "Alex Quantum",
    wallet: "0x71C7...976F",
    totalPortfolioValue: 358727.42,
    portfolioChange24h: 8.01,
    portfolioChangeValue: 26582.31,
    identityScore: 87,
    notifications: 3,
    level: "Sovereign",
    tier: "Alpha",
    verified: true,
  }

  // Tabs configuration
  const tabs = [
    { id: "dashboard" as TabType, label: "Dashboard", icon: <BarChart3 className="h-4 w-4" /> },
    { id: "sentiment" as TabType, label: "Sentiment", icon: <MessageCircle className="h-4 w-4" /> },
    { id: "copyTrading" as TabType, label: "Copy Trading", icon: <Users className="h-4 w-4" /> },
    { id: "aiInsights" as TabType, label: "AI Insights", icon: <Sparkles className="h-4 w-4" /> },
  ]

  const handleConnectWallet = () => {
    setWalletConnected(true)
  }

  useEffect(() => {
    // Simulate loading time
    setTimeout(() => {
      setLoaded(true)
      // Default to connected wallet for demo
      setWalletConnected(true)
    }, 500)
  }, [])

  const renderTabContent = () => {
    switch(activeTab) {
      case "dashboard":
        return <PortfolioTab userData={userData} />;
      case "sentiment":
        return <SentimentTab />;
      case "copyTrading":
        return <CopyTradingTab walletConnected={walletConnected} handleConnectWallet={handleConnectWallet} />;
      case "aiInsights":
        return <AIInsightsTab userData={userData} />;
      default:
        return <PortfolioTab userData={userData} />;
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background Elements */}
      <div className="fixed inset-0 bg-gradient-to-br from-black via-purple-950/20 to-blue-950/20 opacity-80 z-0" />
      
      {/* Animated Background */}
      <div className="fixed inset-0 z-0 opacity-20">
        {Array.from({ length: 100 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-px h-px bg-white rounded-full animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDuration: `${Math.random() * 10 + 5}s`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>
      
      <Navigation />

      {/* Main Content Container - Added proper top margin to avoid navbar overlap */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 pb-20 md:pb-8 pt-20">
        {/* Improved 3D NOVA Banner */}
        <div className="mb-8">
          <NovaBanner />
        </div>
        
        {/* Dashboard Top Section with Tabs - STATIC (not fixed when scrolling) */}
        <div className="bg-black/40 backdrop-blur-md rounded-xl border border-white/10 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center p-4">
            {/* Tab Navigation */}
            <div className="flex items-center mb-4 md:mb-0">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-purple-600/40 to-blue-600/40 text-white"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
            
            {/* User Controls */}
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 bg-black/40 border border-white/10 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 w-48"
                />
              </div>
              
              {/* Notifications */}
              <div className="relative">
                <button
                  className="p-2 rounded-full bg-black/40 hover:bg-white/10 transition-colors relative"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <Bell className="h-5 w-5" />
                  {userData.notifications > 0 && (
                    <span className="absolute top-0 right-0 w-4 h-4 bg-purple-500 rounded-full text-xs flex items-center justify-center">
                      {userData.notifications}
                    </span>
                  )}
                </button>
                
                {/* Notifications Dropdown */}
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-80 bg-black/90 backdrop-blur-xl border border-white/10 rounded-lg shadow-lg z-50"
                    >
                      <div className="p-4 border-b border-white/10">
                        <h3 className="font-bold">Notifications</h3>
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        <div className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors">
                          <p className="text-sm font-medium">BTC just broke $65K resistance!</p>
                          <p className="text-xs text-white/60 mt-1">10 minutes ago</p>
                        </div>
                        <div className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors">
                          <p className="text-sm font-medium">New AI market analysis available</p>
                          <p className="text-xs text-white/60 mt-1">2 hours ago</p>
                        </div>
                        <div className="p-4 hover:bg-white/5 transition-colors">
                          <p className="text-sm font-medium">NOVA token price alert: +5.2%</p>
                          <p className="text-xs text-white/60 mt-1">Yesterday</p>
                        </div>
                      </div>
                      <div className="p-3 border-t border-white/10">
                        <button className="w-full text-center text-sm text-purple-400 hover:text-purple-300 transition-colors">
                          View all notifications
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              {/* Settings */}
              <button className="p-2 rounded-full bg-black/40 hover:bg-white/10 transition-colors">
                <Settings className="h-5 w-5" />
              </button>
              
              {/* Wallet */}
              {walletConnected ? (
                <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md rounded-lg px-3 py-1.5 border border-white/10">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-xs font-bold">
                    {userData.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{userData.name}</p>
                    <p className="text-xs text-white/60">{userData.wallet}</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-white/60" />
                </div>
              ) : (
                <button
                  onClick={handleConnectWallet}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg font-bold text-sm hover:from-purple-500 hover:to-blue-500 transition-all duration-300 flex items-center gap-2"
                >
                  <Wallet className="h-4 w-4" />
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Page Title Section */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400">
            {
              activeTab === 'dashboard' ? 'Portfolio Dashboard' :
              activeTab === 'sentiment' ? 'Social Sentiment' :
              activeTab === 'copyTrading' ? 'Copy Trading' :
              'AI Insights'
            }
          </h1>
          <p className="text-white/70">
            {
              activeTab === 'dashboard' ? 'Track your assets, tokens, and portfolio performance' :
              activeTab === 'sentiment' ? 'Monitor market sentiment and social trends' :
              activeTab === 'copyTrading' ? 'Follow top-performing traders' :
              'Get personalized AI-powered insights'
            }
          </p>
        </div>
        
        {/* Mobile Navigation */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.div
              initial={{ opacity: 0, x: -300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -300 }}
              className="fixed inset-0 z-50 md:hidden"
            >
              <div className="absolute inset-0 bg-black/80" onClick={() => setShowMobileMenu(false)}></div>
              <div className="absolute inset-y-0 left-0 w-64 bg-black/90 backdrop-blur-xl border-r border-white/10 p-6">
                <div className="flex justify-between items-center mb-8">
                  <div className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
                    NOVA
                  </div>
                  <button
                    className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <nav className="space-y-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      className={`w-full px-4 py-2 rounded-lg flex items-center gap-3 transition-colors ${
                        activeTab === tab.id
                          ? "bg-white/10 text-white"
                          : "text-white/60 hover:text-white hover:bg-white/5"
                      }`}
                      onClick={() => {
                        setActiveTab(tab.id)
                        setShowMobileMenu(false)
                      }}
                    >
                      {tab.icon}
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </nav>
                
                <div className="absolute bottom-8 left-0 right-0 px-6">
                  {walletConnected ? (
                    <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md rounded-lg p-3 border border-white/10">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-sm font-bold">
                        {userData.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{userData.name}</p>
                        <p className="text-xs text-white/60">{userData.wallet}</p>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        handleConnectWallet()
                        setShowMobileMenu(false)
                      }}
                      className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg font-bold text-sm hover:from-purple-500 hover:to-blue-500 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <Wallet className="h-4 w-4" />
                      Connect Wallet
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Fixed Mobile Tab Bar */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-xl border-t border-white/10">
          <div className="flex justify-around">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`px-3 py-4 flex flex-col items-center gap-1 transition-colors ${
                  activeTab === tab.id
                    ? "text-white"
                    : "text-white/60 hover:text-white"
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                <span className="text-xs">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Tab Content */}
        <div className={`transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}>
          {renderTabContent()}
        </div>
      </div>
      
      <Footer />
    </div>
  );
}