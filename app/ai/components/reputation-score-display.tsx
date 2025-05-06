import React from "react";
import { Clipboard, AlertCircle, BarChart, Users, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { ReputationScore } from "@/lib/services/ai/reputationScore";

interface ReputationScoreDisplayProps {
  score: ReputationScore | null;
  isLoading?: boolean;
  onCopy: (text: string, type?: "full" | "suggestions") => void;
}

const ReputationScoreDisplay: React.FC<ReputationScoreDisplayProps> = ({
  score,
  isLoading = false,
  onCopy,
}) => {
  if (!score && !isLoading) return null;

  // Score styling
  const getScoreStyle = (scoreValue: number) => {
    if (scoreValue < 30)
      return {
        color: "text-red-500",
        gradient: "from-red-700 to-red-500",
        width: `${scoreValue}%`,
      };
    if (scoreValue < 50)
      return {
        color: "text-orange-500",
        gradient: "from-orange-700 to-orange-500",
        width: `${scoreValue}%`,
      };
    if (scoreValue < 70)
      return {
        color: "text-yellow-500",
        gradient: "from-yellow-700 to-yellow-500",
        width: `${scoreValue}%`,
      };
    if (scoreValue < 90)
      return {
        color: "text-green-500",
        gradient: "from-green-700 to-green-500",
        width: `${scoreValue}%`,
      };
    return {
      color: "text-emerald-500",
      gradient: "from-emerald-700 to-emerald-500",
      width: `${scoreValue}%`,
    };
  };

  const scoreStyle = score ? getScoreStyle(score.score) : { color: "", gradient: "", width: "0%" };

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
              <BarChart className="w-8 h-8 text-white/40 animate-spin mb-4" />
              <p className="text-white/60 text-sm">CALCULATING REPUTATION SCORE...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!score) return null;

  return (
    <div className="w-full flex flex-col space-y-6">
      {/* Main Reputation Score Card */}
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
                  <BarChart className="w-3 h-3 text-white" />
                </div>
                Wallet Reputation Score
              </h3>
              <p className="text-white/60 text-sm max-w-lg">
                Analysis of wallet activity, diversity, and holding patterns on the Solana blockchain.
              </p>
            </div>
            <div className="flex flex-row md:flex-col items-start md:items-end gap-4 md:gap-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/60">TIMESTAMP</span>
                <span className="text-sm font-mono text-blue-400">
                  {new Date(score.timestamp).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Reputation Score */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium text-white">Reputation Score</h4>
              <span className={`text-xl font-bold font-mono ${scoreStyle.color}`}>
                {score.score}/100
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

          {/* Metrics Grid */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="relative overflow-hidden border border-blue-700/50 bg-black/30 p-2 rounded-md backdrop-blur-sm">
              <p className="text-blue-500 text-base font-bold">{score.activityLevel.transactionsLast90Days}</p>
              <p className="text-xs text-white/60">90d Transactions</p>
            </div>
            <div className="relative overflow-hidden border border-purple-700/50 bg-black/30 p-2 rounded-md backdrop-blur-sm">
              <p className="text-purple-500 text-base font-bold">
                {score.diversity.defiInteractions + score.diversity.nftInteractions + score.diversity.daoInteractions}
              </p>
              <p className="text-xs text-white/60">Diverse Interactions</p>
            </div>
            <div className="relative overflow-hidden border border-green-700/50 bg-black/30 p-2 rounded-md backdrop-blur-sm">
              <p className="text-green-500 text-base font-bold">{score.holding.avgHoldingDays.toFixed(1)} days</p>
              <p className="text-xs text-white/60">Avg Holding</p>
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown Section */}
      <div className="w-full relative overflow-hidden border border-white/10 rounded-md bg-gradient-to-b from-black/60 to-black/80 backdrop-blur-sm">
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-70"></div>
        <div className="p-4">
          <h3 className="text-base font-medium text-white flex items-center gap-2 mb-3">
            <div className="w-5 h-5 rounded-full bg-gradient-to-r from-blue-600 to-green-600 flex items-center justify-center">
              <AlertCircle className="w-3 h-3 text-white" />
            </div>
            Score Breakdown
          </h3>
          <div className="space-y-4">
            <div className="border-l-2 border-blue-500/50 pl-3">
              <h4 className="text-blue-400 font-medium text-sm">Activity Level</h4>
              <p className="text-white/80 text-xs mb-1">
                {score.activityLevel.transactionsLast90Days} transactions in the last 90 days
              </p>
              <p className="text-green-400 text-xs">
                Score: {score.activityLevel.score.toFixed(1)}/33
              </p>
            </div>
            <div className="border-l-2 border-purple-500/50 pl-3">
              <h4 className="text-purple-400 font-medium text-sm">Diversity</h4>
              <p className="text-white/80 text-xs mb-1">
                DeFi: {score.diversity.defiInteractions}, NFTs: {score.diversity.nftInteractions}, DAOs:{" "}
                {score.diversity.daoInteractions}
              </p>
              <p className="text-green-400 text-xs">
                Score: {score.diversity.score.toFixed(1)}/33
              </p>
            </div>
            <div className="border-l-2 border-green-500/50 pl-3">
              <h4 className="text-green-400 font-medium text-sm">Holding Patterns</h4>
              <p className="text-white/80 text-xs mb-1">
                Avg Holding: {score.holding.avgHoldingDays.toFixed(1)} days, Tx Frequency:{" "}
                {score.holding.txFrequency.toFixed(2)} tx/day
              </p>
              <p className="text-green-400 text-xs">
                Score: {score.holding.score.toFixed(1)}/34
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReputationScoreDisplay;
