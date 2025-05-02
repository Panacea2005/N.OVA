"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowUpDown,
  ChevronDown,
  Wallet,
  Shield,
  Zap,
  Globe,
  Star,
  Crown,
  Cpu,
  CheckCircle2,
  Sparkles,
  Lock,
  Unlock,
  RefreshCw,
  Settings,
  X,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";

const Navigation = dynamic(() => import("@/components/navigation"), {
  ssr: false,
  loading: () => <div className="h-16" />,
});

const Footer = dynamic(() => import("@/components/footer"), {
  ssr: false,
  loading: () => <div className="h-16" />,
});

// Helper function to conditionally join classnames
const cn = (...classes: string[]) => {
  return classes.filter(Boolean).join(' ');
};

// Types
interface Badge {
  id: number;
  name: string;
  icon: JSX.Element;
  requiredAmount: number;
  description: string;
  unlocked: boolean;
  progress?: number;
  color: string;
  type: string;
}

const NovaDex = () => {
  const [mounted, setMounted] = useState(false);
  const [fromAmount, setFromAmount] = useState("1");
  const [toAmount, setToAmount] = useState("42.5");
  const [walletConnected, setWalletConnected] = useState(false);
  const [swapMode, setSwapMode] = useState<"market" | "limit">("market");
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [showBadgeDetails, setShowBadgeDetails] = useState(false);
  const [activeBadgeTab, setActiveBadgeTab] = useState("all");
  const [showSwapConfirmation, setShowSwapConfirmation] = useState(false);
  const [swapStatus, setSwapStatus] = useState<"pending" | "success" | "failed" | null>(null);

  // Mock token data
  const tokenData = {
    name: "NOVA",
    symbol: "$NOVA",
    price: 0.0235, // in SOL
    marketCap: "12.5M",
    circulatingSupply: "42M",
    totalSupply: "100M",
    holders: "8,742",
  };

  // Mock user data
  const userData = {
    balance: 125.5, // NOVA tokens
    solBalance: 2.45, // SOL
  };

  // Mock badge data
  const badges: Badge[] = [
    {
      id: 1,
      name: "Neural Access",
      icon: <Cpu className="h-6 w-6" />,
      requiredAmount: 100,
      description: "Access to Neural Network API endpoints and advanced AI features",
      unlocked: true,
      color: "from-blue-500 to-cyan-400",
      type: "utility"
    },
    {
      id: 2,
      name: "Identity Shield",
      icon: <Shield className="h-6 w-6" />,
      requiredAmount: 250,
      description: "Enhanced identity protection and privacy features",
      unlocked: false,
      progress: 0.5, // 50% progress
      color: "from-purple-500 to-blue-400",
      type: "security"
    },
    {
      id: 3,
      name: "Global Verification",
      icon: <Globe className="h-6 w-6" />,
      requiredAmount: 500,
      description: "Globally recognized identity verification across all partner platforms",
      unlocked: false,
      progress: 0.25, // 25% progress
      color: "from-indigo-500 to-purple-400",
      type: "verification"
    },
    {
      id: 4,
      name: "Quantum Boost",
      icon: <Zap className="h-6 w-6" />,
      requiredAmount: 1000,
      description: "Priority processing and enhanced computational resources",
      unlocked: false,
      progress: 0.1, // 10% progress
      color: "from-cyan-500 to-blue-400",
      type: "utility"
    },
    {
      id: 5,
      name: "Sovereign Status",
      icon: <Crown className="h-6 w-6" />,
      requiredAmount: 2500,
      description: "Exclusive governance rights and early access to new features",
      unlocked: false,
      progress: 0.05, // 5% progress
      color: "from-pink-500 to-purple-400",
      type: "governance"
    },
    {
      id: 6,
      name: "Stellar Identity",
      icon: <Star className="h-6 w-6" />,
      requiredAmount: 5000,
      description: "Highest tier of identity verification with cross-chain compatibility",
      unlocked: false,
      progress: 0.02, // 2% progress
      color: "from-amber-500 to-pink-400",
      type: "verification"
    },
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredBadges = activeBadgeTab === "all" 
    ? badges 
    : badges.filter(badge => badge.type === activeBadgeTab);

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value);
    // Mock conversion
    const numValue = Number.parseFloat(value) || 0;
    setToAmount((numValue * 42.5).toFixed(2));
  };

  const handleToAmountChange = (value: string) => {
    setToAmount(value);
    // Mock conversion
    const numValue = Number.parseFloat(value) || 0;
    setFromAmount((numValue / 42.5).toFixed(4));
  };

  const handleConnectWallet = () => {
    setWalletConnected(true);
  };

  const handleSwap = () => {
    setShowSwapConfirmation(true);
  };

  const confirmSwap = () => {
    setSwapStatus("pending");
    
    // Simulate transaction processing
    setTimeout(() => {
      setSwapStatus("success");
      
      // Close modal after showing confirmation
      setTimeout(() => {
        setShowSwapConfirmation(false);
        setSwapStatus(null);
      }, 2000);
    }, 2000);
  };

  const handleBadgeClick = (badge: Badge) => {
    setSelectedBadge(badge);
    setShowBadgeDetails(true);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading NOVA DEX...</div>
      </div>
    );
  }

  return (
    <main className="flex flex-col min-h-screen bg-black text-white font-mono">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-black via-black to-purple-950/90 opacity-90 z-0" />
      
      {/* Animated particles in background */}
      <div className="fixed inset-0 z-0 opacity-30">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-purple-500"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.8 + 0.2,
              boxShadow: "0 0 12px 3px rgba(139, 92, 246, 0.8)",
              animation: `float ${10 + Math.random() * 20}s linear infinite`
            }}
          />
        ))}
      </div>

      {/* Cyber grid background */}
      <div className="fixed inset-0 z-0 opacity-5 overflow-hidden">
        <div className="absolute inset-0" style={{ 
          backgroundImage: `linear-gradient(0deg, transparent 24%, rgba(165, 180, 252, 0.3) 25%, rgba(165, 180, 252, 0.3) 26%, transparent 27%, transparent 74%, rgba(165, 180, 252, 0.3) 75%, rgba(165, 180, 252, 0.3) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(165, 180, 252, 0.3) 25%, rgba(165, 180, 252, 0.3) 26%, transparent 27%, transparent 74%, rgba(165, 180, 252, 0.3) 75%, rgba(165, 180, 252, 0.3) 76%, transparent 77%, transparent)`,
          backgroundSize: '70px 70px' 
        }} />
      </div>

      {/* Navigation */}
      <Navigation />

      {/* Main Content Container */}
      <div className="relative z-10 flex-1 container mx-auto px-4 py-12 flex flex-col">
        <div className="max-w-3xl mx-auto w-full mb-8">
          {/* Title and Description */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400 mb-2">
              <span className="flex items-center justify-center gap-2">
                <Sparkles className="h-6 w-6 text-purple-400" />
                NOVA Token Swap
              </span>
            </h1>
            <p className="text-white/70 text-sm max-w-md mx-auto">
              Swap SOL for $NOVA tokens and unlock powerful identity features on the NOVA AI Platform
            </p>
          </div>

          {/* DEX Swap Module */}
          <div className="mb-10 animate-fadeIn">
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-black/80 to-purple-900/10 backdrop-blur-lg shadow-xl shadow-purple-900/20">
              {/* Background Glow Effects */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-40 h-40 rounded-full bg-purple-600/10 filter blur-3xl animate-pulse" />
                <div 
                  className="absolute bottom-1/4 right-1/4 w-60 h-60 rounded-full bg-blue-600/10 filter blur-3xl animate-pulse"
                  style={{ animationDelay: "1.5s" }}
                />
              </div>

              <div className="relative z-10 p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center text-sm font-bold shadow-lg shadow-purple-900/20">
                      N
                    </div>
                    <h2 className="text-xl font-medium">
                      <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
                        ${tokenData.price} SOL
                      </span>
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/10">
                      <RefreshCw className="h-4 w-4" />
                    </button>
                    <button className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/10">
                      <Settings className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Swap Mode Selector */}
                <div className="flex mb-5 p-1 bg-white/5 rounded-xl border border-white/10">
                  <button
                    className={`flex-1 py-2 flex items-center justify-center gap-2 text-center rounded-lg transition-all duration-300 ${
                      swapMode === "market"
                        ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-900/20"
                        : "text-white/60 hover:text-white hover:bg-white/5"
                    }`}
                    onClick={() => setSwapMode("market")}
                  >
                    <span className="text-sm font-medium">Market</span>
                  </button>
                  <button
                    className={`flex-1 py-2 flex items-center justify-center gap-2 text-center rounded-lg transition-all duration-300 ${
                      swapMode === "limit"
                        ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-900/20"
                        : "text-white/60 hover:text-white hover:bg-white/5"
                    }`}
                    onClick={() => setSwapMode("limit")}
                  >
                    <span className="text-sm font-medium">Limit</span>
                  </button>
                </div>

                {/* From Token */}
                <div className="mb-2">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-white/60 text-sm">From</label>
                    <span className="text-xs text-white/60">Balance: {userData.solBalance} SOL</span>
                  </div>
                  <div className="group flex items-center bg-white/5 rounded-xl p-4 border border-white/10 transition-all duration-300 hover:border-purple-500/50 focus-within:border-purple-500/50 focus-within:bg-white/8">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={fromAmount}
                        onChange={(e) => handleFromAmountChange(e.target.value)}
                        className="w-full bg-transparent text-2xl focus:outline-none"
                        placeholder="0.0"
                      />
                    </div>
                    <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm hover:bg-white/15 transition-colors cursor-pointer">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center text-xs font-bold shadow-lg shadow-orange-900/20">
                        SOL
                      </div>
                      <span className="font-bold">SOL</span>
                      <ChevronDown className="h-4 w-4 text-white/60" />
                    </div>
                  </div>
                  <div className="flex justify-end mt-2 gap-1">
                    {["25%", "50%", "75%", "MAX"].map((percent) => (
                      <button
                        key={percent}
                        className="px-2 py-1 text-xs bg-white/5 rounded-lg hover:bg-white/10 transition-colors border border-white/5 hover:border-white/20"
                      >
                        {percent}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Swap Icon */}
                <div className="flex justify-center my-3 relative">
                  <div className="absolute left-0 right-0 border-t border-white/5 top-1/2 -translate-y-1/2"></div>
                  <button className="relative z-10 p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors border border-white/10 shadow-lg shadow-purple-900/10 group">
                    <ArrowUpDown className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  </button>
                </div>

                {/* To Token */}
                <div className="mb-5">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-white/60 text-sm">To</label>
                    <span className="text-xs text-white/60">Balance: {userData.balance} NOVA</span>
                  </div>
                  <div className="group flex items-center bg-white/5 rounded-xl p-4 border border-white/10 transition-all duration-300 hover:border-purple-500/50 focus-within:border-purple-500/50 focus-within:bg-white/8">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={toAmount}
                        onChange={(e) => handleToAmountChange(e.target.value)}
                        className="w-full bg-transparent text-2xl focus:outline-none"
                        placeholder="0.0"
                      />
                    </div>
                    <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm hover:bg-white/15 transition-colors cursor-pointer">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-xs font-bold shadow-lg shadow-purple-900/20">
                        N
                      </div>
                      <span className="font-bold">NOVA</span>
                      <ChevronDown className="h-4 w-4 text-white/60" />
                    </div>
                  </div>
                </div>

                {/* Price and Slippage */}
                <div className="bg-white/5 rounded-xl p-4 mb-5 border border-white/10">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-white/60 text-xs">Price</span>
                      <p className="font-medium">1 SOL = 42.5 NOVA</p>
                    </div>
                    <div>
                      <span className="text-white/60 text-xs">Price Impact</span>
                      <p className="font-medium text-green-400">0.05%</p>
                    </div>
                    <div>
                      <span className="text-white/60 text-xs">Slippage Tolerance</span>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">0.5%</p>
                        <button className="p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                          <Settings className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <span className="text-white/60 text-xs">Network Fee</span>
                      <p className="font-medium">~0.00025 SOL</p>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                {walletConnected ? (
                  <button
                    onClick={handleSwap}
                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl font-bold text-lg hover:from-purple-500 hover:to-blue-500 transition-all duration-300 relative overflow-hidden group shadow-lg shadow-purple-900/20"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <Sparkles className="h-5 w-5" />
                      Swap Tokens
                    </span>
                    <span className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-gradient-to-r from-white via-white to-transparent -translate-x-full group-hover:translate-x-full transition-all duration-1000 ease-out" />
                  </button>
                ) : (
                  <button
                    onClick={handleConnectWallet}
                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl font-bold text-lg hover:from-purple-500 hover:to-blue-500 transition-all duration-300 relative overflow-hidden group shadow-lg shadow-purple-900/20"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <Wallet className="h-5 w-5" />
                      Connect Wallet
                    </span>
                    <span className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-gradient-to-r from-white via-white to-transparent -translate-x-full group-hover:translate-x-full transition-all duration-1000 ease-out" />
                  </button>
                )}
              </div>

              {/* Corner accents with animation */}
              <div className="absolute top-0 left-0 w-12 h-12 border-l-2 border-t-2 border-blue-500/30 rounded-tl-lg" />
              <div className="absolute top-0 right-0 w-12 h-12 border-r-2 border-t-2 border-blue-500/30 rounded-tr-lg" />
              <div className="absolute bottom-0 left-0 w-12 h-12 border-l-2 border-b-2 border-blue-500/30 rounded-bl-lg" />
              <div className="absolute bottom-0 right-0 w-12 h-12 border-r-2 border-b-2 border-blue-500/30 rounded-br-lg" />
            </div>
          </div>

          {/* Badge Unlock Panel */}
          <div className="animate-fadeIn" style={{animationDelay: "0.2s"}}>
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-black/80 to-purple-900/10 backdrop-blur-lg shadow-xl shadow-purple-900/20">
              {/* Background Glow Effects */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/3 right-1/3 w-40 h-40 rounded-full bg-cyan-600/10 filter blur-3xl animate-pulse" />
                <div 
                  className="absolute bottom-1/3 left-1/3 w-60 h-60 rounded-full bg-purple-600/10 filter blur-3xl animate-pulse"
                  style={{ animationDelay: "2s" }}
                />
              </div>

              <div className="relative z-10 p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-5">
                  <div>
                    <h2 className="text-xl font-medium mb-1">
                      <span className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-purple-400" />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
                          Identity Badges
                        </span>
                      </span>
                    </h2>
                    <p className="text-white/70 text-xs">
                      Unlock features by holding $NOVA tokens
                    </p>
                  </div>
                  <div className="mt-3 md:mt-0">
                    <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2 border border-white/10 shadow-inner shadow-purple-900/5">
                      <span className="text-xs text-white/60">Balance:</span>
                      <div className="flex items-center gap-1">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-[10px] font-bold shadow-sm shadow-purple-900/20">
                          N
                        </div>
                        <span className="font-bold text-sm">{userData.balance}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Badge Filter Tabs */}
                <div className="flex mb-5 p-1 bg-white/5 rounded-xl border border-white/10 overflow-x-auto hide-scrollbar">
                  {["all", "utility", "security", "verification", "governance"].map((tab) => (
                    <button
                      key={tab}
                      className={`px-3 py-1.5 whitespace-nowrap text-center rounded-lg transition-all duration-300 ${
                        activeBadgeTab === tab
                          ? "bg-gradient-to-r from-purple-600/80 to-blue-600/80 text-white shadow-lg shadow-purple-900/20"
                          : "text-white/60 hover:text-white hover:bg-white/5"
                      }`}
                      onClick={() => setActiveBadgeTab(tab)}
                    >
                      <span className="text-xs font-medium capitalize">{tab}</span>
                    </button>
                  ))}
                </div>

                {/* Badge Grid with Glass Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredBadges.map((badge) => (
                    <div
                      key={badge.id}
                      className={`relative overflow-hidden rounded-xl border backdrop-blur-md transition-all duration-300 cursor-pointer h-full
                        ${badge.unlocked 
                          ? "border-purple-500/40 bg-gradient-to-br from-purple-900/30 to-black/60" 
                          : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8"
                        }`}
                      style={{
                        transform: "translateZ(0)", // Hardware acceleration
                        transition: "transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease"
                      }}
                      onMouseEnter={(e) => {
                        const target = e.currentTarget;
                        target.style.transform = "translateZ(0) scale(1.02)";
                        target.style.boxShadow = "0 10px 25px -5px rgba(139, 92, 246, 0.15)";
                        if (!badge.unlocked) {
                          target.style.borderColor = "rgba(255, 255, 255, 0.2)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        const target = e.currentTarget;
                        target.style.transform = "translateZ(0) scale(1)";
                        target.style.boxShadow = "none";
                        if (!badge.unlocked) {
                          target.style.borderColor = "rgba(255, 255, 255, 0.1)";
                        }
                      }}
                      onClick={() => handleBadgeClick(badge)}
                    >
                      {/* Badge Indicator Bar */}
                      <div className={`h-1 w-full bg-gradient-to-r ${badge.color}`} />

                      <div className="p-3">
                        <div className="flex items-start gap-3">
                          {/* Badge Icon */}
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center
                              ${badge.unlocked 
                                ? `bg-gradient-to-r ${badge.color} ring-1 ring-purple-500/40 ring-offset-1 ring-offset-black/90` 
                                : `bg-gradient-to-r ${badge.color} opacity-60`
                              }`}
                          >
                            {badge.icon}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-sm truncate">{badge.name}</h3>
                            <p className="text-white/70 text-xs line-clamp-2 h-9">
                              {badge.description}
                            </p>
                          </div>
                        </div>

                        <div className="mt-2">
                          {/* Badge Status */}
                          <div className="flex items-center justify-between mb-1.5">
                            {badge.unlocked ? (
                              <div className="flex items-center gap-1 text-green-400">
                                <Unlock className="h-3 w-3" />
                                <span className="text-xs font-medium">Unlocked</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-white/60">
                                <Lock className="h-3 w-3" />
                                <span className="text-xs">{badge.requiredAmount} NOVA</span>
                              </div>
                            )}

                            {/* Status icon */}
                            {badge.unlocked ? (
                              <div className="bg-green-500/20 p-1 rounded-full">
                                <CheckCircle2 className="h-3 w-3 text-green-400" />
                              </div>
                            ) : (
                              <div className="text-xs text-white/60">
                                {badge.progress !== undefined ? Math.round(badge.progress * 100) : 0}%
                              </div>
                            )}
                          </div>

                          {/* Progress Bar */}
                          {!badge.unlocked && badge.progress !== undefined && (
                            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                              <div
                                className={`h-full bg-gradient-to-r ${badge.color}`}
                                style={{ width: `${badge.progress * 100}%` }}
                              ></div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Glow effect for unlocked badges */}
                      {badge.unlocked && (
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 to-blue-500/20 opacity-30 blur-sm rounded-xl" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-12 h-12 border-l-2 border-t-2 border-cyan-500/30 rounded-tl-lg" />
              <div className="absolute top-0 right-0 w-12 h-12 border-r-2 border-t-2 border-cyan-500/30 rounded-tr-lg" />
              <div className="absolute bottom-0 left-0 w-12 h-12 border-l-2 border-b-2 border-cyan-500/30 rounded-bl-lg" />
              <div className="absolute bottom-0 right-0 w-12 h-12 border-r-2 border-b-2 border-cyan-500/30 rounded-br-lg" />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />

      {/* Badge Details Modal */}
      {showBadgeDetails && selectedBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowBadgeDetails(false)}
          ></div>
          <div className="relative z-10 w-full max-w-md bg-gradient-to-br from-black/90 to-purple-900/20 rounded-2xl border border-white/10 shadow-2xl shadow-purple-900/20 overflow-hidden animate-scaleIn">
            {/* Top colored bar */}
            <div className={`h-1.5 w-full bg-gradient-to-r ${selectedBadge.color}`} />
            
            <div className="p-5">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center
                      ${selectedBadge.unlocked 
                        ? `bg-gradient-to-r ${selectedBadge.color} ring-2 ring-purple-500 ring-offset-2 ring-offset-black` 
                        : `bg-gradient-to-r ${selectedBadge.color}`
                      }`}
                  >
                    {selectedBadge.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-xl">{selectedBadge.name}</h3>
                    <div className="flex items-center mt-1">
                      {selectedBadge.unlocked ? (
                        <span className="px-2 py-0.5 bg-green-500/20 text-green-300 text-xs rounded-lg flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Active
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-white/10 text-white/70 text-xs rounded-lg flex items-center gap-1">
                          <Lock className="h-3 w-3" /> {selectedBadge.requiredAmount} NOVA required
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setShowBadgeDetails(false)}
                  className="p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <p className="text-white/70 mb-4">{selectedBadge.description}</p>
              
              {/* Progress visualization */}
              {!selectedBadge.unlocked && (
                <div className="mb-5 bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex justify-between text-xs text-white/60 mb-2">
                    <span>Progress to Unlock</span>
                    <span>{Math.round((selectedBadge.progress || 0) * 100)}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${selectedBadge.color}`}
                      style={{ width: `${(selectedBadge.progress || 0) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-xs text-white/60">Current: {userData.balance} NOVA</span>
                    <span className="text-xs text-white/60">Required: {selectedBadge.requiredAmount} NOVA</span>
                  </div>
                  
                  <div className="mt-4 flex justify-center">
                    <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm rounded-lg hover:from-purple-500 hover:to-blue-500 transition-colors flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Get More NOVA
                    </button>
                  </div>
                </div>
              )}
              
              {/* Benefit details */}
              <div className="pt-3 border-t border-white/10">
                <h4 className="font-medium text-sm mb-2 flex items-center gap-1.5">
                  <Info className="h-4 w-4 text-purple-400" />
                  Badge Benefits
                </h4>
                <ul className="space-y-2">
                  {["Access to exclusive features", 
                    "Enhanced platform capabilities", 
                    "Reduced transaction fees", 
                    "Priority support"
                  ].map((benefit, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-white/80">
                      <CheckCircle2 className={`h-4 w-4 mt-0.5 ${
                        selectedBadge.unlocked ? "text-green-400" : "text-white/40"
                      }`} />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Swap Confirmation Modal */}
      {showSwapConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => !swapStatus && setShowSwapConfirmation(false)}
          ></div>
          <div className="relative z-10 w-full max-w-sm bg-gradient-to-br from-black/90 to-purple-900/20 rounded-2xl border border-white/10 shadow-2xl shadow-purple-900/20 overflow-hidden animate-scaleIn">
            {/* Top colored bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-purple-600 to-blue-600" />
            
            <div className="p-5">
              {swapStatus === null && (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">Confirm Swap</h3>
                    <button 
                      onClick={() => setShowSwapConfirmation(false)}
                      className="p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="bg-white/5 rounded-xl p-4 mb-5">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <span className="text-sm text-white/60">From</span>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center text-xs font-bold">
                            S
                          </div>
                          <span className="text-xl font-bold">{fromAmount} SOL</span>
                        </div>
                      </div>
                      <ArrowUpDown className="h-5 w-5 text-white/40" />
                      <div>
                        <span className="text-sm text-white/60">To</span>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-xs font-bold">
                            N
                          </div>
                          <span className="text-xl font-bold">{toAmount} NOVA</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 pt-3 border-t border-white/10">
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Rate</span>
                        <span>1 SOL = 42.5 NOVA</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Network Fee</span>
                        <span>~0.00025 SOL</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Price Impact</span>
                        <span className="text-green-400">0.05%</span>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={confirmSwap}
                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl font-bold hover:from-purple-500 hover:to-blue-500 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <Sparkles className="h-4 w-4" />
                    Confirm Swap
                  </button>
                </>
              )}
              
              {swapStatus === "pending" && (
                <div className="py-6 flex flex-col items-center">
                  <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-6"></div>
                  <h3 className="text-xl font-bold mb-2">Processing Swap</h3>
                  <p className="text-white/60 text-center">Please wait while we process your transaction...</p>
                </div>
              )}
              
              {swapStatus === "success" && (
                <div className="py-6 flex flex-col items-center">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="h-10 w-10 text-green-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Swap Successful!</h3>
                  <p className="text-white/60 text-center mb-5">You've successfully swapped {fromAmount} SOL for {toAmount} NOVA.</p>
                  <button
                    onClick={() => {
                      setShowSwapConfirmation(false);
                      setSwapStatus(null);
                    }}
                    className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Custom Animations */}
      <style jsx global>{`
        @keyframes float {
          0% {
            transform: translateY(0) translateX(0);
          }
          25% {
            transform: translateY(-10px) translateX(10px);
          }
          50% {
            transform: translateY(0) translateX(20px);
          }
          75% {
            transform: translateY(10px) translateX(10px);
          }
          100% {
            transform: translateY(0) translateX(0);
          }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out forwards;
        }
        
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </main>
  )
}

export default NovaDex;