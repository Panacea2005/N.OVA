import React from "react";
import { BarChart, AlertCircle } from "lucide-react";
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

  // Score styling - with color
  const getScoreStyle = (scoreValue: number) => {
    if (scoreValue < 30) return { color: "text-red-400", width: `${scoreValue}%` };
    if (scoreValue < 50) return { color: "text-orange-400", width: `${scoreValue}%` };
    if (scoreValue < 70) return { color: "text-yellow-400", width: `${scoreValue}%` };
    if (scoreValue < 90) return { color: "text-green-400", width: `${scoreValue}%` };
    return { color: "text-emerald-400", width: `${scoreValue}%` };
  };

  const scoreStyle = score ? getScoreStyle(score.score) : { color: "", width: "0%" };

  // Loading state
  if (isLoading) {
    return (
      <div className="border border-white/30 p-0.5">
        <div className="border border-white/10 p-5">
          <div className="flex items-center justify-center min-h-[240px]">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 border-t-2 border-b-2 border-blue-400 rounded-full animate-spin mb-4"></div>
              <p className="text-blue-400 text-sm uppercase">Calculating Reputation Score</p>
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
      <div className="border border-white/30 p-0.5">
        <div className="border border-white/10 p-5">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4 gap-2">
            <div>
              <h3 className="text-lg font-light text-white flex items-center gap-2 mb-2 uppercase">
                <div className="w-5 h-5 border border-blue-500/50 flex items-center justify-center">
                  <BarChart className="w-3 h-3 text-blue-400" />
                </div>
                Wallet Reputation Score
              </h3>
              <p className="text-white/70 text-sm max-w-lg uppercase">
                Analysis of wallet activity, diversity, and holding patterns on the Solana blockchain.
              </p>
            </div>
            <div className="flex flex-row md:flex-col items-start md:items-end gap-4 md:gap-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/60 uppercase">Timestamp</span>
                <span className="text-sm font-mono text-blue-400">
                  {new Date(score.timestamp).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Reputation Score */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-light text-white uppercase">Reputation Score</h4>
              <span className={`text-xl font-light font-mono ${scoreStyle.color}`}>
                {score.score}/100
              </span>
            </div>
            <div className="h-0.5 w-full bg-white/10">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: scoreStyle.width }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
              />
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            <div className="border border-blue-500/30 p-2">
              <p className="text-blue-400 text-base font-light">{score.activityLevel.transactionsLast90Days}</p>
              <p className="text-xs text-white/60 uppercase">90d Transactions</p>
            </div>
            <div className="border border-purple-500/30 p-2">
              <p className="text-purple-400 text-base font-light">
                {score.diversity.defiInteractions + score.diversity.nftInteractions + score.diversity.daoInteractions}
              </p>
              <p className="text-xs text-white/60 uppercase">Diverse Interactions</p>
            </div>
            <div className="border border-green-500/30 p-2">
              <p className="text-green-400 text-base font-light">{score.holding.avgHoldingDays.toFixed(1)} days</p>
              <p className="text-xs text-white/60 uppercase">Avg Holding</p>
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown Section */}
      <div className="border border-white/30 p-0.5">
        <div className="border border-white/10 p-5">
          <h3 className="text-base font-light text-white flex items-center gap-2 mb-4 uppercase">
            <div className="w-5 h-5 border border-cyan-500/50 flex items-center justify-center">
              <AlertCircle className="w-3 h-3 text-cyan-400" />
            </div>
            Score Breakdown
          </h3>
          <div className="space-y-4">
            <div className="border-l-2 border-blue-500/50 pl-3">
              <h4 className="text-blue-400 font-light text-sm uppercase">Activity Level</h4>
              <p className="text-white/80 text-xs mb-1">
                {score.activityLevel.transactionsLast90Days} transactions in the last 90 days
              </p>
              <p className="text-green-400 text-xs">
                Score: {score.activityLevel.score.toFixed(1)}/33
              </p>
            </div>
            <div className="border-l-2 border-purple-500/50 pl-3">
              <h4 className="text-purple-400 font-light text-sm uppercase">Diversity</h4>
              <p className="text-white/80 text-xs mb-1">
                DeFi: {score.diversity.defiInteractions}, NFTs: {score.diversity.nftInteractions}, DAOs:{" "}
                {score.diversity.daoInteractions}
              </p>
              <p className="text-green-400 text-xs">
                Score: {score.diversity.score.toFixed(1)}/33
              </p>
            </div>
            <div className="border-l-2 border-green-500/50 pl-3">
              <h4 className="text-green-400 font-light text-sm uppercase">Holding Patterns</h4>
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