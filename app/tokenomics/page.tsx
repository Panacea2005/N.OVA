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
  AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { usePhantom } from "@/hooks/use-phantom";
import { SwapService } from "@/lib/services/tokenomics/swapService";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { NovaTokenAnalytics } from "./components/nova-token-analytics";
import { TransactionHistory } from "./components/transaction-history";

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

// Token data interface
interface TokenData {
  name: string;
  symbol: string;
  price: number;
  marketCap: string;
  circulatingSupply: string;
  totalSupply: string;
  holders: string;
  volume24h: string;
  priceChange24h: number;
  priceChange7d: number;
}

// Transaction interface
interface Transaction {
  id: string;
  type: "buy" | "sell";
  amount: string;
  token: string;
  value: string;
  status: "completed" | "pending" | "failed";
  timestamp: string;
  txHash: string;
}

const NovaDex = () => {
  const {
    walletAddress,
    publicKey,
    isConnected,
    balance: solBalance,
    novaBalance,
    isLoading,
    signAndSendTransaction,
    refreshBalances,
    connection
  } = usePhantom();

  const [mounted, setMounted] = useState(false);
  const [fromAmount, setFromAmount] = useState("1");
  const [toAmount, setToAmount] = useState("1000000");
  const [swapMode, setSwapMode] = useState<"market" | "limit">("market");
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [showBadgeDetails, setShowBadgeDetails] = useState(false);
  const [activeBadgeTab, setActiveBadgeTab] = useState("all");
  const [showSwapConfirmation, setShowSwapConfirmation] = useState(false);
  const [swapStatus, setSwapStatus] = useState<"pending" | "success" | "failed" | null>(null);
  const [swapDirection, setSwapDirection] = useState<"solToNova" | "novaToSol">("solToNova");
  const [swapError, setSwapError] = useState<string | null>(null);
  const [localLoading, setLocalLoading] = useState(false);
  
  // State for real data
  const [tokenData, setTokenData] = useState<TokenData>({
    name: "NOVA",
    symbol: "$NOVA",
    price: 0.0235,
    marketCap: "12.5M",
    circulatingSupply: "42M",
    totalSupply: "100M",
    holders: "8,742",
    volume24h: "325K",
    priceChange24h: 5.8,
    priceChange7d: 12.3
  });
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Initialize swap service
  const swapService = new SwapService(connection);

  // Fetch real token data and transaction history
  const fetchRealData = async () => {
    if (!mounted) return;
    
    setLocalLoading(true);
    try {
      // Fetch real token data
      const realTokenData = await swapService.fetchTokenData();
      setTokenData(realTokenData);
      
      // Fetch real transaction history if wallet is connected
      if (isConnected && publicKey) {
        const txHistory = await swapService.fetchTransactionHistory(publicKey);
        if (txHistory.length > 0) {
          setTransactions(txHistory);
        }
      }
    } catch (error) {
      console.error("Error fetching real data:", error);
    } finally {
      setLocalLoading(false);
    }
  };

  // Generate badges based on user balances
  const generateBadges = (): Badge[] => {
    return [
      {
        id: 1,
        name: "Neural Access",
        icon: <Cpu className="h-6 w-6" />,
        requiredAmount: 100,
        description: "Access to Neural Network API endpoints and advanced AI features",
        unlocked: novaBalance >= 100,
        progress: novaBalance < 100 ? novaBalance / 100 : 1,
        color: "from-blue-500 to-cyan-400",
        type: "utility"
      },
      {
        id: 2,
        name: "Identity Shield",
        icon: <Shield className="h-6 w-6" />,
        requiredAmount: 250,
        description: "Enhanced identity protection and privacy features",
        unlocked: novaBalance >= 250,
        progress: novaBalance < 250 ? novaBalance / 250 : 1,
        color: "from-purple-500 to-blue-400",
        type: "security"
      },
      {
        id: 3,
        name: "Global Verification",
        icon: <Globe className="h-6 w-6" />,
        requiredAmount: 500,
        description: "Globally recognized identity verification across all partner platforms",
        unlocked: novaBalance >= 500,
        progress: novaBalance < 500 ? novaBalance / 500 : 1,
        color: "from-indigo-500 to-purple-400",
        type: "verification"
      },
      {
        id: 4,
        name: "Quantum Boost",
        icon: <Zap className="h-6 w-6" />,
        requiredAmount: 1000,
        description: "Priority processing and enhanced computational resources",
        unlocked: novaBalance >= 1000,
        progress: novaBalance < 1000 ? novaBalance / 1000 : 1,
        color: "from-cyan-500 to-blue-400",
        type: "utility"
      },
      {
        id: 5,
        name: "Sovereign Status",
        icon: <Crown className="h-6 w-6" />,
        requiredAmount: 2500,
        description: "Exclusive governance rights and early access to new features",
        unlocked: novaBalance >= 2500,
        progress: novaBalance < 2500 ? novaBalance / 2500 : 1,
        color: "from-pink-500 to-purple-400",
        type: "governance"
      },
      {
        id: 6,
        name: "Stellar Identity",
        icon: <Star className="h-6 w-6" />,
        requiredAmount: 5000,
        description: "Highest tier of identity verification with cross-chain compatibility",
        unlocked: novaBalance >= 5000,
        progress: novaBalance < 5000 ? novaBalance / 5000 : 1,
        color: "from-amber-500 to-pink-400",
        type: "verification"
      },
    ];
  };

  const [badges, setBadges] = useState<Badge[]>(generateBadges());

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch real data once mounted
  useEffect(() => {
    if (mounted) {
      fetchRealData();
    }
  }, [mounted, isConnected, publicKey]);

  // Update badges when balances change
  useEffect(() => {
    setBadges(generateBadges());
  }, [novaBalance]);

  // Update transactions after wallet connection changes
  useEffect(() => {
    if (isConnected && publicKey) {
      swapService.fetchTransactionHistory(publicKey)
        .then(txHistory => {
          if (txHistory.length > 0) {
            setTransactions(txHistory);
          }
        })
        .catch(console.error);
    }
  }, [isConnected, publicKey]);

  const filteredBadges = activeBadgeTab === "all" 
    ? badges 
    : badges.filter(badge => badge.type === activeBadgeTab);

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value);
    
    // Calculate conversion based on swap direction
    const numValue = Number.parseFloat(value) || 0;
    
    if (swapDirection === "solToNova") {
      // Calculate based on real exchange rate
      setToAmount(swapService.estimateSolToNova(numValue).toFixed(2));
    } else {
      // NOVA to SOL
      setToAmount(swapService.estimateNovaToSol(numValue).toFixed(6));
    }
  };

  const handleToAmountChange = (value: string) => {
    setToAmount(value);
    
    // Calculate conversion based on swap direction
    const numValue = Number.parseFloat(value) || 0;
    
    if (swapDirection === "solToNova") {
      // Convert NOVA to SOL
      setFromAmount((numValue / 1000000).toFixed(6));
    } else {
      // Convert SOL to NOVA
      setFromAmount((numValue * 1000000).toFixed(2));
    }
  };

  const toggleSwapDirection = () => {
    // Toggle swap direction
    const newDirection = swapDirection === "solToNova" ? "novaToSol" : "solToNova";
    setSwapDirection(newDirection);
    
    // Recalculate amounts
    if (newDirection === "solToNova") {
      // Now fromAmount is SOL, toAmount is NOVA
      const solAmount = Number.parseFloat(fromAmount) || 0;
      setToAmount(swapService.estimateSolToNova(solAmount).toFixed(2));
    } else {
      // Now fromAmount is NOVA, toAmount is SOL
      const novaAmount = Number.parseFloat(fromAmount) || 0;
      setToAmount(swapService.estimateNovaToSol(novaAmount).toFixed(6));
    }
  };

  const getFromTokenInfo = () => {
    return swapDirection === "solToNova" 
      ? { symbol: "SOL", gradient: "from-orange-500 to-amber-500" }
      : { symbol: "NOVA", gradient: "from-purple-500 to-blue-500" };
  };

  const getToTokenInfo = () => {
    return swapDirection === "solToNova" 
      ? { symbol: "NOVA", gradient: "from-purple-500 to-blue-500" }
      : { symbol: "SOL", gradient: "from-orange-500 to-amber-500" };
  };

  const getSwapRate = () => {
    return swapDirection === "solToNova" 
      ? `1 SOL = ${swapService.estimateSolToNova(1).toLocaleString()} NOVA`
      : `${swapService.estimateSolToNova(1).toLocaleString()} NOVA = 1 SOL`;
  };

  const handleSwap = () => {
    if (!isConnected) {
      return;
    }
    
    setSwapError(null);
    setShowSwapConfirmation(true);
  };

  const confirmSwap = async () => {
    if (!publicKey) {
      setSwapError("Wallet not connected");
      return;
    }
    
    setSwapStatus("pending");
    setLocalLoading(true);
    
    try {
      const fromAmountNum = Number.parseFloat(fromAmount);
      
      // Validate the amount is valid
      if (isNaN(fromAmountNum) || fromAmountNum <= 0) {
        throw new Error("Invalid amount");
      }
      
      // Check if there's enough balance
      if (swapDirection === "solToNova" && fromAmountNum > solBalance) {
        throw new Error("Insufficient SOL balance");
      } else if (swapDirection === "novaToSol" && fromAmountNum > novaBalance) {
        throw new Error("Insufficient NOVA balance");
      }
      
      // Create the appropriate swap transaction
      const transaction = swapDirection === "solToNova"
        ? await swapService.createSolToNovaSwapTransaction(publicKey, fromAmountNum)
        : await swapService.createNovaToSolSwapTransaction(publicKey, fromAmountNum);
      
      // Sign and send the transaction
      const signature = await signAndSendTransaction(transaction);
      
      // Refresh balances after successful swap
      await refreshBalances();
      
      // Fetch updated transaction history
      const updatedTxHistory = await swapService.fetchTransactionHistory(publicKey);
      if (updatedTxHistory.length > 0) {
        setTransactions(updatedTxHistory);
      } else {
        // If transaction history fetch fails, add a synthetic entry
        const newTransaction = {
          id: `tx${Date.now()}`,
          type: swapDirection === "solToNova" ? "buy" as "buy" : "sell" as "sell",
          amount: swapDirection === "solToNova" ? `${toAmount} NOVA` : `${fromAmount} NOVA`,
          token: "NOVA",
          value: swapDirection === "solToNova" ? fromAmount : toAmount,
          status: "completed" as "completed",
          timestamp: "Just now",
          txHash: signature
        };
        
        setTransactions([newTransaction, ...transactions]);
      }
      
      setSwapStatus("success");
      
      // Close modal after showing confirmation
      setTimeout(() => {
        setShowSwapConfirmation(false);
        setSwapStatus(null);
      }, 2000);
      
    } catch (error) {
      console.error("Swap error:", error);
      setSwapStatus("failed");
      setSwapError(error instanceof Error ? error.message : "Unknown error occurred");
    } finally {
      setLocalLoading(false);
    }
  };

  const handleBadgeClick = (badge: Badge) => {
    setSelectedBadge(badge);
    setShowBadgeDetails(true);
  };
  
  const handleMaxButtonClick = () => {
    if (swapDirection === "solToNova") {
      // Set max SOL amount (leave a little for transaction fees)
      const maxSol = Math.max(0, solBalance - 0.01);
      setFromAmount(maxSol.toFixed(6));
      handleFromAmountChange(maxSol.toFixed(6));
    } else {
      // Set max NOVA amount
      setFromAmount(novaBalance.toString());
      handleFromAmountChange(novaBalance.toString());
    }
  };

  const renderFromTokenBalance = () => {
    return swapDirection === "solToNova" 
      ? `Balance: ${solBalance.toFixed(4)} SOL`
      : `Balance: ${novaBalance.toFixed(2)} NOVA`;
  };

  const renderToTokenBalance = () => {
    return swapDirection === "solToNova" 
      ? `Balance: ${novaBalance.toFixed(2)} NOVA`
      : `Balance: ${solBalance.toFixed(4)} SOL`;
  };

  // Handle refresh data
  const handleRefreshData = async () => {
    await Promise.all([
      refreshBalances(),
      fetchRealData()
    ]);
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
          
          {/* Token Analytics */}
          <NovaTokenAnalytics tokenData={tokenData} />

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
                    <button 
                      className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
                      onClick={handleRefreshData}
                      disabled={isLoading || localLoading}
                    >
                      <RefreshCw className={`h-4 w-4 ${(isLoading || localLoading) ? 'animate-spin' : ''}`} />
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
                    <span className="text-xs text-white/60">{renderFromTokenBalance()}</span>
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
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${getFromTokenInfo().gradient} flex items-center justify-center text-xs font-bold shadow-lg shadow-purple-900/20`}>
                        {getFromTokenInfo().symbol === "SOL" ? "SOL" : "N"}
                      </div>
                      <span className="font-bold">{getFromTokenInfo().symbol}</span>
                      <ChevronDown className="h-4 w-4 text-white/60" />
                    </div>
                  </div>
                  <div className="flex justify-end mt-2 gap-1">
                    {["25%", "50%", "75%", "MAX"].map((percent) => (
                      <button
                        key={percent}
                        className="px-2 py-1 text-xs bg-white/5 rounded-lg hover:bg-white/10 transition-colors border border-white/5 hover:border-white/20"
                        onClick={() => {
                          if (percent === "MAX") {
                            handleMaxButtonClick();
                          } else {
                            // Calculate percentage of balance
                            const percentage = parseInt(percent) / 100;
                            if (swapDirection === "solToNova") {
                              const amount = (solBalance * percentage).toFixed(6);
                              setFromAmount(amount);
                              handleFromAmountChange(amount);
                            } else {
                              const amount = (novaBalance * percentage).toFixed(2);
                              setFromAmount(amount);
                              handleFromAmountChange(amount);
                            }
                          }
                        }}
                      >
                        {percent}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Swap Icon */}
                <div className="flex justify-center my-3 relative">
                  <div className="absolute left-0 right-0 border-t border-white/5 top-1/2 -translate-y-1/2"></div>
                  <button 
                    className="relative z-10 p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors border border-white/10 shadow-lg shadow-purple-900/10 group"
                    onClick={toggleSwapDirection}
                  >
                    <ArrowUpDown className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  </button>
                </div>

                {/* To Token */}
                <div className="mb-5">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-white/60 text-sm">To</label>
                    <span className="text-xs text-white/60">{renderToTokenBalance()}</span>
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
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${getToTokenInfo().gradient} flex items-center justify-center text-xs font-bold shadow-lg shadow-purple-900/20`}>
                        {getToTokenInfo().symbol === "SOL" ? "SOL" : "N"}
                      </div>
                      <span className="font-bold">{getToTokenInfo().symbol}</span>
                      <ChevronDown className="h-4 w-4 text-white/60" />
                    </div>
                  </div>
                </div>

                {/* Price and Slippage */}
                <div className="bg-white/5 rounded-xl p-4 mb-5 border border-white/10">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-white/60 text-xs">Price</span>
                      <p className="font-medium">{getSwapRate()}</p>
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
                <button
                  onClick={handleSwap}
                  disabled={isLoading || localLoading || !isConnected}
                  className={`w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl font-bold text-lg hover:from-purple-500 hover:to-blue-500 transition-all duration-300 relative overflow-hidden group shadow-lg shadow-purple-900/20 ${
                    (isLoading || localLoading || !isConnected) ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isLoading || localLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5" />
                        {isConnected ? "Swap Tokens" : "Connect Wallet to Swap"}
                      </>
                    )}
                  </span>
                  <span className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-gradient-to-r from-white via-white to-transparent -translate-x-full group-hover:translate-x-full transition-all duration-1000 ease-out" />
                </button>
              </div>

              {/* Corner accents with animation */}
              <div className="absolute top-0 left-0 w-12 h-12 border-l-2 border-t-2 border-blue-500/30 rounded-tl-lg" />
              <div className="absolute top-0 right-0 w-12 h-12 border-r-2 border-t-2 border-blue-500/30 rounded-tr-lg" />
              <div className="absolute bottom-0 left-0 w-12 h-12 border-l-2 border-b-2 border-blue-500/30 rounded-bl-lg" />
              <div className="absolute bottom-0 right-0 w-12 h-12 border-r-2 border-b-2 border-blue-500/30 rounded-br-lg" />
            </div>
          </div>

          {/* Transaction History */}
          <TransactionHistory 
            transactions={transactions}
            isConnected={isConnected}
          />

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
                        <span className="font-bold text-sm">{novaBalance.toFixed(2)}</span>
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
                    <span className="text-xs text-white/60">Current: {novaBalance.toFixed(2)} NOVA</span>
                    <span className="text-xs text-white/60">Required: {selectedBadge.requiredAmount} NOVA</span>
                  </div>
                  
                  <div className="mt-4 flex justify-center">
                    <button 
                      onClick={() => {
                        setShowBadgeDetails(false);
                        // Focus on the swap section
                        window.scrollTo({
                          top: 0,
                          behavior: 'smooth'
                        });
                        // Set swap direction to SOL to NOVA
                        setSwapDirection("solToNova");
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm rounded-lg hover:from-purple-500 hover:to-blue-500 transition-colors flex items-center gap-2"
                    >
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
                          <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${getFromTokenInfo().gradient} flex items-center justify-center text-xs font-bold`}>
                            {getFromTokenInfo().symbol === "SOL" ? "S" : "N"}
                          </div>
                          <span className="text-xl font-bold">{fromAmount} {getFromTokenInfo().symbol}</span>
                        </div>
                      </div>
                      <ArrowUpDown className="h-5 w-5 text-white/40" />
                      <div>
                        <span className="text-sm text-white/60">To</span>
                        <div className="flex items-center gap-2 mt-1">
                          <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${getToTokenInfo().gradient} flex items-center justify-center text-xs font-bold`}>
                            {getToTokenInfo().symbol === "SOL" ? "S" : "N"}
                          </div>
                          <span className="text-xl font-bold">{toAmount} {getToTokenInfo().symbol}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 pt-3 border-t border-white/10">
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Rate</span>
                        <span>{getSwapRate()}</span>
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
                    disabled={localLoading}
                    className={`w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl font-bold hover:from-purple-500 hover:to-blue-500 transition-all duration-300 flex items-center justify-center gap-2 ${
                      localLoading ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                  >
                    {localLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Confirm Swap
                      </>
                    )}
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
                  <p className="text-white/60 text-center mb-5">You've successfully swapped {fromAmount} {getFromTokenInfo().symbol} for {toAmount} {getToTokenInfo().symbol}.</p>
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
              
              {swapStatus === "failed" && (
                <div className="py-6 flex flex-col items-center">
                  <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
                    <AlertTriangle className="h-10 w-10 text-red-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Swap Failed</h3>
                  <p className="text-white/60 text-center mb-2">Sorry, the swap transaction failed.</p>
                  {swapError && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-5 w-full">
                      <p className="text-red-400 text-sm">{swapError}</p>
                    </div>
                  )}
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowSwapConfirmation(false);
                        setSwapStatus(null);
                        setSwapError(null);
                      }}
                      className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => {
                        setSwapStatus(null);
                        setSwapError(null);
                      }}
                      className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg hover:from-purple-500 hover:to-blue-500 transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
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
  );
};

export default NovaDex;