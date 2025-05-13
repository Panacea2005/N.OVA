import React, { useState } from "react";
import { 
  Wallet, ChevronDown, ChevronUp, Coins, ArrowUpRight, ArrowDownLeft, 
  Clipboard, CheckIcon, AlertCircle
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
  
  // Calculate net flow
  const netFlow = summary.totalSolReceived - summary.totalSolSent;
  
  // Get net flow styling
  const getNetFlowStyle = () => {
    if (netFlow > 0) return "text-green-400";
    if (netFlow < 0) return "text-red-400";
    return "text-blue-400";
  }
  
  // Determine network display and color
  const getNetworkLabel = (network: string) => {
    return network ? network.toUpperCase() : "UNKNOWN";
  };
  
  const getNetworkStyle = (network: string) => {
    switch (network?.toLowerCase()) {
      case 'mainnet-beta':
        return "border-purple-500/30 text-purple-400";
      case 'devnet':
        return "border-blue-500/30 text-blue-400";
      case 'testnet':
        return "border-green-500/30 text-green-400";
      default:
        return "border-gray-500/30 text-gray-400";
    }
  };

  // Activity level styling
  const getActivityLevelStyle = (count: number) => {
    if (count === 0) return { color: "text-blue-400", width: "0%" };
    if (count < 5) return { color: "text-green-400", width: "30%" };
    if (count < 15) return { color: "text-yellow-400", width: "60%" };
    if (count < 30) return { color: "text-orange-400", width: "80%" };
    return { color: "text-purple-400", width: "100%" };
  };
  
  const activityStyle = getActivityLevelStyle(summary.transactionCount);
  const netFlowColorClass = getNetFlowStyle();

  return (
    <div className="w-full flex flex-col space-y-6">
      {/* Main Wallet Summary Card */}
      <div className="border border-white/30 p-0.5">
        <div className="border border-white/10 p-5">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-6 gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 border border-emerald-500/30 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-emerald-400" />
              </div>
              
              <div>
                <h3 className="text-xl font-light text-white flex items-center gap-2 uppercase">
                  Wallet Analysis
                  <span className={`ml-2 text-xs px-2 border ${getNetworkStyle(summary.network)}`}>
                    {getNetworkLabel(summary.network)}
                  </span>
                </h3>
                <p className="text-white/70 text-sm mt-1 uppercase">
                  {summary.period ? `Activity from ${summary.period}` : "Recent wallet activity and token balances"}
                </p>
              </div>
            </div>

            <div className="border border-emerald-500/30 p-2 flex items-center gap-3">
              <div>
                <div className="text-xs text-white/60 uppercase">Net Flow</div>
                <div className={`font-light font-mono ${netFlowColorClass}`}>
                  {netFlow > 0 ? "+" : ""}{netFlow.toFixed(4)} SOL
                </div>
              </div>
            </div>
          </div>

          {/* Display any RPC errors if they exist */}
          {summary.rpcErrors && summary.rpcErrors.length > 0 && (
            <div className="mb-6 p-3 border border-amber-500/30 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-amber-400 text-sm font-light mb-1 uppercase">API Limitation Notice</p>
                <p className="text-white/80 text-xs">
                  {summary.rpcErrors.join('. ')}
                </p>
              </div>
            </div>
          )}

          {/* Activity Level */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-base font-light text-white uppercase">
                Activity Level
              </h4>
              <div className={`text-sm px-2 py-0.5 border-${
                summary.transactionCount > 30 ? "purple" : 
                summary.transactionCount > 15 ? "orange" : 
                summary.transactionCount > 5 ? "yellow" : 
                summary.transactionCount > 0 ? "green" : "blue"
              }-500/30 border ${activityStyle.color} uppercase`}>
                {summary.transactionCount > 30 ? "VERY HIGH" : 
                 summary.transactionCount > 15 ? "HIGH" : 
                 summary.transactionCount > 5 ? "MEDIUM" : 
                 summary.transactionCount > 0 ? "LOW" : "INACTIVE"}
              </div>
            </div>
            
            <div className="h-0.5 w-full bg-white/10">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: activityStyle.width }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-full ${
                  summary.transactionCount > 30 ? "bg-gradient-to-r from-purple-500 to-indigo-500" : 
                  summary.transactionCount > 15 ? "bg-gradient-to-r from-orange-500 to-amber-500" : 
                  summary.transactionCount > 5 ? "bg-gradient-to-r from-yellow-500 to-amber-500" : 
                  summary.transactionCount > 0 ? "bg-gradient-to-r from-green-500 to-emerald-500" : 
                  "bg-gradient-to-r from-blue-500 to-cyan-500"
                }`}
              />
            </div>
          </div>

          {/* Transaction Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {/* Transactions */}
            <div className="border border-cyan-500/30 p-3">
              <div className="text-cyan-400 text-2xl font-light">
                {summary.transactionCount}
              </div>
              <p className="text-xs text-white/60 uppercase">Transactions</p>
            </div>

            {/* Unique Wallets */}
            <div className="border border-blue-500/30 p-3">
              <div className="text-blue-400 text-2xl font-light">
                {summary.uniqueWalletsInteracted}
              </div>
              <p className="text-xs text-white/60 uppercase">Connected Wallets</p>
            </div>

            {/* Programs */}
            <div className="border border-purple-500/30 p-3">
              <div className="text-purple-400 text-2xl font-light">
                {summary.uniqueProgramsInteracted?.length || 0}
              </div>
              <p className="text-xs text-white/60 uppercase">Dapps Used</p>
            </div>

            {/* Fees */}
            <div className="border border-amber-500/30 p-3">
              <div className="text-amber-400 text-2xl font-light">
                {summary.totalFees?.toFixed(6) || 0}
              </div>
              <p className="text-xs text-white/60 uppercase">SOL Spent</p>
            </div>
          </div>

          {/* SOL Transfers Section */}
          <div className="mb-6">
            <h4 className="text-base font-light text-white mb-3 pb-2 border-b border-white/10 uppercase">
              SOL Transfers
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Received */}
              <div className="border border-green-500/30 p-3 flex items-center gap-3">
                <div className="p-2 border border-green-500/30">
                  <ArrowDownLeft className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <div className="text-xs text-white/60 uppercase">Received</div>
                  <div className="text-green-400 font-mono font-light text-lg">
                    {summary.totalSolReceived?.toFixed(4) || 0} <span className="text-xs">SOL</span>
                  </div>
                </div>
              </div>
              
              {/* Sent */}
              <div className="border border-red-500/30 p-3 flex items-center gap-3">
                <div className="p-2 border border-red-500/30">
                  <ArrowUpRight className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <div className="text-xs text-white/60 uppercase">Sent</div>
                  <div className="text-red-400 font-mono font-light text-lg">
                    {summary.totalSolSent?.toFixed(4) || 0} <span className="text-xs">SOL</span>
                  </div>
                </div>
              </div>
              
              {/* Net Flow */}
              <div className="border border-blue-500/30 p-3 flex items-center gap-3">
                <div className="p-2 border border-blue-500/30">
                  <Coins className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <div className="text-xs text-white/60 uppercase">Net Flow</div>
                  <div className={`${netFlowColorClass} font-mono font-light text-lg`}>
                    {netFlow > 0 ? "+" : ""}{netFlow.toFixed(4)} <span className="text-xs">SOL</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Token Balances - Collapsible Section */}
          {summary.tokenBalances && summary.tokenBalances.length > 0 && (
            <div className="mb-6">
              <button 
                onClick={() => toggleSection('tokens')}
                className="w-full flex items-center justify-between text-base font-light text-white gap-2 mb-3 pb-2 border-b border-white/10"
              >
                <span className="uppercase">Token Portfolio</span>
                {expandedSections.tokens ? 
                  <ChevronUp className="w-4 h-4 text-purple-400" /> : 
                  <ChevronDown className="w-4 h-4 text-purple-400" />
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
                            className="flex items-center gap-3 p-2 border border-purple-500/30"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: idx * 0.05 }}
                          >
                            <div className="w-10 h-10 border border-purple-500/30 flex items-center justify-center text-base font-light text-purple-400 uppercase">
                              {token.tokenSymbol?.slice(0, 1) || token.mint.slice(0, 1)}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <p className="text-purple-400 text-sm font-light uppercase">
                                  {token.tokenSymbol || token.mint.slice(0, 6)}
                                </p>
                                <p className="text-purple-300 font-mono font-light">
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
                <div className="text-center py-2 text-purple-400 text-xs uppercase">
                  <span>{summary.tokenBalances.length} tokens in portfolio • Click to expand</span>
                </div>
              )}
            </div>
          )}

          {/* NFTs if any */}
          {summary.nfts && summary.nfts.length > 0 && (
            <div className="mb-6 p-3 border border-pink-500/30">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 border border-pink-500/30 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-pink-400" />
                </div>
                
                <div>
                  <h4 className="text-base font-light text-pink-400 mb-1 uppercase">NFT Collection</h4>
                  <p className="text-white/80 text-sm">
                    Your wallet holds <span className="text-pink-400 font-light">{summary.nfts.length} NFTs</span>
                    {summary.nfts[0].collection && (
                      <>
                        , including items from <span className="text-pink-400 font-light">{summary.nfts[0].collection}</span>
                        {summary.nfts.length > 1 && summary.nfts[1].collection && summary.nfts[1].collection !== summary.nfts[0].collection && (
                          <> and <span className="text-pink-400 font-light">{summary.nfts[1].collection}</span></>
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
                className="w-full flex items-center justify-between text-base font-light text-white gap-2 mb-3 pb-2 border-b border-white/10"
              >
                <span className="uppercase">Recent Transactions</span>
                {expandedSections.transactions ? 
                  <ChevronUp className="w-4 h-4 text-emerald-400" /> : 
                  <ChevronDown className="w-4 h-4 text-emerald-400" />
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
                        
                        // Determine transaction color based on type
                        let txColor = "text-emerald-400 border-emerald-500/30";
                        if (tx.type === 'tokenTransfer') txColor = "text-purple-400 border-purple-500/30";
                        else if (tx.type === 'systemTransfer') txColor = "text-blue-400 border-blue-500/30";
                        else if (tx.type === 'swap') txColor = "text-amber-400 border-amber-500/30";
                        else if (tx.type === 'nftMint' || tx.type === 'nftSale') txColor = "text-pink-400 border-pink-500/30";
                        
                        return (
                          <motion.div 
                            key={`tx-${idx}`} 
                            className={`p-3 border ${txColor.split(' ')[1]} flex items-center gap-3`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: idx * 0.05 }}
                          >
                            <div className={`p-2 border ${txColor.split(' ')[1]}`}>
                              <AlertCircle className={`w-4 h-4 ${txColor.split(' ')[0]}`} />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <p className={`${txColor.split(' ')[0]} text-sm font-light uppercase`}>
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
                <div className="text-center py-2 text-emerald-400 text-xs uppercase">
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
                className="w-full flex items-center justify-between text-base font-light text-white gap-2 mb-3 pb-2 border-b border-white/10"
              >
                <span className="uppercase">Recommended Actions</span>
                {expandedSections.actions ? 
                  <ChevronUp className="w-4 h-4 text-cyan-400" /> : 
                  <ChevronDown className="w-4 h-4 text-cyan-400" />
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
                          className="flex items-start gap-3 p-3 border border-cyan-500/30"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: idx * 0.05 }}
                        >
                          <div className="p-1.5 border border-cyan-500/30 flex-shrink-0 mt-0.5">
                            <div className="w-3 h-3 border-2 border-cyan-400 flex items-center justify-center">
                            </div>
                          </div>
                          <p className="text-sm text-cyan-300">{action}</p>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {!expandedSections.actions && summary.suggestedActions.length > 0 && (
                <div className="text-center py-2 text-cyan-400 text-xs uppercase">
                  <span>{summary.suggestedActions.length} suggested actions • Click to expand</span>
                </div>
              )}
            </div>
          )}

          {/* Copy button */}
          <div className="mt-6 flex justify-end">
            <button
              className="px-3 py-2 bg-black text-xs text-cyan-400 hover:text-cyan-300 border border-cyan-500/30 hover:border-cyan-500/50 transition-colors flex items-center gap-2"
              onClick={() => onCopy(JSON.stringify(summary, null, 2), "full")}
            >
              {copiedState.full ? (
                <>
                  <CheckIcon className="w-4 h-4" />
                  <span className="uppercase">Copied to Clipboard</span>
                </>
              ) : (
                <>
                  <Clipboard className="w-4 h-4" />
                  <span className="uppercase">Copy Full Report</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletSummaryDisplay;