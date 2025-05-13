import React from "react";
import { AlertCircle, CheckIcon, Clipboard } from "lucide-react";
import { motion } from "framer-motion";

interface AnalysisResultDisplayProps {
  analysis: any;
  onCopy: (text: string, type: "full" | "suggestions") => void;
  copiedState: {
    full: boolean;
    suggestions: boolean;
  };
}

const AnalysisResultDisplay: React.FC<AnalysisResultDisplayProps> = ({
  analysis,
  onCopy,
  copiedState,
}) => {
  if (!analysis) return null;

  // Calculate security score color and gradient
  const getScoreColor = (score: number) => {
    if (score < 30)
      return {
        color: "text-red-400",
        width: `${score}%`,
      };
    if (score < 50)
      return {
        color: "text-orange-400",
        width: `${score}%`,
      };
    if (score < 70)
      return {
        color: "text-yellow-400",
        width: `${score}%`,
      };
    if (score < 90)
      return {
        color: "text-green-400",
        width: `${score}%`,
      };
    return {
      color: "text-emerald-400",
      width: `${score}%`,
    };
  };

  const scoreStyle = getScoreColor(analysis.securityScore);

  // Count issues by severity for badges
  const criticalCount = analysis.critical?.length || 0;
  const highCount = analysis.high?.length || 0;
  const mediumCount = analysis.medium?.length || 0;
  const lowCount = analysis.low?.length || 0;
  const infoCount = analysis.informational?.length || 0;
  const optCount = analysis.optimizations?.length || 0;

  return (
    <div className="w-full flex flex-col space-y-6">
      {/* Main Analysis Card */}
      <div className="border border-white/30 p-0.5">
        <div className="border border-white/10 p-5">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4 gap-2">
            <div>
              <h3 className="text-lg font-light text-white flex items-center gap-2 mb-2 uppercase">
                <div className="w-5 h-5 border border-indigo-500/50 flex items-center justify-center">
                  <AlertCircle className="w-3 h-3 text-indigo-400" />
                </div>
                Contract Security Analysis
              </h3>
              <p className="text-white/70 text-sm max-w-lg uppercase">
                {analysis.summary ||
                  "Analysis of potential security concerns and optimizations in your Solana program."}
              </p>
            </div>

            <div className="flex flex-row md:flex-col items-start md:items-end gap-4 md:gap-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/60">SCAN</span>
                <span className="text-sm font-mono text-blue-400">
                  {analysis.scanDuration}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/60">LOC</span>
                <span className="text-sm font-mono text-purple-400">
                  {analysis.linesOfCode}
                </span>
              </div>
            </div>
          </div>

          {/* Security Score with Animation */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm uppercase text-white">Security Score</h4>
              <span className={`text-xl font-light font-mono ${scoreStyle.color}`}>
                {analysis.securityScore}/100
              </span>
            </div>
            <div className="h-0.5 w-full bg-white/10">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: scoreStyle.width }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-full bg-gradient-to-r from-indigo-500 to-blue-500`}
              />
            </div>
          </div>

          {/* Issues Summary - Grid */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            {criticalCount > 0 && (
              <div className="border border-red-500/30 p-2">
                <p className="text-red-400 text-base font-light uppercase">
                  {criticalCount}
                </p>
                <p className="text-xs text-white/60 uppercase">Critical</p>
              </div>
            )}

            {highCount > 0 && (
              <div className="border border-orange-500/30 p-2">
                <p className="text-orange-400 text-base font-light uppercase">
                  {highCount}
                </p>
                <p className="text-xs text-white/60 uppercase">High</p>
              </div>
            )}

            {mediumCount > 0 && (
              <div className="border border-yellow-500/30 p-2">
                <p className="text-yellow-400 text-base font-light uppercase">
                  {mediumCount}
                </p>
                <p className="text-xs text-white/60 uppercase">Medium</p>
              </div>
            )}

            {lowCount > 0 && (
              <div className="border border-blue-500/30 p-2">
                <p className="text-blue-400 text-base font-light uppercase">{lowCount}</p>
                <p className="text-xs text-white/60 uppercase">Low</p>
              </div>
            )}

            {infoCount > 0 && (
              <div className="border border-purple-500/30 p-2">
                <p className="text-purple-400 text-base font-light uppercase">
                  {infoCount}
                </p>
                <p className="text-xs text-white/60 uppercase">Info</p>
              </div>
            )}

            {optCount > 0 && (
              <div className="border border-green-500/30 p-2">
                <p className="text-green-400 text-base font-light uppercase">{optCount}</p>
                <p className="text-xs text-white/60 uppercase">Optimizations</p>
              </div>
            )}
          </div>

          {/* Risk Level Indicator */}
          {analysis.riskLevel && (
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs text-white/60 uppercase">Risk Level:</span>
              <span className={`text-xs px-2 py-0.5 border uppercase
                ${analysis.riskLevel === "critical" ? "border-red-500/30 text-red-400" :
                  analysis.riskLevel === "high" ? "border-orange-500/30 text-orange-400" :
                  analysis.riskLevel === "medium" ? "border-yellow-500/30 text-yellow-400" :
                  "border-green-500/30 text-green-400"}`}>
                {analysis.riskLevel}
              </span>
            </div>
          )}

          {/* Complexity Indicator */}
          {analysis.contractComplexity && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/60 uppercase">Complexity:</span>
              <span className="text-xs px-2 py-0.5 border-indigo-500/30 border text-indigo-400 uppercase">
                {analysis.contractComplexity}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Code Suggestions Section - Only show if available */}
      {analysis.modificationSuggestions && (
        <div className="border border-white/30 p-0.5">
          <div className="border border-white/10 p-5">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base font-light text-white flex items-center gap-2 uppercase">
                <div className="w-5 h-5 border border-green-500/50 flex items-center justify-center">
                  <CheckIcon className="w-3 h-3 text-green-400" />
                </div>
                Suggested Modifications
              </h3>
              <button
                className="px-2 py-1 bg-transparent text-xs text-green-400 hover:text-green-300 border border-green-500/30 hover:border-green-500/50 transition-colors flex items-center gap-1"
                onClick={() =>
                  onCopy(analysis.modificationSuggestions, "suggestions")
                }
              >
                {copiedState.suggestions ? (
                  <>
                    <CheckIcon className="w-3 h-3" />
                    <span className="uppercase">Copied</span>
                  </>
                ) : (
                  <>
                    <Clipboard className="w-3 h-3" />
                    <span className="uppercase">Copy Code</span>
                  </>
                )}
              </button>
            </div>

            {/* Code Container with line numbers - scrollable horizontally */}
            <div className="border border-green-500/20">
              <div className="bg-black text-white/90 overflow-x-auto text-sm font-mono leading-5 max-h-64">
                <pre className="p-3 relative whitespace-pre-wrap break-all">
                  {/* Limit the code preview to first 20 lines */}
                  {analysis.modificationSuggestions
                    .split("\n")
                    .slice(0, 20)
                    .join("\n")}
                  {analysis.modificationSuggestions.split("\n").length > 20 && (
                    <div className="text-white/50 italic mt-2">
                      ... (additional lines omitted for brevity)
                    </div>
                  )}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Critical & High Issues Section */}
      {(criticalCount > 0 || highCount > 0) && (
        <div className="border border-white/30 p-0.5">
          <div className="border border-white/10 p-5">
            <h3 className="text-base font-light text-white flex items-center gap-2 mb-3 uppercase">
              <div className="w-5 h-5 border border-red-500/50 flex items-center justify-center">
                <AlertCircle className="w-3 h-3 text-red-400" />
              </div>
              Critical Issues
            </h3>

            <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
              {/* Show max 2 critical issues to save space */}
              {criticalCount > 0 &&
                analysis.critical.slice(0, 2).map((issue: any, idx: number) => (
                  <div
                    key={`critical-${idx}`}
                    className="border-l-2 border-red-500/50 pl-3"
                  >
                    <h4 className="text-red-400 font-light text-sm uppercase">
                      {issue.type}
                    </h4>
                    <p className="text-white/80 text-xs mb-1">
                      {issue.description}
                    </p>
                    <div className="text-xs mb-1">
                      <span className="text-white/50">Location: </span>
                      <span className="text-white/80">
                        {issue.location || "Unknown"}
                      </span>
                    </div>
                    <p className="text-green-400 text-xs">
                      <span className="text-white/50">Fix: </span>
                      {issue.recommendation}
                    </p>
                  </div>
                ))}

              {criticalCount > 2 && (
                <p className="text-xs text-white/50 italic">
                  {criticalCount - 2} more critical issues not shown
                </p>
              )}

              {/* Show max 2 high issues if there are any */}
              {highCount > 0 &&
                analysis.high.slice(0, 2).map((issue: any, idx: number) => (
                  <div
                    key={`high-${idx}`}
                    className="border-l-2 border-orange-500/50 pl-3"
                  >
                    <h4 className="text-orange-400 font-light text-sm uppercase">
                      {issue.type}
                    </h4>
                    <p className="text-white/80 text-xs mb-1">
                      {issue.description}
                    </p>
                    <div className="text-xs mb-1">
                      <span className="text-white/50">Location: </span>
                      <span className="text-white/80">
                        {issue.location || "Unknown"}
                      </span>
                    </div>
                    <p className="text-green-400 text-xs">
                      <span className="text-white/50">Fix: </span>
                      {issue.recommendation}
                    </p>
                  </div>
                ))}

              {highCount > 2 && (
                <p className="text-xs text-white/50 italic">
                  {highCount - 2} more high severity issues not shown
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisResultDisplay;