import React, { useState } from "react";
import { 
  Wallet, ChartBar, Clock, Coins, ArrowUpRight, ArrowDownLeft, 
  CheckCircle, Clipboard, CheckIcon, Network, Zap, Box, 
  AlertTriangle, ChevronDown, ChevronUp, Sparkles, Gift
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface WalletSummaryDisplayProps {
  summary: any;
  onCopy: (text: string, type?: "full" | "suggestions") => void;
  copiedState: {
    full: boolean;
    suggestions?: boolean;
  };
}

const WalletSummaryDisplay: React.FC<WalletSummaryDisplayProps> = ({
  summary,
  onCopy,
  copiedState,
}) => {
  const [expandedSections, setExpandedSections] = useState({
    tokens: false,
    transactions: false,
    actions: false
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (!summary) return null;

  // Calculate activity level color and gradient
  const getActivityLevel = (transactionCount: number) => {
    if (transactionCount === 0)
      return {
        color: "text-blue-500",
        gradient: "from-blue-700 to-blue-500",
        width: "10%",
        label: "Inactive",
        glow: "0 0 20px rgba(59, 130, 246, 0.5)"
      };
    if (transactionCount < 5)
      return {
        color: "text-green-500",
        gradient: "from-green-700 to-green-500",
        width: "30%",
        label: "Low",
        glow: "0 0 20px rgba(16, 185, 129, 0.5)"
      };
    if (transactionCount < 15)
      return {
        color: "text-yellow-500",
        gradient: "from-yellow-700 to-yellow-500",
        width: "60%",
        label: "Medium",
        glow: "0 0 20px rgba(234, 179, 8, 0.5)"
      };
    if (transactionCount < 30)
      return {
        color: "text-orange-500",
        gradient: "from-orange-700 to-orange-500",
        width: "80%",
        label: "High",
        glow: "0 0 20px rgba(249, 115, 22, 0.5)"
      };
    return {
      color: "text-purple-500",
      gradient: "from-purple-700 to-purple-500",
      width: "100%",
      label: "Very High",
      glow: "0 0 20px rgba(168, 85, 247, 0.5)"
    };
  };

  const activityStyle = getActivityLevel(summary.transactionCount);
  
  // Calculate net flow color
  const getNetFlowColor = (netFlow: number) => {
    if (netFlow > 0) return {
      text: "text-green-500",
      bg: "bg-green-500/20",
      border: "border-green-500/30",
      icon: <ArrowDownLeft className="w-4 h-4 text-green-500" />,
      sign: "+"
    };
    if (netFlow < 0) return {
      text: "text-red-500",
      bg: "bg-red-500/20",
      border: "border-red-500/30",
      icon: <ArrowUpRight className="w-4 h-4 text-red-500" />,
      sign: ""
    };
    return {
      text: "text-blue-500",
      bg: "bg-blue-500/20",
      border: "border-blue-500/30",
      icon: <Zap className="w-4 h-4 text-blue-500" />,
      sign: ""
    };
  };
  
  const netFlow = summary.totalSolReceived - summary.totalSolSent;
  const netFlowStyle = getNetFlowColor(netFlow);

  // Build network identifier with visual elements
  const getNetworkDetails = (network: string) => {
    switch(network.toLowerCase()) {
      case 'mainnet-beta':
        return {
          color: "text-purple-500",
          bg: "bg-purple-500/20",
          border: "border-purple-500/30",
          label: "MAINNET"
        };
      case 'devnet':
        return {
          color: "text-blue-500",
          bg: "bg-blue-500/20",
          border: "border-blue-500/30",
          label: "DEVNET"
        };
      case 'testnet':
        return {
          color: "text-green-500",
          bg: "bg-green-500/20",
          border: "border-green-500/30",
          label: "TESTNET"
        };
      default:
        return {
          color: "text-gray-500",
          bg: "bg-gray-500/20",
          border: "border-gray-500/30",
          label: network.toUpperCase()
        };
    }
  };

  const networkDetails = getNetworkDetails(summary.network || "unknown");

  return (
    <div className="w-full flex flex-col space-y-6">
      {/* Main Wallet Summary Card */}
      <div className="relative border border-white/10 rounded-md overflow-hidden">
        {/* Glowing accent line at the top */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500/0 via-emerald-500/80 to-emerald-500/0"></div>
        
        {/* Animated dot background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 opacity-20" 
               style={{
                 backgroundImage: "radial-gradient(rgba(16, 185, 129, 0.2) 1px, transparent 1px)",
                 backgroundSize: "10px 10px",
               }}>
            <motion.div 
              className="w-full h-full"
              initial={{ backgroundPosition: "0 0" }}
              animate={{ backgroundPosition: "100px 100px" }}
              transition={{ duration: 120, ease: "linear", repeat: Infinity }}
            />
          </div>
        </div>

        {/* Circuit-like pattern overlays */}
        <div className="absolute inset-0 z-0 opacity-10">
          <svg width="100%" height="100%" className="absolute inset-0">
            <pattern id="circuitPattern" patternUnits="userSpaceOnUse" width="100" height="100" patternTransform="rotate(45)">
              <line x1="0" y1="50" x2="100" y2="50" stroke="currentColor" strokeWidth="0.5" className="text-emerald-500" />
              <line x1="50" y1="0" x2="50" y2="100" stroke="currentColor" strokeWidth="0.5" className="text-emerald-500" />
              <circle cx="50" cy="50" r="2" fill="currentColor" className="text-emerald-600" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#circuitPattern)" />
          </svg>
        </div>

        <div className="relative z-10 p-5 backdrop-blur-sm bg-gradient-to-b from-black/80 via-black/70 to-black/90">
          {/* Header with glowing badge */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-6 gap-3">
            <div className="flex items-start gap-3">
              <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-lg border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-emerald-400" />
                </div>
                <motion.div 
                  className="absolute inset-0 rounded-lg"
                  initial={{ boxShadow: "0 0 0px rgba(16, 185, 129, 0.1)" }}
                  animate={{ boxShadow: "0 0 10px rgba(16, 185, 129, 0.4)" }}
                  transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                />
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  Wallet Analysis
                  <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${networkDetails.bg} ${networkDetails.border} ${networkDetails.color}`}>
                    {networkDetails.label}
                  </span>
                </h3>
                <p className="text-white/60 text-sm mt-1">
                  {summary.period ? `Activity from ${summary.period}` : "Recent wallet activity and token balances"}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1 ml-auto md:ml-0 mt-2 md:mt-0">
              <div className={`px-3 py-1.5 rounded-lg ${netFlowStyle.bg} ${netFlowStyle.border} flex items-center gap-2`}>
                <div className="flex items-center">
                  {netFlowStyle.icon}
                </div>
                <div>
                  <div className="text-xs text-white/60">NET FLOW</div>
                  <div className={`font-bold font-mono ${netFlowStyle.text}`}>
                    {netFlowStyle.sign}{Math.abs(netFlow).toFixed(4)} SOL
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Display any RPC errors if they exist */}
          {summary.rpcErrors && summary.rpcErrors.length > 0 && (
            <div className="mb-6 p-3 border border-amber-500/30 bg-amber-900/20 rounded-lg flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-amber-400 text-sm font-medium mb-1">API Limitation Notice</p>
                <p className="text-amber-300/80 text-xs">
                  {summary.rpcErrors.join('. ')}
                </p>
              </div>
            </div>
          )}

          {/* Activity Score with pulsing animation */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-base font-medium text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400" />
                Activity Level
              </h4>
              <div className="flex items-center gap-2">
                <span
                  className={`text-sm font-bold ${activityStyle.color} px-2 py-0.5 rounded-full bg-black/30 border border-white/5`}
                >
                  {activityStyle.label}
                </span>
                <motion.div 
                  className={`w-2 h-2 rounded-full ${activityStyle.color.replace('text-', 'bg-')}`}
                  animate={{ 
                    scale: [1, 1.5, 1],
                    boxShadow: [
                      `0 0 0px rgba(0, 0, 0, 0)`,
                      activityStyle.glow,
                      `0 0 0px rgba(0, 0, 0, 0)`
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
            </div>
            
            <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden border border-white/5">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ 
                  width: activityStyle.width,
                  boxShadow: activityStyle.glow
                }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className={`h-full bg-gradient-to-r ${activityStyle.gradient} rounded-full`}
              />
            </div>
          </div>

          {/* Transaction Stats Overview - Animated Hexagon Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {/* Transactions */}
            <motion.div 
              className="relative overflow-hidden border border-teal-500/30 bg-gradient-to-br from-teal-900/20 to-teal-900/5 p-3 rounded-lg backdrop-blur-sm"
              whileHover={{ 
                boxShadow: "0 0 15px rgba(20, 184, 166, 0.3)",
                borderColor: "rgba(20, 184, 166, 0.5)"
              }}
              transition={{ duration: 0.2 }}
            >
              <div className="absolute top-0 right-0 w-1 h-1 bg-teal-500 rounded-full">
                <motion.div 
                  className="absolute inset-0 rounded-full"
                  animate={{ 
                    scale: [1, 2, 1],
                    opacity: [1, 0, 1],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{ backgroundColor: "#14b8a6" }}
                />
              </div>
              
              <div className="flex justify-between items-start mb-1">
                <Box className="w-4 h-4 text-teal-400 mt-0.5" />
                <span className="text-xs text-white/50">24h</span>
              </div>
              
              <p className="text-teal-400 text-2xl font-bold font-mono">
                {summary.transactionCount}
              </p>
              <p className="text-xs text-white/60">Transactions</p>
            </motion.div>

            {/* Unique Wallets */}
            <motion.div 
              className="relative overflow-hidden border border-blue-500/30 bg-gradient-to-br from-blue-900/20 to-blue-900/5 p-3 rounded-lg backdrop-blur-sm"
              whileHover={{ 
                boxShadow: "0 0 15px rgba(59, 130, 246, 0.3)",
                borderColor: "rgba(59, 130, 246, 0.5)"
              }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex justify-between items-start mb-1">
                <Network className="w-4 h-4 text-blue-400 mt-0.5" />
                <span className="text-xs text-white/50">UNIQUE</span>
              </div>
              
              <p className="text-blue-400 text-2xl font-bold font-mono">
                {summary.uniqueWalletsInteracted}
              </p>
              <p className="text-xs text-white/60">Connected Wallets</p>
            </motion.div>

            {/* Programs */}
            <motion.div 
              className="relative overflow-hidden border border-purple-500/30 bg-gradient-to-br from-purple-900/20 to-purple-900/5 p-3 rounded-lg backdrop-blur-sm"
              whileHover={{ 
                boxShadow: "0 0 15px rgba(168, 85, 247, 0.3)",
                borderColor: "rgba(168, 85, 247, 0.5)"
              }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex justify-between items-start mb-1">
                <Zap className="w-4 h-4 text-purple-400 mt-0.5" />
                <span className="text-xs text-white/50">PROGRAMS</span>
              </div>
              
              <p className="text-purple-400 text-2xl font-bold font-mono">
                {summary.uniqueProgramsInteracted?.length || 0}
              </p>
              <p className="text-xs text-white/60">Dapps Used</p>
            </motion.div>

            {/* Fees */}
            <motion.div 
              className="relative overflow-hidden border border-amber-500/30 bg-gradient-to-br from-amber-900/20 to-amber-900/5 p-3 rounded-lg backdrop-blur-sm"
              whileHover={{ 
                boxShadow: "0 0 15px rgba(245, 158, 11, 0.3)",
                borderColor: "rgba(245, 158, 11, 0.5)"
              }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex justify-between items-start mb-1">
                <Coins className="w-4 h-4 text-amber-400 mt-0.5" />
                <span className="text-xs text-white/50">FEES</span>
              </div>
              
              <p className="text-amber-400 text-2xl font-bold font-mono">
                {summary.totalFees?.toFixed(6) || 0}
              </p>
              <p className="text-xs text-white/60">SOL Spent</p>
            </motion.div>
          </div>

          {/* SOL Transfers Section */}
          <div className="mb-6">
            <h4 className="text-base font-medium text-white flex items-center gap-2 mb-3 pb-2 border-b border-white/5">
              <div className="w-5 h-5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                <Coins className="w-3 h-3 text-white" />
              </div>
              SOL Transfers
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Received */}
              <motion.div 
                className="border border-green-500/20 bg-green-500/5 rounded-lg p-3 flex items-center gap-3"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="p-2 rounded-md bg-green-500/20 border border-green-500/30">
                  <ArrowDownLeft className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <div className="text-xs text-white/60">Received</div>
                  <div className="text-green-500 font-mono font-medium text-lg">
                    {summary.totalSolReceived?.toFixed(4) || 0} <span className="text-xs">SOL</span>
                  </div>
                </div>
              </motion.div>
              
              {/* Sent */}
              <motion.div 
                className="border border-red-500/20 bg-red-500/5 rounded-lg p-3 flex items-center gap-3"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="p-2 rounded-md bg-red-500/20 border border-red-500/30">
                  <ArrowUpRight className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <div className="text-xs text-white/60">Sent</div>
                  <div className="text-red-500 font-mono font-medium text-lg">
                    {summary.totalSolSent?.toFixed(4) || 0} <span className="text-xs">SOL</span>
                  </div>
                </div>
              </motion.div>
              
              {/* Net Flow with animation */}
              <motion.div 
                className={`border ${netFlowStyle.border} ${netFlowStyle.bg} rounded-lg p-3 flex items-center gap-3`}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className={`p-2 rounded-md bg-white/5 border ${netFlowStyle.border}`}>
                  <ChartBar className={`w-5 h-5 ${netFlowStyle.text}`} />
                </div>
                <div>
                  <div className="text-xs text-white/60">Net Flow</div>
                  <div className={`${netFlowStyle.text} font-mono font-medium text-lg`}>
                    {netFlowStyle.sign}{Math.abs(netFlow).toFixed(4)} <span className="text-xs">SOL</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Token Balances - Collapsible Section */}
          {summary.tokenBalances && summary.tokenBalances.length > 0 && (
            <div className="mb-6">
              <button 
                onClick={() => toggleSection('tokens')}
                className="w-full flex items-center justify-between text-base font-medium text-white gap-2 mb-3 pb-2 border-b border-white/5"
              >
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                  <span>Token Portfolio</span>
                </div>
                {expandedSections.tokens ? 
                  <ChevronUp className="w-4 h-4 text-white/70" /> : 
                  <ChevronDown className="w-4 h-4 text-white/70" />
                }
              </button>
              
              <AnimatePresence>
                {expandedSections.tokens && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="grid gap-2 md:grid-cols-2">
                      {summary.tokenBalances
                        .filter((token: any) => token.amount > 0)
                        .slice(0, 6)
                        .map((token: any, idx: number) => (
                          <motion.div 
                            key={`token-${idx}`} 
                            className="flex items-center gap-3 p-2 rounded-lg border border-indigo-500/20 bg-indigo-500/5"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: idx * 0.05 }}
                            whileHover={{ 
                              backgroundColor: "rgba(99, 102, 241, 0.1)",
                              borderColor: "rgba(99, 102, 241, 0.3)"
                            }}
                          >
                            <div className="w-10 h-10 rounded-lg relative flex-shrink-0 bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-base font-bold text-white">
                              {token.tokenSymbol?.slice(0, 1) || token.mint.slice(0, 1)}
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-black/40 border border-black flex items-center justify-center">
                                <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
                              </div>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <p className="text-white/90 text-sm font-medium truncate">
                                  {token.tokenSymbol || token.mint.slice(0, 6)}
                                </p>
                                <p className="text-indigo-400 font-mono font-medium">
                                  {token.amount.toFixed(4)}
                                </p>
                              </div>
                              <p className="text-white/40 text-xs truncate">
                                {token.tokenName || `${token.mint.slice(0, 8)}...${token.mint.slice(-4)}`}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                    </div>
                    
                    {summary.tokenBalances.length > 6 && (
                      <p className="text-xs text-white/50 italic mt-2 text-center">
                        Plus {summary.tokenBalances.length - 6} more tokens in your portfolio
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
              
              {!expandedSections.tokens && summary.tokenBalances.length > 0 && (
                <div className="text-center py-2 text-white/50 text-xs">
                  <span>{summary.tokenBalances.length} tokens in portfolio • Click to expand</span>
                </div>
              )}
            </div>
          )}

          {/* NFTs if any - With compact display */}
          {summary.nfts && summary.nfts.length > 0 && (
            <div className="mb-6 p-3 border border-pink-500/30 bg-pink-500/5 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-md bg-pink-500/20 border border-pink-500/30 flex-shrink-0">
                  <Gift className="w-5 h-5 text-pink-500" />
                </div>
                
                <div>
                  <h4 className="text-base font-medium text-white mb-1">NFT Collection</h4>
                  <p className="text-white/80 text-sm">
                    Your wallet holds <span className="text-pink-400 font-medium">{summary.nfts.length} NFTs</span>
                    {summary.nfts[0].collection && (
                      <>
                        , including items from <span className="text-pink-400 font-medium">{summary.nfts[0].collection}</span>
                        {summary.nfts.length > 1 && summary.nfts[1].collection && summary.nfts[1].collection !== summary.nfts[0].collection && (
                          <> and <span className="text-pink-400 font-medium">{summary.nfts[1].collection}</span></>
                        )}
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Recent Transactions - Collapsible Section */}
          {summary.recentTransactions && summary.recentTransactions.length > 0 && (
            <div className="mb-6">
              <button 
                onClick={() => toggleSection('transactions')}
                className="w-full flex items-center justify-between text-base font-medium text-white gap-2 mb-3 pb-2 border-b border-white/5"
              >
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-r from-green-600 to-emerald-600 flex items-center justify-center">
                    <Clock className="w-3 h-3 text-white" />
                  </div>
                  <span>Recent Transactions</span>
                </div>
                {expandedSections.transactions ? 
                  <ChevronUp className="w-4 h-4 text-white/70" /> : 
                  <ChevronDown className="w-4 h-4 text-white/70" />
                }
              </button>
              
              <AnimatePresence>
                {expandedSections.transactions && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-2">
                      {summary.recentTransactions.slice(0, 5).map((tx: any, idx: number) => {
                        const date = new Date(tx.timestamp * 1000);
                        const formattedDate = date.toLocaleDateString();
                        const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        const txType = tx.type?.replace(/([A-Z])/g, ' $1').trim() || 'Transaction';
                        
                        // Determine transaction icon and color based on type
                        let txIcon;
                        let txColor;
                        
                        if (tx.type === 'tokenTransfer') {
                          txIcon = <Coins className="w-4 h-4" />;
                          txColor = 'text-purple-500 border-purple-500/30 bg-purple-500/10';
                        } else if (tx.type === 'systemTransfer') {
                          txIcon = <ArrowUpRight className="w-4 h-4" />;
                          txColor = 'text-blue-500 border-blue-500/30 bg-blue-500/10';
                        } else if (tx.type === 'swap') {
                          txIcon = <ArrowUpRight className="w-4 h-4" />;
                          txColor = 'text-amber-500 border-amber-500/30 bg-amber-500/10';
                        } else if (tx.type === 'nftMint' || tx.type === 'nftSale') {
                          txIcon = <Gift className="w-4 h-4" />;
                          txColor = 'text-pink-500 border-pink-500/30 bg-pink-500/10';
                        } else {
                          txIcon = <Box className="w-4 h-4" />;
                          txColor = 'text-emerald-500 border-emerald-500/30 bg-emerald-500/10';
                        }
                        
                        return (
                          <motion.div 
                            key={`tx-${idx}`} 
                            className="p-3 border border-emerald-500/20 bg-emerald-500/5 rounded-lg flex items-center gap-3"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: idx * 0.05 }}
                            whileHover={{ 
                              backgroundColor: "rgba(16, 185, 129, 0.1)",
                              borderColor: "rgba(16, 185, 129, 0.3)",
                              y: -2
                            }}
                          >
                            <div className={`p-2 rounded-md ${txColor}`}>
                              {txIcon}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <p className="text-emerald-400 text-sm font-medium capitalize">
                                  {txType}
                                </p>
                                <p className="text-white/60 text-xs">
                                  {formattedDate} {formattedTime}
                                </p>
                              </div>
                              <p className="text-white/80 text-xs truncate">
                                {tx.description || tx.signature.slice(0, 16) + '...'}
                              </p>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {!expandedSections.transactions && summary.recentTransactions.length > 0 && (
                <div className="text-center py-2 text-white/50 text-xs">
                  <span>{summary.recentTransactions.length} recent transactions • Click to expand</span>
                </div>
              )}
            </div>
          )}

          {/* Suggested Actions - Collapsible Section */}
          {summary.suggestedActions && summary.suggestedActions.length > 0 && (
            <div className="mb-6">
              <button 
                onClick={() => toggleSection('actions')}
                className="w-full flex items-center justify-between text-base font-medium text-white gap-2 mb-3 pb-2 border-b border-white/5"
              >
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-r from-green-600 to-blue-600 flex items-center justify-center">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                  <span>Recommended Actions</span>
                </div>
                {expandedSections.actions ? 
                  <ChevronUp className="w-4 h-4 text-white/70" /> : 
                  <ChevronDown className="w-4 h-4 text-white/70" />
                }
              </button>
              
              <AnimatePresence>
                {expandedSections.actions && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-2">
                      {summary.suggestedActions.map((action: string, idx: number) => (
                        <motion.div 
                          key={`action-${idx}`} 
                          className="flex items-start gap-3 p-3 border border-blue-500/20 bg-blue-500/5 rounded-lg"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: idx * 0.05 }}
                          whileHover={{ 
                            backgroundColor: "rgba(59, 130, 246, 0.1)",
                            borderColor: "rgba(59, 130, 246, 0.3)",
                            x: 2
                          }}
                        >
                          <div className="p-1.5 rounded-md bg-blue-500/20 border border-blue-500/30 flex-shrink-0 mt-0.5">
                            <div className="w-3 h-3 rounded-full border-2 border-blue-400 flex items-center justify-center">
                              <div className="w-1 h-1 rounded-full bg-blue-400"></div>
                            </div>
                          </div>
                          <p className="text-sm text-white/90">{action}</p>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {!expandedSections.actions && summary.suggestedActions.length > 0 && (
                <div className="text-center py-2 text-white/50 text-xs">
                  <span>{summary.suggestedActions.length} suggested actions • Click to expand</span>
                </div>
              )}
            </div>
          )}

          {/* Copy button */}
          <div className="mt-6 flex justify-end">
            <motion.button
              className="px-3 py-2 bg-black/40 hover:bg-black/60 text-xs text-white/80 hover:text-white border border-white/10 hover:border-white/30 transition-colors flex items-center gap-2 rounded-lg"
              onClick={() => onCopy(JSON.stringify(summary, null, 2), "full")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              {copiedState.full ? (
                <>
                  <CheckIcon className="w-4 h-4 text-green-500" />
                  <span className="text-green-500">Copied to Clipboard</span>
                </>
              ) : (
                <>
                  <Clipboard className="w-4 h-4" />
                  <span>Copy Full Report</span>
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletSummaryDisplay;