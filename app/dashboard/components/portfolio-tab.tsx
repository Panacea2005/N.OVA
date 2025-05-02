"use client"

import { useState } from "react"
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  ChevronRight, 
  ExternalLink,
  ArrowRight,
  Filter,
  Download,
  Clock
} from "lucide-react"
import { AreaChart, Area, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface PortfolioTabProps {
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

const PortfolioTab = ({ userData }: PortfolioTabProps) => {
  const [chartPeriod, setChartPeriod] = useState("1W")
  const [activeTab, setActiveTab] = useState("tokens")
  
  // Mock data for portfolio chart
  const portfolioChart = {
    "1D": Array.from({ length: 24 }, (_, i) => ({
      time: `${i}:00`,
      value: 350000 + Math.random() * 20000,
    })),
    "1W": Array.from({ length: 7 }, (_, i) => ({
      time: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i],
      value: 330000 + (i * 5000) + Math.random() * 10000,
    })),
    "1M": Array.from({ length: 30 }, (_, i) => ({
      time: `Day ${i + 1}`,
      value: 300000 + (i * 2000) + Math.random() * 15000,
    })),
    "3M": Array.from({ length: 12 }, (_, i) => ({
      time: `Week ${i + 1}`,
      value: 270000 + (i * 8000) + Math.random() * 20000,
    })),
    "1Y": Array.from({ length: 12 }, (_, i) => ({
      time: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i],
      value: 200000 + (i * 15000) + Math.random() * 25000,
    })),
  }
  
  // Asset allocation data
  const assetAllocation = [
    { name: "NOVA", value: 52.4 },
    { name: "SOL", value: 24.6 },
    { name: "ETH", value: 12.8 },
    { name: "BTC", value: 6.5 },
    { name: "Other", value: 3.7 },
  ]
  
  // Token data
  const tokens = [
    {
      id: "nova",
      name: "NOVA",
      symbol: "NOVA",
      amount: 42589.23,
      value: 188250.72,
      price: 4.42,
      change24h: 5.2,
      chart: Array.from({ length: 24 }, () => 0.9 + Math.random() * 0.2),
    },
    {
      id: "sol",
      name: "Solana",
      symbol: "SOL",
      amount: 462.18,
      value: 88297.62,
      price: 191.07,
      change24h: 8.3,
      chart: Array.from({ length: 24 }, () => 0.9 + Math.random() * 0.2),
    },
    {
      id: "eth",
      name: "Ethereum",
      symbol: "ETH",
      amount: 14.32,
      value: 45937.04,
      price: 3207.82,
      change24h: 2.8,
      chart: Array.from({ length: 24 }, () => 0.9 + Math.random() * 0.2),
    },
    {
      id: "btc",
      name: "Bitcoin",
      symbol: "BTC",
      amount: 0.356,
      value: 23263.58,
      price: 65347.97,
      change24h: -1.2,
      chart: Array.from({ length: 24 }, () => 0.9 + Math.random() * 0.2),
    },
    {
      id: "usdc",
      name: "USD Coin",
      symbol: "USDC",
      amount: 12978.45,
      value: 12978.45,
      price: 1.00,
      change24h: 0.02,
      chart: Array.from({ length: 24 }, () => 0.9 + Math.random() * 0.2),
    },
  ]
  
  // NFT data
  const nfts = [
    {
      id: "1",
      name: "Cosmic Explorer #3429",
      collection: "Cosmic Explorers",
      image: "/placeholder.svg?height=100&width=100",
      value: 45.2,
      currency: "SOL",
      lastPrice: 38.6,
      change: 17.1,
    },
    {
      id: "2",
      name: "NOVA Identity #892",
      collection: "NOVA Identities",
      image: "/placeholder.svg?height=100&width=100",
      value: 24.8,
      currency: "SOL",
      lastPrice: 21.5,
      change: 15.3,
    },
    {
      id: "3",
      name: "Quantum Realm #127",
      collection: "Quantum Realms",
      image: "/placeholder.svg?height=100&width=100",
      value: 12.3,
      currency: "SOL",
      lastPrice: 14.8,
      change: -16.9,
    },
  ]
  
  // Transaction history data
  const transactions = [
    {
      id: "tx1",
      type: "Swap",
      from: "SOL",
      to: "NOVA",
      amount: "2.4 SOL",
      value: "$452.82",
      time: "2 hours ago",
      status: "completed",
    },
    {
      id: "tx2",
      type: "Stake",
      token: "NOVA",
      amount: "1250 NOVA",
      value: "$5,525.00",
      time: "Yesterday",
      status: "completed",
    },
    {
      id: "tx3",
      type: "Unstake",
      token: "SOL",
      amount: "10.5 SOL",
      value: "$1,986.23",
      time: "3 days ago",
      status: "completed",
    },
    {
      id: "tx4",
      type: "Receive",
      token: "ETH",
      amount: "0.85 ETH",
      value: "$2,726.65",
      time: "5 days ago",
      status: "completed",
    },
    {
      id: "tx5",
      type: "Send",
      token: "USDC",
      amount: "500 USDC",
      value: "$500.00",
      time: "1 week ago",
      status: "completed",
    },
  ]
  
  // Staking data
  const stakingData = [
    {
      id: "stake1",
      token: "NOVA",
      amount: 15420.58,
      value: 68160.97,
      apy: 12.8,
      rewards: 214.82,
      rewardsValue: 950.51,
      lockPeriod: "30 days",
      timeLeft: "18 days",
    },
    {
      id: "stake2",
      token: "SOL",
      amount: 85.25,
      value: 16287.74,
      apy: 6.5,
      rewards: 0.32,
      rewardsValue: 61.14,
      lockPeriod: "None",
      timeLeft: "N/A",
    },
  ]
  
  // Calculate total staked value
  const totalStakedValue = stakingData.reduce((total, stake) => total + stake.value, 0)
  const totalPortfolioValue = userData.totalPortfolioValue
  const stakedPercentage = (totalStakedValue / totalPortfolioValue) * 100
  
  const getTokenColor = (change: number) => {
    if (change > 0) return "text-green-400"
    if (change < 0) return "text-red-400"
    return "text-white"
  }
  
  const renderTokenMiniChart = (data: number[]) => {
    const normalizedData = data.map((value, index) => ({
      index,
      value,
    }))
    
    return (
      <div className="h-10 w-24">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={normalizedData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <Line
              type="monotone"
              dataKey="value"
              stroke="#8b5cf6"
              strokeWidth={1.5}
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
      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Portfolio Chart */}
        <div className="lg:col-span-2 bg-black/40 backdrop-blur-xl rounded-xl border border-white/10 p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-bold mb-1">Portfolio Value</h2>
              <div className="text-3xl font-bold">${userData.totalPortfolioValue.toLocaleString()}</div>
              <div className="flex items-center mt-1">
                <span className={`text-sm flex items-center ${userData.portfolioChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {userData.portfolioChange24h >= 0 ? (
                    <TrendingUp className="h-4 w-4 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 mr-1" />
                  )}
                  {userData.portfolioChange24h >= 0 ? '+' : ''}{userData.portfolioChange24h}%
                </span>
                <span className="mx-2 text-white/40">|</span>
                <span className={`text-sm ${userData.portfolioChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {userData.portfolioChange24h >= 0 ? '+' : ''} ${userData.portfolioChangeValue.toLocaleString()}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {["1D", "1W", "1M", "3M", "1Y"].map((period) => (
                <button
                  key={period}
                  className={`px-3 py-1 text-xs rounded-md transition-colors ${
                    chartPeriod === period
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                      : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
                  }`}
                  onClick={() => setChartPeriod(period)}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={portfolioChart[chartPeriod as keyof typeof portfolioChart]}
                margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
              >
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="time" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  width={60}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '0.5rem',
                  }}
                  labelStyle={{ color: '#f3f4f6' }}
                  itemStyle={{ color: '#f3f4f6' }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, 'Value']}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Asset Allocation */}
        <div className="bg-black/40 backdrop-blur-xl rounded-xl border border-white/10 p-6">
          <h2 className="text-lg font-bold mb-4">Asset Allocation</h2>
          
          <div className="h-48 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={assetAllocation}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {assetAllocation.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={
                        index === 0 ? '#8b5cf6' : 
                        index === 1 ? '#3b82f6' : 
                        index === 2 ? '#6366f1' : 
                        index === 3 ? '#ec4899' : 
                        '#10b981'
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
                  formatter={(value) => [`${value}%`, 'Allocation']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="space-y-2">
            {assetAllocation.map((asset, index) => (
              <div key={asset.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ 
                      backgroundColor: 
                        index === 0 ? '#8b5cf6' : 
                        index === 1 ? '#3b82f6' : 
                        index === 2 ? '#6366f1' : 
                        index === 3 ? '#ec4899' : 
                        '#10b981'
                    }}
                  ></div>
                  <span>{asset.name}</span>
                </div>
                <span>{asset.value}%</span>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex justify-between items-center">
              <span className="text-white/70">Total Staked</span>
              <div className="flex flex-col items-end">
                <span className="font-medium">${totalStakedValue.toLocaleString()}</span>
                <span className="text-xs text-white/60">{stakedPercentage.toFixed(1)}% of portfolio</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Assets Tabs */}
      <div className="bg-black/40 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden">
        <div className="border-b border-white/10 px-6 pt-6 pb-0">
          <div className="flex gap-2">
            <button
              className={`px-4 py-2 text-sm font-medium transition-colors rounded-t-lg ${
                activeTab === 'tokens'
                  ? 'text-white border-b-2 border-purple-500'
                  : 'text-white/60 hover:text-white'
              }`}
              onClick={() => setActiveTab('tokens')}
            >
              Tokens
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium transition-colors rounded-t-lg ${
                activeTab === 'nfts'
                  ? 'text-white border-b-2 border-purple-500'
                  : 'text-white/60 hover:text-white'
              }`}
              onClick={() => setActiveTab('nfts')}
            >
              NFTs
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium transition-colors rounded-t-lg ${
                activeTab === 'transactions'
                  ? 'text-white border-b-2 border-purple-500'
                  : 'text-white/60 hover:text-white'
              }`}
              onClick={() => setActiveTab('transactions')}
            >
              Transactions
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium transition-colors rounded-t-lg ${
                activeTab === 'staking'
                  ? 'text-white border-b-2 border-purple-500'
                  : 'text-white/60 hover:text-white'
              }`}
              onClick={() => setActiveTab('staking')}
            >
              Staking
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {activeTab === 'tokens' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">My Tokens</h2>
                <div className="flex gap-2">
                  <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                    <Filter className="h-4 w-4" />
                  </button>
                  <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-white/60">
                      <th className="pb-4 font-normal text-sm">Asset</th>
                      <th className="pb-4 font-normal text-sm">Balance</th>
                      <th className="pb-4 font-normal text-sm">Price</th>
                      <th className="pb-4 font-normal text-sm">Value</th>
                      <th className="pb-4 font-normal text-sm">24h</th>
                      <th className="pb-4 font-normal text-sm text-right">Chart</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tokens.map((token) => (
                      <tr key={token.id} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-xs font-bold">
                              {token.symbol.charAt(0)}
                            </div>
                            <div>
                              <div className="font-medium">{token.name}</div>
                              <div className="text-xs text-white/60">{token.symbol}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="font-medium">{token.amount.toLocaleString()}</div>
                          <div className="text-xs text-white/60">{token.symbol}</div>
                        </td>
                        <td className="py-4">
                          <div className="font-medium">${token.price.toLocaleString()}</div>
                        </td>
                        <td className="py-4">
                          <div className="font-medium">${token.value.toLocaleString()}</div>
                        </td>
                        <td className="py-4">
                          <div className={getTokenColor(token.change24h)}>
                            {token.change24h > 0 ? "+" : ""}{token.change24h}%
                          </div>
                        </td>
                        <td className="py-4 text-right">
                          {renderTokenMiniChart(token.chart)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {activeTab === 'nfts' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold">My NFTs</h2>
                <button className="px-4 py-2 text-sm bg-white/5 hover:bg-white/10 transition-colors rounded-lg">
                  View Gallery
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {nfts.map((nft) => (
                  <div key={nft.id} className="bg-white/5 rounded-xl border border-white/10 overflow-hidden hover:border-white/20 transition-all">
                    <div className="h-40 bg-gradient-to-br from-purple-900/40 to-blue-900/40 flex items-center justify-center">
                      <div className="w-24 h-24 rounded-lg bg-white/10 animate-pulse"></div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium mb-1">{nft.name}</h3>
                      <p className="text-xs text-white/60 mb-3">{nft.collection}</p>
                      
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-xs text-white/60">Current Value</div>
                          <div className="font-medium">{nft.value} {nft.currency}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-white/60">Change</div>
                          <div className={nft.change >= 0 ? 'text-green-400' : 'text-red-400'}>
                            {nft.change >= 0 ? '+' : ''}{nft.change}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {activeTab === 'transactions' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">Transaction History</h2>
                <div className="flex gap-2">
                  <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                    <Filter className="h-4 w-4" />
                  </button>
                  <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-4">
                {transactions.map((tx) => (
                  <div key={tx.id} className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          tx.type === 'Swap' ? 'bg-purple-500/20' :
                          tx.type === 'Stake' ? 'bg-blue-500/20' :
                          tx.type === 'Unstake' ? 'bg-cyan-500/20' :
                          tx.type === 'Receive' ? 'bg-green-500/20' :
                          'bg-red-500/20'
                        }`}>
                          {tx.type === 'Swap' ? (
                            <ArrowRight className="h-5 w-5 text-purple-400" />
                          ) : tx.type === 'Stake' || tx.type === 'Unstake' ? (
                            <Wallet className="h-5 w-5 text-blue-400" />
                          ) : tx.type === 'Receive' ? (
                            <TrendingDown className="h-5 w-5 text-green-400" />
                          ) : (
                            <TrendingUp className="h-5 w-5 text-red-400" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium flex items-center gap-1">
                            {tx.type}
                            {tx.type === 'Swap' && (
                              <span className="text-white/60">
                                {tx.from} → {tx.to}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-white/60">{tx.time}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{tx.amount}</div>
                        <div className="text-xs text-white/60">{tx.value}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-center mt-6">
                <button className="px-4 py-2 text-sm bg-white/5 hover:bg-white/10 transition-colors rounded-lg flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  View All Transactions
                </button>
              </div>
            </div>
          )}
          
          {activeTab === 'staking' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-lg font-bold mb-1">Staking Overview</h2>
                  <p className="text-sm text-white/60">Total staked: ${totalStakedValue.toLocaleString()} ({stakedPercentage.toFixed(1)}% of portfolio)</p>
                </div>
                <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-sm hover:from-purple-500 hover:to-blue-500 transition-all">
                  Stake Tokens
                </button>
              </div>
              
              <div className="space-y-4">
                {stakingData.map((stake) => (
                  <div key={stake.id} className="p-5 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-xs font-bold">
                          {stake.token.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium">{stake.token} Staking</div>
                          <div className="text-xs text-white/60">{stake.lockPeriod} lock • {stake.timeLeft} remaining</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">${stake.value.toLocaleString()}</div>
                        <div className="text-xs text-white/60">{stake.amount.toLocaleString()} {stake.token}</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
                      <div>
                        <div className="text-xs text-white/60 mb-1">APY</div>
                        <div className="font-medium text-green-400">{stake.apy}%</div>
                      </div>
                      <div>
                        <div className="text-xs text-white/60 mb-1">Rewards</div>
                        <div className="font-medium">{stake.rewards} {stake.token}</div>
                      </div>
                      <div>
                        <div className="text-xs text-white/60 mb-1">Value</div>
                        <div className="font-medium">${stake.rewardsValue.toLocaleString()}</div>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-white/10 flex justify-end gap-2">
                      <button className="px-3 py-1.5 bg-white/10 text-sm rounded-lg hover:bg-white/20 transition-colors">
                        Claim Rewards
                      </button>
                      <button className="px-3 py-1.5 bg-white/10 text-sm rounded-lg hover:bg-white/20 transition-colors">
                        Unstake
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PortfolioTab