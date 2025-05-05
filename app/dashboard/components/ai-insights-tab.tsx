"use client"

import { useState } from "react"
import { 
  Sparkles, 
  TrendingUp, 
  TrendingDown,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
  ChevronRight,
  BarChart3,
  Shield,
  Brain,
  ArrowUpRight,
  Zap,
  Target,
  ArrowRight
} from "lucide-react"
import { AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

interface AIInsightsTabProps {
  userData: {
    name: string
    wallet: string
    totalPortfolioValue: number
    portfolioChange24h: number
    portfolioChangeValue: number
    identityScore: number
    notifications: number
    level: string
    tier: string
    verified: boolean
  }
}

const AIInsightsTab = ({ userData }: AIInsightsTabProps) => {
  const [timeframe, setTimeframe] = useState("1M")
  
  // Mock AI insights
  const aiInsights = [
    {
      id: "insight1",
      title: "Portfolio Diversification",
      description: "Your portfolio is heavily weighted towards NOVA tokens (52%). Consider diversifying to reduce risk. Based on your profile, adding exposure to Layer 1 tokens like ETH or SOL could provide better stability.",
      severity: "medium",
      actionable: true,
      category: "Risk Management",
      timestamp: "1h ago",
    },
    {
      id: "insight2",
      title: "Market Opportunity",
      description: "SOL is showing strong momentum with increasing on-chain activity and developer growth. Technical indicators suggest a potential continuation of the uptrend. Consider a dollar-cost-average strategy over the next 4 weeks.",
      severity: "low",
      actionable: true,
      category: "Trading Opportunity",
      timestamp: "3h ago",
    },
    {
      id: "insight3",
      title: "Identity Score Improvement",
      description: "Verify your email and complete KYC to boost your identity score by 10 points. This will unlock Premium tier features including reduced trading fees and higher staking rewards.",
      severity: "high",
      actionable: true,
      category: "Account Optimization",
      timestamp: "5h ago",
    },
    {
      id: "insight4",
      title: "Token Correlation Alert",
      description: "High correlation detected between your SOL and NOVA holdings (0.85). During market downturns, this could amplify portfolio volatility. Consider hedging with uncorrelated assets like BTC or stablecoins.",
      severity: "medium",
      actionable: true,
      category: "Risk Management",
      timestamp: "Yesterday",
    },
    {
      id: "insight5",
      title: "Governance Participation",
      description: "Three active governance proposals in projects you hold (NOVA, SOL, ETH) are ending within 48 hours. Your voting power could influence protocol decisions and earn you reputation points.",
      severity: "low",
      actionable: true,
      category: "Governance",
      timestamp: "Yesterday",
    },
    {
      id: "insight6",
      title: "Fee Optimization",
      description: "You've spent 32.5 SOL on transaction fees in the last month. Switching to priority fee mode and batching transactions could save approximately 40% on future transactions.",
      severity: "medium",
      actionable: true,
      category: "Cost Saving",
      timestamp: "2d ago",
    },
  ]
  
  // Mock identity evolution data
  const identityEvolution = {
    currentScore: userData.identityScore,
    history: [
      { date: "Jan", score: 45 },
      { date: "Feb", score: 58 },
      { date: "Mar", score: 72 },
      { date: "Apr", score: 87 },
    ],
    nextMilestone: 90,
    nextReward: "Advanced Staking Pools",
    improvements: [
      { task: "Complete KYC verification", points: 10, status: "pending" },
      { task: "Link social accounts", points: 5, status: "completed" },
      { task: "Verify email address", points: 3, status: "completed" },
      { task: "Create recovery phrase", points: 8, status: "pending" },
      { task: "Enable 2FA", points: 5, status: "completed" },
    ],
    tiers: [
      { name: "Bronze", threshold: 30, unlocked: true },
      { name: "Silver", threshold: 50, unlocked: true },
      { name: "Gold", threshold: 70, unlocked: true },
      { name: "Platinum", threshold: 90, unlocked: false },
      { name: "Diamond", threshold: 95, unlocked: false },
    ],
  }
  
  // Mock market prediction data
  const marketPredictions = {
    shortTerm: [
      { asset: "BTC", prediction: 5.2, confidence: 72 },
      { asset: "ETH", prediction: 8.7, confidence: 68 },
      { asset: "SOL", prediction: 12.4, confidence: 65 },
      { asset: "NOVA", prediction: 15.8, confidence: 62 },
    ],
    mediumTerm: [
      { asset: "BTC", prediction: 12.5, confidence: 58 },
      { asset: "ETH", prediction: 18.3, confidence: 55 },
      { asset: "SOL", prediction: 25.7, confidence: 52 },
      { asset: "NOVA", prediction: 32.1, confidence: 48 },
    ],
    longTerm: [
      { asset: "BTC", prediction: 35.8, confidence: 45 },
      { asset: "ETH", prediction: 42.5, confidence: 42 },
      { asset: "SOL", prediction: 78.3, confidence: 38 },
      { asset: "NOVA", prediction: 95.2, confidence: 35 },
    ],
    sentimentData: [
      { name: "Very Bullish", value: 32 },
      { name: "Bullish", value: 45 },
      { name: "Neutral", value: 15 },
      { name: "Bearish", value: 6 },
      { name: "Very Bearish", value: 2 },
    ],
    fearGreedIndex: 72,
    fearGreedHistory: [
      { date: "Week 1", value: 45 },
      { date: "Week 2", value: 52 },
      { date: "Week 3", value: 58 },
      { date: "Week 4", value: 65 },
      { date: "Week 5", value: 72 },
    ],
  }
  
  // Mock portfolio analysis
  const portfolioAnalysis = {
    risk: 65, // 0-100 scale
    volatility: 38, // 0-100 scale
    diversification: 42, // 0-100 scale
    performance: [
      { date: "Week 1", value: 100 },
      { date: "Week 2", value: 108 },
      { date: "Week 3", value: 103 },
      { date: "Week 4", value: 112 },
      { date: "Week 5", value: 125 },
      { date: "Week 6", value: 118 },
      { date: "Week 7", value: 132 },
      { date: "Week 8", value: 146 },
    ],
    sectorExposure: [
      { name: "DeFi", value: 35 },
      { name: "Infrastructure", value: 25 },
      { name: "NFTs", value: 15 },
      { name: "Gaming", value: 10 },
      { name: "Identity", value: 15 },
    ],
    riskFactors: [
      { factor: "Token Concentration", severity: "High" },
      { factor: "Market Volatility", severity: "Medium" },
      { factor: "Regulatory Exposure", severity: "Low" },
      { factor: "Protocol Risk", severity: "Medium" },
    ],
  }
  
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "high":
        return <AlertCircle size={18} className="text-red-400" />
      case "medium":
        return <Info size={18} className="text-yellow-400" />
      case "low":
        return <CheckCircle size={18} className="text-green-400" />
      default:
        return <Info size={18} className="text-blue-400" />
    }
  }
  
  const getSeverityClass = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "low":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      default:
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
    }
  }
  
  return (
    <div className="space-y-6">
      {/* AI Insights Section */}
      <div className="bg-black/40 backdrop-blur-xl rounded-xl border border-white/10 p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-purple-400" />
            <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
              AI Market Insights
            </h2>
          </div>
          <button className="px-3 py-1 text-xs bg-white/10 rounded-md hover:bg-white/20 transition-colors flex items-center gap-1">
            <TrendingUp size={12} /> Refresh
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border border-white/10 rounded-lg p-4 bg-gradient-to-br from-green-900/10 to-black/60">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle size={18} className="text-green-400" />
              <h3 className="font-bold">Bullish Signals</h3>
            </div>
            <p className="text-sm text-white/80 mb-4">
              BTC has formed a golden cross on the daily chart, historically a strong bullish indicator. ETH and SOL are showing positive momentum with increasing volume.
            </p>
            <div className="flex justify-between items-center">
              <span className="text-xs text-white/60">Updated 12 min ago</span>
              <button className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
                Learn More
              </button>
            </div>
          </div>

          <div className="border border-white/10 rounded-lg p-4 bg-gradient-to-br from-yellow-900/10 to-black/60">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle size={18} className="text-yellow-400" />
              <h3 className="font-bold">Market Sentiment</h3>
            </div>
            <p className="text-sm text-white/80 mb-4">
              Social sentiment analysis shows increasing positive mentions for NOVA and SOL. Twitter activity for crypto topics is up 23% this week.
            </p>
            <div className="flex justify-between items-center">
              <span className="text-xs text-white/60">Updated 27 min ago</span>
              <button className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
                Learn More
              </button>
            </div>
          </div>

          <div className="border border-white/10 rounded-lg p-4 bg-gradient-to-br from-red-900/10 to-black/60">
            <div className="flex items-center gap-2 mb-3">
              <XCircle size={18} className="text-red-400" />
              <h3 className="font-bold">Risk Factors</h3>
            </div>
            <p className="text-sm text-white/80 mb-4">
              Regulatory concerns in major markets could impact short-term price action. Watch for increased volatility around the upcoming Fed meeting.
            </p>
            <div className="flex justify-between items-center">
              <span className="text-xs text-white/60">Updated 45 min ago</span>
              <button className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Personal AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-black/40 backdrop-blur-xl rounded-xl border border-white/10 p-6">
          <h2 className="text-lg font-bold mb-6">Personalized Insights</h2>
          
          <div className="space-y-4">
            {aiInsights.slice(0, 4).map((insight) => (
              <div 
                key={insight.id}
                className={`p-4 rounded-xl border ${getSeverityClass(insight.severity)}`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-white/10">
                    {getSeverityIcon(insight.severity)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold mb-1">{insight.title}</h3>
                    <p className="text-sm text-white/80 mb-3">{insight.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-white/60">
                        <span>{insight.category}</span>
                        <span>•</span>
                        <span>{insight.timestamp}</span>
                      </div>
                      {insight.actionable && (
                        <button className="px-3 py-1.5 bg-white/10 rounded-lg text-xs hover:bg-white/20 transition-colors">
                          Take Action
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 text-center">
            <button className="px-4 py-2 bg-white/10 text-white/80 rounded-lg text-sm hover:bg-white/20 transition-colors">
              View All Insights
            </button>
          </div>
        </div>
        
        <div className="bg-black/40 backdrop-blur-xl rounded-xl border border-white/10 p-6">
          <h2 className="text-lg font-bold mb-4">Market Predictions</h2>
          
          <div className="flex justify-between items-center mb-4">
            <div className="flex space-x-1">
              <button
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  timeframe === "1W"
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                    : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
                }`}
                onClick={() => setTimeframe("1W")}
              >
                Short Term
              </button>
              <button
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  timeframe === "1M"
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                    : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
                }`}
                onClick={() => setTimeframe("1M")}
              >
                Medium Term
              </button>
              <button
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  timeframe === "3M"
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                    : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
                }`}
                onClick={() => setTimeframe("3M")}
              >
                Long Term
              </button>
            </div>
          </div>
          
          <div className="mb-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-white/60">
                    <th className="pb-2 font-normal text-sm">Asset</th>
                    <th className="pb-2 font-normal text-sm">Prediction</th>
                    <th className="pb-2 font-normal text-sm">Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {(timeframe === "1W" ? marketPredictions.shortTerm : 
                    timeframe === "1M" ? marketPredictions.mediumTerm : 
                    marketPredictions.longTerm).map((item, idx) => (
                    <tr key={idx} className="border-t border-white/5">
                      <td className="py-3">{item.asset}</td>
                      <td className="py-3 text-green-400">+{item.prediction}%</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-yellow-500 to-green-500"
                              style={{ width: `${item.confidence}%` }}
                            ></div>
                          </div>
                          <span className="text-xs">{item.confidence}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm">Market Sentiment</span>
            <span className="text-sm">Fear & Greed: <span className="text-green-400">{marketPredictions.fearGreedIndex}/100</span></span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={marketPredictions.sentimentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={50}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {marketPredictions.sentimentData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={
                          index === 0 ? '#10b981' : 
                          index === 1 ? '#34d399' : 
                          index === 2 ? '#6366f1' : 
                          index === 3 ? '#f87171' : 
                          '#ef4444'
                        } 
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '0.5rem',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={marketPredictions.fearGreedHistory}
                  margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
                >
                  <XAxis 
                    dataKey="date" 
                    tick={{ fill: '#9ca3af', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
      
      {/* Identity Evolution Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-black/40 backdrop-blur-xl rounded-xl border border-white/10 p-6">
          <h2 className="text-lg font-bold mb-6">Identity Evolution</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-2xl font-bold mb-2">
                  {identityEvolution.currentScore}
                </div>
                <div className="font-medium">Identity Score</div>
                <div className="text-xs text-white/60 mt-1">Level: {userData.level}</div>
                <div className="mt-2 w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
                    style={{ width: `${identityEvolution.currentScore}%` }}
                  ></div>
                </div>
                <div className="text-xs text-white/60 mt-1">
                  {identityEvolution.nextMilestone - identityEvolution.currentScore} points to next level
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="text-sm font-medium mb-2">Next Milestone</div>
              <div className="flex items-center gap-2 mb-1">
                <Target className="h-4 w-4 text-purple-400" />
                <span>{identityEvolution.nextMilestone} Points</span>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <Zap className="h-4 w-4 text-purple-400" />
                <span>Unlocks: {identityEvolution.nextReward}</span>
              </div>
              
              <div className="text-sm font-medium mb-2">Current Tier</div>
              <div className="space-y-1">
                {identityEvolution.tiers.map((tier, idx) => (
                  <div 
                    key={idx} 
                    className={`text-xs py-0.5 px-2 rounded-full inline-block mr-2 ${
                      tier.unlocked ? 'bg-purple-500/20 text-purple-400' : 'bg-white/10 text-white/60'
                    }`}
                  >
                    {tier.name} ({tier.threshold})
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="text-sm font-medium mb-2">Score History</div>
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={identityEvolution.history}
                    margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
                  >
                    <XAxis 
                      dataKey="date" 
                      tick={{ fill: '#9ca3af', fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      tick={{ fill: '#9ca3af', fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      domain={[0, 100]}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#8b5cf6" 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Score Improvements</h3>
              <button className="text-xs text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1">
                View All <ChevronRight className="h-3 w-3" />
              </button>
            </div>
            
            <div className="space-y-3">
              {identityEvolution.improvements.map((improvement, idx) => (
                <div 
                  key={idx}
                  className="p-3 bg-white/5 rounded-lg border border-white/10 flex justify-between items-center"
                >
                  <div className="flex items-center gap-2">
                    {improvement.status === "completed" ? (
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    ) : (
                      <ArrowRight className="h-4 w-4 text-yellow-400" />
                    )}
                    <span>{improvement.task}</span>
                  </div>
                  <div className={`text-sm ${improvement.status === "completed" ? 'text-green-400' : 'text-yellow-400'}`}>
                    +{improvement.points} pts
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="bg-black/40 backdrop-blur-xl rounded-xl border border-white/10 p-6">
          <h2 className="text-lg font-bold mb-4">Portfolio Risk Analysis</h2>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-white/70">Risk Score</span>
                <span className="font-medium">{portfolioAnalysis.risk}/100</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
                  style={{ width: `${portfolioAnalysis.risk}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-white/70">Portfolio Volatility</span>
                <span className="font-medium">{portfolioAnalysis.volatility}/100</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
                  style={{ width: `${portfolioAnalysis.volatility}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-white/70">Diversification</span>
                <span className="font-medium">{portfolioAnalysis.diversification}/100</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
                  style={{ width: `${portfolioAnalysis.diversification}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="text-sm font-medium mb-2">Sector Exposure</div>
              <div className="space-y-2">
                {portfolioAnalysis.sectorExposure.map((sector, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="text-sm">{sector.name}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
                          style={{ width: `${sector.value}%` }}
                        ></div>
                      </div>
                      <span className="text-xs">{sector.value}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <div className="text-sm font-medium mb-2">Risk Factors</div>
              <div className="space-y-2">
                {portfolioAnalysis.riskFactors.map((factor, idx) => (
                  <div 
                    key={idx}
                    className="p-2 bg-white/5 rounded-lg border border-white/10 flex justify-between items-center"
                  >
                    <span className="text-sm">{factor.factor}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      factor.severity === "High" ? "bg-red-500/20 text-red-400" :
                      factor.severity === "Medium" ? "bg-yellow-500/20 text-yellow-400" :
                      "bg-green-500/20 text-green-400"
                    }`}>
                      {factor.severity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* AI Trading Assistant */}
      <div className="bg-black/40 backdrop-blur-xl rounded-xl border border-white/10 p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Brain className="h-6 w-6 text-purple-400" />
            <h2 className="text-xl font-bold">AI Trading Assistant</h2>
          </div>
          <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-sm hover:from-purple-500 hover:to-blue-500 transition-all">
            Get Started
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-white/5 rounded-lg">
            <BarChart3 className="h-6 w-6 text-purple-400 mb-2" />
            <h4 className="font-medium mb-1">Market Analysis</h4>
            <p className="text-sm text-white/70">Get real-time AI-powered market analysis based on on-chain data and technical indicators.</p>
          </div>
          <div className="p-4 bg-white/5 rounded-lg">
            <Shield className="h-6 w-6 text-purple-400 mb-2" />
            <h4 className="font-medium mb-1">Risk Management</h4>
            <p className="text-sm text-white/70">Receive personalized risk management strategies and portfolio optimization recommendations.</p>
          </div>
          <div className="p-4 bg-white/5 rounded-lg">
            <Sparkles className="h-6 w-6 text-purple-400 mb-2" />
            <h4 className="font-medium mb-1">Trading Suggestions</h4>
            <p className="text-sm text-white/70">Get AI-generated trading ideas with entry/exit points and risk/reward ratios.</p>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <button className="px-4 py-2 bg-white/10 text-white/80 rounded-lg text-sm hover:bg-white/20 transition-colors flex items-center gap-2 mx-auto">
            <ArrowUpRight className="h-4 w-4" />
            Learn More About AI Trading Features
          </button>
        </div>
      </div>
    </div>
  )
}

export default AIInsightsTab