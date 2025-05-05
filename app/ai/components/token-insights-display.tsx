import React, { useState } from "react";
import {
  Coins,
  AlertTriangle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Clipboard,
  CheckIcon,
  AlertCircle,
  BarChart,
  Users,
  Wallet,
  Shield,
  Globe,
  FileSearch,
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

  // Network badge styling
  const getNetworkBadge = (network?: string) => {
    const networkMap: Record<string, { color: string; borderColor: string; bgColor: string }> = {
      "mainnet-beta": {
        color: "text-purple-400",
        borderColor: "border-purple-700/50",
        bgColor: "bg-purple-900/30",
      },
      devnet: {
        color: "text-blue-400",
        borderColor: "border-blue-700/50",
        bgColor: "bg-blue-900/30",
      },
      testnet: {
        color: "text-green-400",
        borderColor: "border-green-700/50",
        bgColor: "bg-green-900/30",
      },
    };

    const networkStyle =
      networkMap[network?.toLowerCase() ?? ""] || {
        color: "text-gray-400",
        borderColor: "border-gray-700/50",
        bgColor: "bg-gray-900/30",
      };

    return (
      <span
        className={`${networkStyle.color} ${networkStyle.borderColor} ${networkStyle.bgColor} text-xs px-2 py-0.5 rounded border`}
      >
        {network?.toUpperCase() || "UNKNOWN"}
      </span>
    );
  };

  // Risk score styling
  const getRiskStyle = (score?: number) => {
    if (!score || score < 30)
      return {
        color: "text-green-500",
        gradient: "from-green-700 to-green-500",
        width: `${score || 0}%`,
      };
    if (score < 70)
      return {
        color: "text-yellow-500",
        gradient: "from-yellow-700 to-yellow-500",
        width: `${score}%`,
      };
    return {
      color: "text-red-500",
      gradient: "from-red-700 to-red-500",
      width: `${score}%`,
    };
  };

  const riskStyle = getRiskStyle(insights?.riskScore?.score);

  // Loading state
  if (isLoading) {
    return (
      <div className="relative border border-white/10 rounded-md overflow-hidden">
        <div
          className="absolute inset-0 z-0 opacity-20"
          style={{
            backgroundImage: "radial-gradient(rgba(138, 75, 255, 0.2) 1px, transparent 1px)",
            backgroundSize: "10px 10px",
          }}
        ></div>
        <div className="relative z-10 p-4 backdrop-blur-sm bg-gradient-to-b from-black/60 to-black/80">
          <div className="flex items-center justify-center min-h-[240px]">
            <div className="flex flex-col items-center">
              <RefreshCw className="w-8 h-8 text-white/40 animate-spin mb-4" />
              <p className="text-white/60 text-sm">ANALYZING TOKEN DATA...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col space-y-6">
      {/* Main Token Insights Card */}
      <div className="relative border border-white/10 rounded-md overflow-hidden">
        <div
          className="absolute inset-0 z-0 opacity-20"
          style={{
            backgroundImage: "radial-gradient(rgba(138, 75, 255, 0.2) 1px, transparent 1px)",
            backgroundSize: "10px 10px",
          }}
        ></div>
        <div className="relative z-10 p-4 backdrop-blur-sm bg-gradient-to-b from-black/60 to-black/80">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4 gap-2">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
                <div className="w-5 h-5 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                  <Coins className="w-3 h-3 text-white" />
                </div>
                Token Insights
              </h3>
              <p className="text-white/60 text-sm max-w-lg">
                {insights?.metadata.description ||
                  `Analysis of ${getTokenName()} on the Solana blockchain.`}
              </p>
            </div>
            <div className="flex flex-row md:flex-col items-start md:items-end gap-4 md:gap-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/60">NETWORK</span>
                {getNetworkBadge(insights?.network)}
              </div>
              {insights?.isVerified && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/60">STATUS</span>
                  <span className="text-sm font-mono text-green-400 border border-green-700/50 bg-green-900/30 px-2 py-0.5 rounded">
                    VERIFIED
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Token Address */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium text-white">Token Address</h4>
              <button
                className="text-xs text-white/50 hover:text-white border border-white/10 hover:border-white/30 px-2 py-1 transition-colors flex items-center"
                onClick={() => insights && onCopy(insights.address, "full")}
              >
                <Clipboard className="w-3 h-3 mr-1" />
                Copy
              </button>
            </div>
            <div className="text-sm font-mono text-white/80 break-all">{insights?.address || "N/A"}</div>
          </div>

          {/* Risk Score with Animation */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium text-white">Risk Score</h4>
              <span className={`text-xl font-bold font-mono ${riskStyle.color}`}>
                {insights?.riskScore?.score ?? 0}/100
              </span>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: riskStyle.width }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-full bg-gradient-to-r ${riskStyle.gradient} rounded-full`}
              />
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="relative overflow-hidden border border-white/10 bg-black/30 p-2 rounded-md backdrop-blur-sm">
            <p className="text-white text-base font-bold">{insights?.supply.total.toLocaleString() ?? "N/A"}</p>
            <p className="text-xs text-white/60">Total Supply</p>
          </div>
          {(insights?.supply?.circulatingPercent ?? 0) < 100 && (
            <div className="relative overflow-hidden border border-white/10 bg-black/30 p-2 rounded-md backdrop-blur-sm">
              <p className="text-white text-base font-bold">{(insights?.supply?.circulatingPercent ?? 0).toFixed(2)}%</p>
              <p className="text-xs text-white/60">Circulating</p>
              </div>
            )}
            {insights?.price.price && (
              <div className="relative overflow-hidden border border-white/10 bg-black/30 p-2 rounded-md backdrop-blur-sm">
                <p className="text-white text-base font-bold">${insights.price.price.toFixed(6)}</p>
                <p className="text-xs text-white/60">Price</p>
              </div>
            )}
            {insights?.price.marketCap && (
              <div className="relative overflow-hidden border border-white/10 bg-black/30 p-2 rounded-md backdrop-blur-sm">
                <p className="text-white text-base font-bold">${insights.price.marketCap.toLocaleString()}</p>
                <p className="text-xs text-white/60">Market Cap</p>
              </div>
            )}
            {(insights?.recentActivity.transferCount24h ?? 0) > 0 && (
              <div className="relative overflow-hidden border border-white/10 bg-black/30 p-2 rounded-md backdrop-blur-sm">
                <p className="text-white text-base font-bold">{insights?.recentActivity?.transferCount24h ?? "N/A"}</p>
                <p className="text-xs text-white/60">24h Transfers</p>
              </div>
            )}
            {(insights?.topHolders?.length ?? 0) > 0 && (
              <div className="relative overflow-hidden border border-white/10 bg-black/30 p-2 rounded-md backdrop-blur-sm">
                <p className="text-white text-base font-bold">{insights?.topHolders?.length ?? "N/A"}</p>
                <p className="text-xs text-white/60">Top Holders</p>
              </div>
            )}
          </div>

          {/* Network Warning */}
          {(insights?.network === "devnet" || insights?.network === "testnet") && (
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs text-white/60">NETWORK STATUS:</span>
              <span className="text-xs font-medium px-2 py-0.5 rounded bg-amber-900/30 text-amber-400">
                {insights.network.toUpperCase()} - NO REAL VALUE
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Top Holders Section - Collapsible */}
      {(insights?.topHolders?.length ?? 0) > 0 && (
        <div className="w-full relative overflow-hidden border border-white/10 rounded-md bg-gradient-to-b from-black/60 to-black/80 backdrop-blur-sm">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-70"></div>
          <div className="p-4">
            <button
              onClick={() => toggleSection("holders")}
              className="w-full flex items-center justify-between text-base font-medium text-white mb-3"
            >
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-gradient-to-r from-blue-6
00 to-green-600 flex items-center justify-center">
                  <Users className="w-3 h-3 text-white" />
                </div>
                Top Holders
              </div>
              {expandedSection === "holders" ? (
                <ChevronUp className="w-5 h-5 text-white/70" />
              ) : (
                <ChevronDown className="w-5 h-5 text-white/70" />
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
                    <div key={`holder-${idx}`} className="border-l-2 border-purple-500/50 pl-3">
                      <h4 className="text-purple-400 font-medium text-sm">
                        Holder {idx + 1}
                      </h4>
                      <p className="text-white/80 text-xs mb-1 font-mono">{holder.address}</p>
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
        <div className="w-full relative overflow-hidden border border-white/10 rounded-md bg-gradient-to-b from-black/60 to-black/80 backdrop-blur-sm">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-70"></div>
          <div className="p-4">
            <button
              onClick={() => toggleSection("activity")}
              className="w-full flex items-center justify-between text-base font-medium text-white mb-3"
            >
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-gradient-to-r from-blue-600 to-green-600 flex items-center justify-center">
                  <RefreshCw className="w-3 h-3 text-white" />
                </div>
                Recent Activity (24h)
              </div>
              {expandedSection === "activity" ? (
                <ChevronUp className="w-5 h-5 text-white/70" />
              ) : (
                <ChevronDown className="w-5 h-5 text-white/70" />
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
                    <h4 className="text-blue-400 font-medium text-sm">Transfers</h4>
                    <p className="text-white/80 text-xs mb-1">{insights?.recentActivity?.transferCount24h ?? "N/A"}</p>
                  </div>
                  <div className="border-l-2 border-blue-500/50 pl-3">
                    <h4 className="text-blue-400 font-medium text-sm">Unique Wallets</h4>
                    <p className="text-white/80 text-xs mb-1">{insights?.recentActivity.uniqueWallets24h}</p>
                  </div>
                  <div className="border-l-2 border-blue-500/50 pl-3">
                    <h4 className="text-blue-400 font-medium text-sm">Large Transactions</h4>
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
        <div className="w-full relative overflow-hidden border border-white/10 rounded-md bg-gradient-to-b from-black/60 to-black/80 backdrop-blur-sm">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-70"></div>
          <div className="p-4">
            <h3 className="text-base font-medium text-white flex items-center gap-2 mb-3">
              <div className="w-5 h-5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center">
                <ExternalLink className="w-3 h-3 text-white" />
              </div>
              External Links
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {insights?.address && (
                <a
                  href={`https://${insights.network === "mainnet-beta" ? "" : insights.network + "."}solscan.io/token/${insights.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative overflow-hidden border border-indigo-700/50 bg-black/30 p-2 rounded-md backdrop-blur-sm hover:bg-indigo-900/30 transition-colors"
                >
                  <p className="text-indigo-400 text-base font-bold">Solscan</p>
                  <p className="text-xs text-white/60">Explorer</p>
                </a>
              )}
              {insights?.metadata.website && (
                <a
                  href={insights.metadata.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative overflow-hidden border border-indigo-700/50 bg-black/30 p-2 rounded-md backdrop-blur-sm hover:bg-indigo-900/30 transition-colors"
                >
                  <p className="text-indigo-400 text-base font-bold">Website</p>
                  <p className="text-xs text-white/60">Official Site</p>
                </a>
              )}
              {insights?.metadata.twitter && (
                <a
                  href={insights.metadata.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative overflow-hidden border border-indigo-700/50 bg-black/30 p-2 rounded-md backdrop-blur-sm hover:bg-indigo-900/30 transition-colors"
                >
                  <p className="text-indigo-400 text-base font-bold">Twitter</p>
                  <p className="text-xs text-white/60">Social Media</p>
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="w-full relative overflow-hidden border border-white/10 rounded-md bg-gradient-to-b from-black/60 to-black/80 backdrop-blur-sm">
        <div className="p-4">
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 rounded-full bg-gradient-to-r from-gray-600 to-gray-600 flex items-center justify-center">
              <AlertCircle className="w-3 h-3 text-white" />
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