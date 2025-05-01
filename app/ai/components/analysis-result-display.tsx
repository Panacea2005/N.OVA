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
        color: "text-red-500",
        gradient: "from-red-700 to-red-500",
        width: `${score}%`,
      };
    if (score < 50)
      return {
        color: "text-orange-500",
        gradient: "from-orange-700 to-orange-500",
        width: `${score}%`,
      };
    if (score < 70)
      return {
        color: "text-yellow-500",
        gradient: "from-yellow-700 to-yellow-500",
        width: `${score}%`,
      };
    if (score < 90)
      return {
        color: "text-green-500",
        gradient: "from-green-700 to-green-500",
        width: `${score}%`,
      };
    return {
      color: "text-emerald-500",
      gradient: "from-emerald-700 to-emerald-500",
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
      <div className="relative border border-white/10 rounded-md overflow-hidden">
        <div
          className="absolute inset-0 z-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(rgba(138, 75, 255, 0.2) 1px, transparent 1px)",
            backgroundSize: "10px 10px",
          }}
        ></div>

        <div className="relative z-10 p-4 backdrop-blur-sm bg-gradient-to-b from-black/60 to-black/80">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4 gap-2">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
                <div className="w-5 h-5 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                  <AlertCircle className="w-3 h-3 text-white" />
                </div>
                Contract Security Analysis
              </h3>
              <p className="text-white/60 text-sm max-w-lg">
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
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium text-white">Security Score</h4>
              <span
                className={`text-xl font-bold font-mono ${scoreStyle.color}`}
              >
                {analysis.securityScore}/100
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

          {/* Issues Summary - Compact Grid */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            {criticalCount > 0 && (
              <div className="relative overflow-hidden border border-red-700/50 bg-black/30 p-2 rounded-md backdrop-blur-sm">
                <div className="absolute top-0 right-0 w-1 h-1 bg-red-500 rounded-full animate-pulse"></div>
                <p className="text-red-500 text-base font-bold">
                  {criticalCount}
                </p>
                <p className="text-xs text-white/60">Critical</p>
              </div>
            )}

            {highCount > 0 && (
              <div className="relative overflow-hidden border border-orange-700/50 bg-black/30 p-2 rounded-md backdrop-blur-sm">
                <div className="absolute top-0 right-0 w-1 h-1 bg-orange-500 rounded-full animate-pulse"></div>
                <p className="text-orange-500 text-base font-bold">
                  {highCount}
                </p>
                <p className="text-xs text-white/60">High</p>
              </div>
            )}

            {mediumCount > 0 && (
              <div className="relative overflow-hidden border border-yellow-700/50 bg-black/30 p-2 rounded-md backdrop-blur-sm">
                <p className="text-yellow-500 text-base font-bold">
                  {mediumCount}
                </p>
                <p className="text-xs text-white/60">Medium</p>
              </div>
            )}

            {lowCount > 0 && (
              <div className="relative overflow-hidden border border-blue-700/50 bg-black/30 p-2 rounded-md backdrop-blur-sm">
                <p className="text-blue-500 text-base font-bold">{lowCount}</p>
                <p className="text-xs text-white/60">Low</p>
              </div>
            )}

            {infoCount > 0 && (
              <div className="relative overflow-hidden border border-indigo-700/50 bg-black/30 p-2 rounded-md backdrop-blur-sm">
                <p className="text-indigo-500 text-base font-bold">
                  {infoCount}
                </p>
                <p className="text-xs text-white/60">Info</p>
              </div>
            )}

            {optCount > 0 && (
              <div className="relative overflow-hidden border border-green-700/50 bg-black/30 p-2 rounded-md backdrop-blur-sm">
                <p className="text-green-500 text-base font-bold">{optCount}</p>
                <p className="text-xs text-white/60">Optimizations</p>
              </div>
            )}
          </div>

          {/* Risk Level Indicator */}
          {analysis.riskLevel && (
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs text-white/60">RISK LEVEL:</span>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded ${
                  analysis.riskLevel === "critical"
                    ? "bg-red-900/30 text-red-400"
                    : analysis.riskLevel === "high"
                    ? "bg-orange-900/30 text-orange-400"
                    : analysis.riskLevel === "medium"
                    ? "bg-yellow-900/30 text-yellow-400"
                    : "bg-green-900/30 text-green-400"
                }`}
              >
                {analysis.riskLevel.toUpperCase()}
              </span>
            </div>
          )}

          {/* Complexity Indicator */}
          {analysis.contractComplexity && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/60">COMPLEXITY:</span>
              <span className="text-xs font-medium px-2 py-0.5 rounded bg-indigo-900/30 text-indigo-400">
                {analysis.contractComplexity.toUpperCase()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Code Suggestions Section - Only show if available */}
      {analysis.modificationSuggestions && (
        <div className="w-full relative overflow-hidden border border-white/10 rounded-md bg-gradient-to-b from-black/60 to-black/80 backdrop-blur-sm">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-70"></div>

          <div className="p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base font-medium text-white flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-gradient-to-r from-blue-600 to-green-600 flex items-center justify-center">
                  <CheckIcon className="w-3 h-3 text-white" />
                </div>
                Suggested Modifications
              </h3>
              <button
                className="px-2 py-1 bg-white/5 hover:bg-white/10 text-xs text-white/80 hover:text-white border border-white/10 hover:border-white/30 transition-colors flex items-center gap-1 rounded-md"
                onClick={() =>
                  onCopy(analysis.modificationSuggestions, "suggestions")
                }
              >
                {copiedState.suggestions ? (
                  <>
                    <CheckIcon className="w-3 h-3 text-green-500" />
                    <span className="text-green-500">Copied</span>
                  </>
                ) : (
                  <>
                    <Clipboard className="w-3 h-3" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>

            {/* Code Container with line numbers - scrollable horizontally */}
            <div className="rounded-md overflow-hidden border border-white/10">
              <div className="bg-black/50 text-white/90 overflow-x-auto text-sm font-mono leading-5 max-h-64">
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

      {/* Critical & High Issues Section - Collapsible */}
      {(criticalCount > 0 || highCount > 0) && (
        <div className="w-full relative overflow-hidden border border-white/10 rounded-md bg-gradient-to-b from-black/60 to-black/80 backdrop-blur-sm">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-70"></div>

          <div className="p-4">
            <h3 className="text-base font-medium text-white flex items-center gap-2 mb-3">
              <div className="w-5 h-5 rounded-full bg-gradient-to-r from-red-600 to-orange-600 flex items-center justify-center">
                <AlertCircle className="w-3 h-3 text-white" />
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
                    <h4 className="text-red-400 font-medium text-sm">
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
                    <h4 className="text-orange-400 font-medium text-sm">
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
