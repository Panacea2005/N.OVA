import React, { useState } from "react";
import {
  Coins,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Clipboard,
  CheckIcon,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TokenInsights } from "@/lib/services/ai/tokenInsights";

interface TokenInsightsDisplayProps {
  insights: TokenInsights | null;
  isLoading?: boolean;
  onRefresh?: () => void;
  onCopy: (text: string, type?: "full" | "suggestions") => void;
}

const TokenInsightsDisplay: React.FC<TokenInsightsDisplayProps> = ({
  insights,
  isLoading = false,
  onRefresh,
  onCopy,
}) => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  if (!insights && !isLoading) return null;

  // Get token name for display
  const getTokenName = () => {
    if (!insights) return "Unknown Token";
    return (
      insights.metadata.name ||
      insights.metadata.symbol ||
      `Token ${insights.address.slice(0, 6)}...${insights.address.slice(-4)}`
    );
  };

  // Risk score styling
  const getRiskStyle = (score?: number) => {
    if (!score || score < 30) return { color: "text-green-400", width: `${score || 0}%` };
    if (score < 70) return { color: "text-yellow-400", width: `${score}%` };
    return { color: "text-red-400", width: `${score}%` };
  };

  const riskStyle = getRiskStyle(insights?.riskScore?.score);

  // Network badge styling
  const getNetworkBadge = (network?: string) => {
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

  // Loading state
  if (isLoading) {
    return (
      <div className="border border-white/30 p-0.5">
        <div className="border border-white/10 p-5">
          <div className="flex items-center justify-center min-h-[240px]">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 border-t-2 border-b-2 border-purple-400 rounded-full animate-spin mb-4"></div>
              <p className="text-purple-400 text-sm uppercase">Analyzing Token Data</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col space-y-6">
      {/* Main Token Insights Card */}
      <div className="border border-white/30 p-0.5">
        <div className="border border-white/10 p-5">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4 gap-2">
            <div>
              <h3 className="text-lg font-light text-white flex items-center gap-2 mb-2 uppercase">
                <div className="w-5 h-5 border border-purple-500/50 flex items-center justify-center">
                  <Coins className="w-3 h-3 text-purple-400" />
                </div>
                Token Insights
              </h3>
              <p className="text-white/70 text-sm max-w-lg uppercase">
                {insights?.metadata.description ||
                  `Analysis of ${getTokenName()} on the Solana blockchain.`}
              </p>
            </div>
            <div className="flex flex-row md:flex-col items-start md:items-end gap-4 md:gap-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/60 uppercase">Network</span>
                <span className={`text-sm border px-2 uppercase ${getNetworkBadge(insights?.network)}`}>
                  {insights?.network || "Unknown"}
                </span>
              </div>
              {insights?.isVerified && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/60 uppercase">Status</span>
                  <span className="text-sm border border-green-500/30 text-green-400 px-2 uppercase">
                    Verified
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Token Address */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-light text-white uppercase">Token Address</h4>
              <button
                className="text-xs text-cyan-400 hover:text-cyan-300 border border-cyan-500/30 hover:border-cyan-500/50 px-2 py-1 transition-colors flex items-center uppercase"
                onClick={() => insights && onCopy(insights.address, "full")}
              >
                <Clipboard className="w-3 h-3 mr-1" />
                Copy
              </button>
            </div>
            <div className="text-sm font-mono text-amber-300/80 break-all">{insights?.address || "N/A"}</div>
          </div>

          {/* Risk Score with Animation */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-light text-white uppercase">Risk Score</h4>
              <span className={`text-xl font-light font-mono ${riskStyle.color}`}>
                {insights?.riskScore?.score ?? 0}/100
              </span>
            </div>
            <div className="h-0.5 w-full bg-white/10">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: riskStyle.width }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-full ${
                  (insights?.riskScore?.score || 0) < 30 
                    ? "bg-gradient-to-r from-green-500 to-emerald-500" 
                    : (insights?.riskScore?.score || 0) < 70 
                    ? "bg-gradient-to-r from-yellow-500 to-amber-500" 
                    : "bg-gradient-to-r from-red-500 to-orange-500"
                }`}
              />
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            <div className="border border-indigo-500/30 p-2">
              <p className="text-indigo-400 text-base font-light">{insights?.supply.total.toLocaleString() ?? "N/A"}</p>
              <p className="text-xs text-white/60 uppercase">Total Supply</p>
            </div>
            
            {(insights?.supply?.circulatingPercent ?? 0) < 100 && (
              <div className="border border-blue-500/30 p-2">
                <p className="text-blue-400 text-base font-light">{(insights?.supply?.circulatingPercent ?? 0).toFixed(2)}%</p>
                <p className="text-xs text-white/60 uppercase">Circulating</p>
              </div>
            )}
            
            {insights?.price.price && (
              <div className="border border-green-500/30 p-2">
                <p className="text-green-400 text-base font-light">${insights.price.price.toFixed(6)}</p>
                <p className="text-xs text-white/60 uppercase">Price</p>
              </div>
            )}
            
            {insights?.price.marketCap && (
              <div className="border border-purple-500/30 p-2">
                <p className="text-purple-400 text-base font-light">${insights.price.marketCap.toLocaleString()}</p>
                <p className="text-xs text-white/60 uppercase">Market Cap</p>
              </div>
            )}
            
            {(insights?.recentActivity.transferCount24h ?? 0) > 0 && (
              <div className="border border-cyan-500/30 p-2">
                <p className="text-cyan-400 text-base font-light">{insights?.recentActivity?.transferCount24h ?? "N/A"}</p>
                <p className="text-xs text-white/60 uppercase">24h Transfers</p>
              </div>
            )}
            
            {(insights?.topHolders?.length ?? 0) > 0 && (
              <div className="border border-amber-500/30 p-2">
                <p className="text-amber-400 text-base font-light">{insights?.topHolders?.length ?? "N/A"}</p>
                <p className="text-xs text-white/60 uppercase">Top Holders</p>
              </div>
            )}
          </div>

          {/* Network Warning */}
          {(insights?.network === "devnet" || insights?.network === "testnet") && (
            <div className="flex items-center gap-2 mb-3 border border-amber-500/30 p-2">
              <span className="text-xs text-white uppercase">Network Status:</span>
              <span className="text-xs text-amber-400 uppercase">
                {insights.network} - NO REAL VALUE
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Top Holders Section - Collapsible */}
      {(insights?.topHolders?.length ?? 0) > 0 && (
        <div className="border border-white/30 p-0.5">
          <div className="border border-white/10 p-5">
            <button
              onClick={() => toggleSection("holders")}
              className="w-full flex items-center justify-between text-base font-light text-white mb-3 uppercase"
            >
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border border-amber-500/50 flex items-center justify-center">
                  <Coins className="w-3 h-3 text-amber-400" />
                </div>
                Top Holders
              </div>
              {expandedSection === "holders" ? (
                <ChevronUp className="w-5 h-5 text-amber-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-amber-400" />
              )}
            </button>
            <AnimatePresence>
              {expandedSection === "holders" && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4 max-h-64 overflow-y-auto pr-1"
                >
                  {insights?.topHolders?.slice(0, 2).map((holder, idx) => (
                    <div key={`holder-${idx}`} className="border-l-2 border-amber-500/50 pl-3">
                      <h4 className="text-amber-400 font-light text-sm uppercase">
                        Holder {idx + 1}
                      </h4>
                      <p className="text-amber-300/80 text-xs mb-1 font-mono">{holder.address}</p>
                      <div className="text-xs mb-1">
                        <span className="text-white/50">Percentage: </span>
                        <span className="text-white/80">{holder.percentage.toFixed(2)}%</span>
                      </div>
                    </div>
                  ))}
                  {(insights?.topHolders?.length ?? 0) > 2 && (
                    <p className="text-xs text-white/50 italic">
                      {insights?.topHolders?.length ? insights.topHolders.length - 2 : 0} more holders not shown
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Recent Activity Section - Collapsible */}
      {(insights?.recentActivity?.transferCount24h ?? 0) > 0 && (
        <div className="border border-white/30 p-0.5">
          <div className="border border-white/10 p-5">
            <button
              onClick={() => toggleSection("activity")}
              className="w-full flex items-center justify-between text-base font-light text-white mb-3 uppercase"
            >
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border border-blue-500/50 flex items-center justify-center">
                  <AlertCircle className="w-3 h-3 text-blue-400" />
                </div>
                Recent Activity (24h)
              </div>
              {expandedSection === "activity" ? (
                <ChevronUp className="w-5 h-5 text-blue-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-blue-400" />
              )}
            </button>
            <AnimatePresence>
              {expandedSection === "activity" && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4 max-h-64 overflow-y-auto pr-1"
                >
                  <div className="border-l-2 border-blue-500/50 pl-3">
                    <h4 className="text-blue-400 font-light text-sm uppercase">Transfers</h4>
                    <p className="text-white/80 text-xs mb-1">{insights?.recentActivity?.transferCount24h ?? "N/A"}</p>
                  </div>
                  <div className="border-l-2 border-blue-500/50 pl-3">
                    <h4 className="text-blue-400 font-light text-sm uppercase">Unique Wallets</h4>
                    <p className="text-white/80 text-xs mb-1">{insights?.recentActivity.uniqueWallets24h}</p>
                  </div>
                  <div className="border-l-2 border-blue-500/50 pl-3">
                    <h4 className="text-blue-400 font-light text-sm uppercase">Large Transactions</h4>
                    <p className="text-white/80 text-xs mb-1">{insights?.recentActivity.largeTransactions24h}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* External Links Section */}
      {(insights?.metadata.website || insights?.metadata.twitter || insights?.address) && (
        <div className="border border-white/30 p-0.5">
          <div className="border border-white/10 p-5">
            <h3 className="text-base font-light text-white flex items-center gap-2 mb-3 uppercase">
              <div className="w-5 h-5 border border-indigo-500/50 flex items-center justify-center">
                <ExternalLink className="w-3 h-3 text-indigo-400" />
              </div>
              External Links
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {insights?.address && (
                <a
                  href={`https://${insights.network === "mainnet-beta" ? "" : insights.network + "."}solscan.io/token/${insights.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-indigo-500/30 p-2 hover:border-indigo-500/70 transition-colors"
                >
                  <p className="text-indigo-400 text-base font-light uppercase">Solscan</p>
                  <p className="text-xs text-white/60 uppercase">Explorer</p>
                </a>
              )}
              {insights?.metadata.website && (
                <a
                  href={insights.metadata.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-cyan-500/30 p-2 hover:border-cyan-500/70 transition-colors"
                >
                  <p className="text-cyan-400 text-base font-light uppercase">Website</p>
                  <p className="text-xs text-white/60 uppercase">Official Site</p>
                </a>
              )}
              {insights?.metadata.twitter && (
                <a
                  href={insights.metadata.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-blue-500/30 p-2 hover:border-blue-500/70 transition-colors"
                >
                  <p className="text-blue-400 text-base font-light uppercase">Twitter</p>
                  <p className="text-xs text-white/60 uppercase">Social Media</p>
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="border border-white/30 p-0.5">
        <div className="border border-white/10 p-5">
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 border border-amber-500/50 flex items-center justify-center">
              <AlertCircle className="w-3 h-3 text-amber-400" />
            </div>
            <p className="text-white/60 text-xs">
              Disclaimer: This analysis is provided for informational purposes only and should not be considered financial advice. Always do your own research before interacting with any token.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenInsightsDisplay;