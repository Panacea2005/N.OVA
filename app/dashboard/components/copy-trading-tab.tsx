"use client"

import { useState } from "react"
import { 
  Users, 
  TrendingUp, 
  Filter, 
  Wallet,
  ChevronRight,
  ArrowUpRight,
  BarChart,
  Clock,
  Check
} from "lucide-react"
import { LineChart, Line, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface CopyTradingTabProps {
  walletConnected: boolean
  handleConnectWallet: () => void
}

const CopyTradingTab = ({ walletConnected, handleConnectWallet }: CopyTradingTabProps) => {
  const [timeframe, setTimeframe] = useState("1W")
  const [sortBy, setSortBy] = useState("roi")
  
  // Mock top traders data
  const copyTradingData = [
    {
      id: "trader1",
      name: "AlphaTrader",
      avatar: "/placeholder.svg?height=100&width=100",
      roi: 127.5,
      followers: 1245,
      trades: 342,
      winRate: 68,
      following: false,
      performance: [45, 48, 52, 49, 53, 57, 60, 58, 62, 65],
      description: "DeFi specialist focusing on market neutral strategies with 3+ years of on-chain trading.",
      topTrades: [
        { token: "SOL", profit: 32.5, timeAgo: "2d" },
        { token: "ETH", profit: 18.7, timeAgo: "5d" },
        { token: "NOVA", profit: 42.3, timeAgo: "1w" },
      ],
      activity: "Very Active",
      risk: "Medium",
    },
    {
      id: "trader2",
      name: "CryptoQueen",
      avatar: "/placeholder.svg?height=100&width=100",
      roi: 94.2,
      followers: 876,
      trades: 215,
      winRate: 72,
      following: true,
      performance: [30, 35, 32, 38, 42, 45, 43, 48, 52, 55],
      description: "Technical analyst & swing trader. Specializing in altcoin discovery and momentum plays.",
      topTrades: [
        { token: "NOVA", profit: 52.8, timeAgo: "3d" },
        { token: "SOL", profit: 24.3, timeAgo: "1w" },
        { token: "BONK", profit: 78.5, timeAgo: "2w" },
      ],
      activity: "Active",
      risk: "High",
    },
    {
      id: "trader3",
      name: "SolanaWhale",
      avatar: "/placeholder.svg?height=100&width=100",
      roi: 83.7,
      followers: 654,
      trades: 187,
      winRate: 65,
      following: false,
      performance: [40, 38, 42, 45, 43, 47, 50, 48, 52, 54],
      description: "Solana ecosystem expert. Long-term holder with strategic entry/exit. Focused on quality projects.",
      topTrades: [
        { token: "JTO", profit: 63.2, timeAgo: "4d" },
        { token: "BONK", profit: 85.7, timeAgo: "2w" },
        { token: "PYTH", profit: 32.1, timeAgo: "3w" },
      ],
      activity: "Moderate",
      risk: "Medium",
    },
    {
      id: "trader4",
      name: "DegenMaster",
      avatar: "/placeholder.svg?height=100&width=100",
      roi: 215.3,
      followers: 2341,
      trades: 567,
      winRate: 58,
      following: false,
      performance: [20, 35, 30, 45, 40, 60, 55, 70, 65, 80],
      description: "High-risk, high-reward trader. Specializes in IDOs, microcaps, and short-term momentum trading.",
      topTrades: [
        { token: "CYBER", profit: 142.5, timeAgo: "1d" },
        { token: "BONK", profit: 215.8, timeAgo: "1w" },
        { token: "MEME", profit: 187.3, timeAgo: "2w" },
      ],
      activity: "Very Active",
      risk: "Very High",
    },
    {
      id: "trader5",
      name: "MacroView",
      avatar: "/placeholder.svg?height=100&width=100",
      roi: 67.8,
      followers: 1876,
      trades: 124,
      winRate: 82,
      following: false,
      performance: [35, 38, 42, 45, 48, 52, 56, 58, 62, 64],
      description: "Macro-focused trader with emphasis on fundamentals. Primarily trades large caps with long time horizons.",
      topTrades: [
        { token: "BTC", profit: 28.5, timeAgo: "2w" },
        { token: "ETH", profit: 35.2, timeAgo: "1m" },
        { token: "SOL", profit: 52.7, timeAgo: "3m" },
      ],
      activity: "Less Active",
      risk: "Low",
    },
  ]
  
  // Sort traders based on selected sort criteria
  const sortedTraders = [...copyTradingData].sort((a, b) => {
    switch (sortBy) {
      case "roi":
        return b.roi - a.roi
      case "followers":
        return b.followers - a.followers
      case "winRate":
        return b.winRate - a.winRate
      case "trades":
        return b.trades - a.trades
      default:
        return b.roi - a.roi
    }
  })
  
  // Mock user's copied traders stats
  const userCopyStats = {
    totalCopied: 2,
    totalValue: 4325.62,
    totalProfit: 783.45,
    profitPercent: 22.1,
    allocation: [
      { trader: "CryptoQueen", value: 2845.32, percent: 65.8 },
      { trader: "MacroView", value: 1480.30, percent: 34.2 },
    ],
    tradeHistory: [
      { date: "2025-04-28", token: "NOVA", type: "Buy", amount: 245, price: 4.82, status: "completed", profit: null },
      { date: "2025-04-25", token: "SOL", type: "Sell", amount: 3.5, price: 187.32, status: "completed", profit: 12.8 },
      { date: "2025-04-20", token: "ETH", type: "Buy", amount: 0.35, price: 3178.45, status: "completed", profit: null },
      { date: "2025-04-15", token: "BTC", type: "Sell", amount: 0.025, price: 65321.78, status: "completed", profit: 7.2 },
      { date: "2025-04-10", token: "NOVA", type: "Sell", amount: 580, price: 3.95, status: "completed", profit: 32.5 },
    ],
    performanceData: [
      { date: "Week 1", value: 100 },
      { date: "Week 2", value: 105 },
      { date: "Week 3", value: 103 },
      { date: "Week 4", value: 112 },
      { date: "Week 5", value: 108 },
      { date: "Week 6", value: 115 },
      { date: "Week 7", value: 122 },
    ],
  }
  
  // Get risk color
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Very High":
        return "text-red-400 bg-red-500/20"
      case "High":
        return "text-orange-400 bg-orange-500/20"
      case "Medium":
        return "text-yellow-400 bg-yellow-500/20"
      case "Low":
        return "text-green-400 bg-green-500/20"
      default:
        return "text-white/70 bg-white/10"
    }
  }
  
  // Render mini performance chart
  const renderPerformanceChart = (data: number[]) => {
    const chartData = data.map((value, index) => ({
      index,
      value,
    }))
    
    return (
      <div className="h-12">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="gradientPerformance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Line
              type="monotone"
              dataKey="value"
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* Top section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main traders list */}
        <div className="lg:col-span-2">
          <div className="bg-black/40 backdrop-blur-xl rounded-xl border border-white/10 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
                Top Traders
              </h2>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-white/70">Sort by:</span>
                  <select
                    className="bg-white/5 border border-white/10 rounded-lg text-sm p-2"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="roi">ROI</option>
                    <option value="followers">Followers</option>
                    <option value="winRate">Win Rate</option>
                    <option value="trades">Trades</option>
                  </select>
                </div>
                <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <Filter className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="space-y-4">
              {sortedTraders.map((trader) => (
                <div 
                  key={trader.id}
                  className="p-5 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300"
                >
                  <div className="flex justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-lg font-bold">
                        {trader.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{trader.name}</h3>
                        <div className="flex items-center text-sm text-white/60">
                          <span>{trader.followers} followers</span>
                          <span className="mx-1">•</span>
                          <span>{trader.trades} trades</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-400">+{trader.roi}%</div>
                      <div className="text-sm text-white/60">90-day ROI</div>
                    </div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-4 gap-4">
                    <div className="col-span-2 space-y-1">
                      <p className="text-sm text-white/80">{trader.description}</p>
                      <div className="flex items-center gap-2 text-xs">
                        <span className={`px-2 py-0.5 rounded-full ${getRiskColor(trader.risk)}`}>
                          {trader.risk} Risk
                        </span>
                        <span className="text-white/60">•</span>
                        <span className="text-white/60">{trader.activity}</span>
                      </div>
                    </div>
                    
                    <div className="col-span-1">
                      <div className="text-sm mb-1">Top Profit</div>
                      <div className="space-y-1">
                        {trader.topTrades.slice(0, 1).map((trade, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs">
                            <span>{trade.token}</span>
                            <span className="text-green-400">+{trade.profit}%</span>
                          </div>
                        ))}
                      </div>
                      <div className="text-xs text-white/60 mt-1">Win Rate: {trader.winRate}%</div>
                    </div>
                    
                    <div className="flex flex-col justify-between">
                      <div>
                        {renderPerformanceChart(trader.performance)}
                      </div>
                      {trader.following ? (
                        <button className="px-4 py-1.5 bg-purple-500/20 border border-purple-500/30 text-purple-400 rounded-lg text-sm hover:bg-purple-500/30 transition-colors w-full">
                          Following
                        </button>
                      ) : (
                        <button className="px-4 py-1.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-sm hover:from-purple-500 hover:to-blue-500 transition-all w-full">
                          Follow
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 text-center">
              <button className="px-4 py-2 bg-white/10 text-white/80 rounded-lg text-sm hover:bg-white/20 transition-colors flex items-center gap-2 mx-auto">
                <Users className="h-4 w-4" />
                View All Traders
              </button>
            </div>
          </div>
        </div>
        
        {/* Copy trading stats */}
        <div className="space-y-6">
          {walletConnected ? (
            <>
              <div className="bg-black/40 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                <h2 className="text-lg font-bold mb-4">My Copy Trading</h2>
                <div className="space-y-4">
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-white/60">Total Value</div>
                        <div className="font-medium">${userCopyStats.totalValue.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-xs text-white/60">Total Profit</div>
                        <div className="font-medium text-green-400">
                          +${userCopyStats.totalProfit.toLocaleString()} ({userCopyStats.profitPercent}%)
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-white/60">Traders Copied</div>
                        <div className="font-medium">{userCopyStats.totalCopied}</div>
                      </div>
                      <div>
                        <div className="text-xs text-white/60">Trades Copied</div>
                        <div className="font-medium">{userCopyStats.tradeHistory.length}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium mb-2">Allocation</div>
                    <div className="space-y-2">
                      {userCopyStats.allocation.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <span>{item.trader}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
                                style={{ width: `${item.percent}%` }}
                              ></div>
                            </div>
                            <span className="text-xs">{item.percent}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <button className="w-full py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-sm hover:from-purple-500 hover:to-blue-500 transition-all">
                    Manage Allocations
                  </button>
                </div>
              </div>
              
              <div className="bg-black/40 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                <h2 className="text-lg font-bold mb-4">Performance</h2>
                <div className="h-36 mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart
                      data={userCopyStats.performanceData}
                      margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
                    >
                      <XAxis 
                        dataKey="date" 
                        tick={{ fill: '#9ca3af', fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(0, 0, 0, 0.8)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: '0.5rem',
                        }}
                        labelStyle={{ color: '#f3f4f6' }}
                        itemStyle={{ color: '#f3f4f6' }}
                      />
                      <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#8b5cf6" />
                          <stop offset="100%" stopColor="#4f46e5" />
                        </linearGradient>
                      </defs>
                      <Bar 
                        dataKey="value" 
                        fill="url(#barGradient)" 
                        radius={[4, 4, 0, 0]} 
                      />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-between text-sm">
                  <div>
                    <div className="text-white/60">Starting Value</div>
                    <div className="font-medium">100</div>
                  </div>
                  <div>
                    <div className="text-white/60">Current Value</div>
                    <div className="font-medium">122</div>
                  </div>
                  <div>
                    <div className="text-white/60">Change</div>
                    <div className="font-medium text-green-400">+22%</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-black/40 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold">Recent Trades</h2>
                  <button className="text-xs text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1">
                    View All <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
                <div className="space-y-2">
                  {userCopyStats.tradeHistory.slice(0, 3).map((trade, idx) => (
                    <div key={idx} className="p-2 bg-white/5 rounded-lg border border-white/10 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${trade.type === 'Buy' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                          {trade.type === 'Buy' ? 'B' : 'S'}
                        </div>
                        <div>
                          <div className="text-sm font-medium">{trade.token}</div>
                          <div className="text-xs text-white/60">{new Date(trade.date).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm">{trade.amount} @ ${trade.price}</div>
                        {trade.profit !== null && (
                          <div className="text-xs text-green-400">+{trade.profit}%</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-black/40 backdrop-blur-xl rounded-xl border border-white/10 p-6">
              <div className="py-10 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                  <Users className="h-8 w-8" />
                </div>
                <h2 className="text-xl font-bold mb-2">Start Copy Trading</h2>
                <p className="text-white/70 mb-6 max-w-sm mx-auto">
                  Connect your wallet to start copy trading and automatically mirror the trades of successful traders.
                </p>
                <button 
                  onClick={handleConnectWallet}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg font-medium hover:from-purple-500 hover:to-blue-500 transition-all"
                >
                  Connect Wallet
                </button>
              </div>
              
              <div className="mt-8 pt-8 border-t border-white/10">
                <h3 className="font-medium mb-4">Why Copy Trade?</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-white/5 rounded-lg">
                    <BarChart className="h-6 w-6 text-purple-400 mb-2" />
                    <h4 className="font-medium mb-1">Follow Top Performers</h4>
                    <p className="text-sm text-white/70">Mirror the strategies of verified traders with proven track records.</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-lg">
                    <Clock className="h-6 w-6 text-purple-400 mb-2" />
                    <h4 className="font-medium mb-1">Save Time</h4>
                    <p className="text-sm text-white/70">Trade automatically without constantly monitoring the markets.</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-lg">
                    <Check className="h-6 w-6 text-purple-400 mb-2" />
                    <h4 className="font-medium mb-1">Risk Management</h4>
                    <p className="text-sm text-white/70">Set limits and controls to manage exposure and protect your portfolio.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* How it works section */}
      <div className="bg-black/40 backdrop-blur-xl rounded-xl border border-white/10 p-6">
        <h2 className="text-xl font-bold mb-6">How Copy Trading Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-4 bg-white/5 rounded-lg border border-white/10 relative">
            <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center text-sm font-bold">
              1
            </div>
            <h3 className="font-medium mb-2 mt-2">Choose Traders</h3>
            <p className="text-sm text-white/70">Select top-performing traders based on ROI, win rate, and risk profile.</p>
          </div>
          <div className="p-4 bg-white/5 rounded-lg border border-white/10 relative">
            <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center text-sm font-bold">
              2
            </div>
            <h3 className="font-medium mb-2 mt-2">Allocate Funds</h3>
            <p className="text-sm text-white/70">Decide how much of your portfolio to allocate to each trader.</p>
          </div>
          <div className="p-4 bg-white/5 rounded-lg border border-white/10 relative">
            <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center text-sm font-bold">
              3
            </div>
            <h3 className="font-medium mb-2 mt-2">Set Parameters</h3>
            <p className="text-sm text-white/70">Configure risk limits, asset types, and other trading preferences.</p>
          </div>
          <div className="p-4 bg-white/5 rounded-lg border border-white/10 relative">
            <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center text-sm font-bold">
              4
            </div>
            <h3 className="font-medium mb-2 mt-2">Automatic Trading</h3>
            <p className="text-sm text-white/70">The platform automatically mirrors selected traders' moves in real-time.</p>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <button className="px-4 py-2 bg-white/10 text-white/80 rounded-lg text-sm hover:bg-white/20 transition-colors flex items-center gap-2 mx-auto">
            <ArrowUpRight className="h-4 w-4" />
            Learn More About Copy Trading
          </button>
        </div>
      </div>
    </div>
  )
}

export default CopyTradingTab