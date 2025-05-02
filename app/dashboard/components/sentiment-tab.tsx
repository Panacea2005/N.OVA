"use client"

import { useState } from "react"
import { 
  MessageCircle, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown,
  Filter,
  Calendar,
  Twitter,
  Globe,
  MessageSquare,
  Send
} from "lucide-react"
import { AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const SentimentTab = () => {
  const [selectedFeed, setSelectedFeed] = useState("all")
  const [timeframe, setTimeframe] = useState("24h")
  
  // Mock sentiment data
  const sentimentData = [
    {
      id: "sent1",
      source: "Twitter",
      sourceIcon: <Twitter className="h-4 w-4" />,
      author: "CryptoVisionary",
      authorImage: "/placeholder.svg?height=48&width=48",
      content: "NOVA's new identity verification system is revolutionary. Bullish on $NOVA! #Web3Identity",
      time: "2h ago",
      sentiment: "positive",
      likes: 245,
      shares: 87,
    },
    {
      id: "sent2",
      source: "Reddit",
      sourceIcon: <MessageSquare className="h-4 w-4" />,
      author: "web3_enthusiast",
      authorImage: "/placeholder.svg?height=48&width=48",
      content: "Just tried the NOVA platform. The UX is smooth but there are still some bugs in the trading module.",
      time: "5h ago",
      sentiment: "neutral",
      likes: 32,
      shares: 4,
    },
    {
      id: "sent3",
      source: "Discord",
      sourceIcon: <MessageCircle className="h-4 w-4" />,
      author: "NOVAbeliever",
      authorImage: "/placeholder.svg?height=48&width=48",
      content: "The team just announced a major partnership with a top exchange! This could be huge for adoption.",
      time: "1d ago",
      sentiment: "positive",
      likes: 189,
      shares: 56,
    },
    {
      id: "sent4",
      source: "Telegram",
      sourceIcon: <Send className="h-4 w-4" />,
      author: "TokenAnalyst",
      authorImage: "/placeholder.svg?height=48&width=48",
      content: "Market is down but NOVA is holding strong. The identity utility is creating real demand.",
      time: "2d ago",
      sentiment: "positive",
      likes: 78,
      shares: 23,
    },
    {
      id: "sent5",
      source: "Twitter",
      sourceIcon: <Twitter className="h-4 w-4" />,
      author: "CryptoSkeptic",
      authorImage: "/placeholder.svg?height=48&width=48",
      content: "Too many identity projects in this space already. What makes NOVA different? Seems overhyped to me. #CryptoReality",
      time: "6h ago",
      sentiment: "negative",
      likes: 53,
      shares: 12,
    },
    {
      id: "sent6",
      source: "Reddit",
      sourceIcon: <MessageSquare className="h-4 w-4" />,
      author: "defi_maximalist",
      authorImage: "/placeholder.svg?height=48&width=48",
      content: "NOVA's integration with DeFi protocols is a game-changer. Being able to use your on-chain identity for borrowing is going to transform lending markets.",
      time: "12h ago",
      sentiment: "positive",
      likes: 142,
      shares: 38,
    },
    {
      id: "sent7",
      source: "Discord",
      sourceIcon: <MessageCircle className="h-4 w-4" />,
      author: "crypto_researcher",
      authorImage: "/placeholder.svg?height=48&width=48",
      content: "I've been analyzing NOVA's technology and comparing it with competitors. Their zero-knowledge approach to identity verification stands out.",
      time: "3d ago",
      sentiment: "positive",
      likes: 67,
      shares: 15,
    },
    {
      id: "sent8",
      source: "Twitter",
      sourceIcon: <Twitter className="h-4 w-4" />,
      author: "traderman",
      authorImage: "/placeholder.svg?height=48&width=48",
      content: "Shorting $NOVA. The sell pressure from team unlocks next month will be massive. #CryptoTrading",
      time: "1d ago",
      sentiment: "negative",
      likes: 89,
      shares: 32,
    },
  ]
  
  // Filter by selected feed
  const filteredSentiments = selectedFeed === "all" 
    ? sentimentData 
    : sentimentData.filter(item => item.source.toLowerCase() === selectedFeed)
  
  // Mock sentiment overview data
  const sentimentOverview = {
    overall: 78, // 0-100 score
    positive: 72,
    neutral: 18,
    negative: 10,
    change24h: 5.2,
    totalMentions: 12845,
    mentionsChange: 32.5
  }
  
  // Mock sentiment trend data
  const sentimentTrend = {
    "24h": Array.from({ length: 24 }, (_, i) => ({
      time: `${i}:00`,
      value: 65 + Math.random() * 25,
    })),
    "7d": Array.from({ length: 7 }, (_, i) => ({
      time: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i],
      value: 60 + Math.random() * 30,
    })),
    "30d": Array.from({ length: 30 }, (_, i) => ({
      time: `Day ${i + 1}`,
      value: 55 + Math.random() * 35,
    })),
  }
  
  // Mock volume trend data
  const volumeTrend = {
    "24h": Array.from({ length: 24 }, (_, i) => ({
      time: `${i}:00`,
      value: 8000 + Math.random() * 5000,
    })),
    "7d": Array.from({ length: 7 }, (_, i) => ({
      time: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i],
      value: 7000 + Math.random() * 6000,
    })),
    "30d": Array.from({ length: 30 }, (_, i) => ({
      time: `Day ${i + 1}`,
      value: 6000 + Math.random() * 7000,
    })),
  }
  
  // Mock popular topics
  const popularTopics = [
    { name: "#NOVA", mentions: 5824, sentiment: 82 },
    { name: "#Identity", mentions: 3256, sentiment: 75 },
    { name: "#Web3", mentions: 2987, sentiment: 70 },
    { name: "#DeFi", mentions: 1845, sentiment: 68 },
    { name: "#Solana", mentions: 1523, sentiment: 72 },
  ]
  
  // Mock market influencers
  const marketInfluencers = [
    { name: "CryptoExpert", followers: "458K", impact: 85, sentiment: "positive" },
    { name: "BlockchainGuru", followers: "325K", impact: 78, sentiment: "positive" },
    { name: "TradingMaster", followers: "289K", impact: 72, sentiment: "neutral" },
    { name: "CoinAnalyst", followers: "214K", impact: 68, sentiment: "positive" },
    { name: "MarketSkeptic", followers: "187K", impact: 65, sentiment: "negative" },
  ]
  
  const getSentimentColor = (sentiment: string) => {
    if (sentiment === "positive") return "text-green-400"
    if (sentiment === "negative") return "text-red-400"
    return "text-white/70"
  }
  
  const getSentimentBgColor = (sentiment: string) => {
    if (sentiment === "positive") return "bg-green-500/20"
    if (sentiment === "negative") return "bg-red-500/20"
    return "bg-white/10"
  }
  
  return (
    <div className="space-y-6">
      {/* Sentiment Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sentiment Feed */}
        <div className="lg:col-span-2 bg-black/40 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
                Social Sentiment
              </h2>
              <div className="flex items-center gap-2">
                <div className="px-3 py-1 text-xs bg-white/10 rounded-md flex items-center gap-1">
                  <RefreshCw size={12} />
                  <span>Live</span>
                </div>
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  selectedFeed === "all"
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                    : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
                }`}
                onClick={() => setSelectedFeed("all")}
              >
                All Sources
              </button>
              <button
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-1.5 ${
                  selectedFeed === "twitter"
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                    : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
                }`}
                onClick={() => setSelectedFeed("twitter")}
              >
                <Twitter size={14} />
                Twitter
              </button>
              <button
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-1.5 ${
                  selectedFeed === "reddit"
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                    : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
                }`}
                onClick={() => setSelectedFeed("reddit")}
              >
                <MessageSquare size={14} />
                Reddit
              </button>
              <button
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-1.5 ${
                  selectedFeed === "discord"
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                    : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
                }`}
                onClick={() => setSelectedFeed("discord")}
              >
                <MessageCircle size={14} />
                Discord
              </button>
              <button
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-1.5 ${
                  selectedFeed === "telegram"
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                    : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
                }`}
                onClick={() => setSelectedFeed("telegram")}
              >
                <Send size={14} />
                Telegram
              </button>
            </div>
          </div>
          
          <div className="max-h-[600px] overflow-y-auto">
            <div className="space-y-1 p-2">
              {filteredSentiments.map((item) => (
                <div 
                  key={item.id}
                  className="p-4 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-all"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-r from-purple-500 to-blue-500">
                        <div className="w-full h-full bg-white/10 flex items-center justify-center">
                          {item.authorImage ? (
                            <img src={item.authorImage} alt={item.author} className="w-full h-full object-cover" />
                          ) : (
                            item.author.charAt(0)
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{item.author}</p>
                        <div className="flex items-center text-xs text-white/60">
                          <div className="flex items-center gap-1">
                            {item.sourceIcon}
                            <span>{item.source}</span>
                          </div>
                          <span className="mx-1">•</span>
                          <span>{item.time}</span>
                        </div>
                      </div>
                    </div>
                    <div className={`px-2 py-0.5 rounded-full text-xs ${
                      getSentimentBgColor(item.sentiment)} ${getSentimentColor(item.sentiment)}`}>
                      {item.sentiment}
                    </div>
                  </div>
                  
                  <p className="text-sm text-white/80 mb-3">{item.content}</p>
                  
                  <div className="flex items-center justify-between text-xs text-white/60">
                    <div className="flex items-center gap-4">
                      <span>❤️ {item.likes}</span>
                      <span>🔄 {item.shares}</span>
                    </div>
                    <button className="text-purple-400 hover:text-purple-300 transition-colors">
                      View Source
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Sentiment Analysis */}
        <div className="space-y-6">
          <div className="bg-black/40 backdrop-blur-xl rounded-xl border border-white/10 p-6">
            <h2 className="text-lg font-bold mb-4">Sentiment Analysis</h2>
            
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white/70">Overall Sentiment</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{sentimentOverview.overall}/100</span>
                  <span className={`text-xs flex items-center ${sentimentOverview.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {sentimentOverview.change24h >= 0 ? (
                      <TrendingUp className="h-3 w-3 mr-0.5" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-0.5" />
                    )}
                    {sentimentOverview.change24h >= 0 ? '+' : ''}{sentimentOverview.change24h}%
                  </span>
                </div>
              </div>
              <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-yellow-500 via-green-500 to-green-400"
                  style={{ width: `${sentimentOverview.overall}%` }}
                ></div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                <div className="text-xs text-white/60 mb-1">Positive</div>
                <div className="font-medium">{sentimentOverview.positive}%</div>
              </div>
              <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="text-xs text-white/60 mb-1">Neutral</div>
                <div className="font-medium">{sentimentOverview.neutral}%</div>
              </div>
              <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                <div className="text-xs text-white/60 mb-1">Negative</div>
                <div className="font-medium">{sentimentOverview.negative}%</div>
              </div>
            </div>
            
            <div className="flex justify-between items-center mb-2">
              <span className="text-white/70">Total Mentions</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">{sentimentOverview.totalMentions.toLocaleString()}</span>
                <span className={`text-xs flex items-center ${sentimentOverview.mentionsChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {sentimentOverview.mentionsChange >= 0 ? (
                    <TrendingUp className="h-3 w-3 mr-0.5" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-0.5" />
                  )}
                  {sentimentOverview.mentionsChange >= 0 ? '+' : ''}{sentimentOverview.mentionsChange}%
                </span>
              </div>
            </div>
          </div>
          
          <div className="bg-black/40 backdrop-blur-xl rounded-xl border border-white/10 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Sentiment Trend</h2>
              <div className="flex space-x-1">
                {["24h", "7d", "30d"].map((period) => (
                  <button
                    key={period}
                    className={`px-2 py-1 text-xs rounded-md transition-colors ${
                      timeframe === period
                        ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                        : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
                    }`}
                    onClick={() => setTimeframe(period)}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="h-36">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={sentimentTrend[timeframe as keyof typeof sentimentTrend]}
                  margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
                >
                  <defs>
                    <linearGradient id="colorSentiment" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="time" 
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
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#8b5cf6" 
                    fillOpacity={1} 
                    fill="url(#colorSentiment)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-black/40 backdrop-blur-xl rounded-xl border border-white/10 p-6">
            <h2 className="text-lg font-bold mb-4">Popular Topics</h2>
            <div className="space-y-3">
              {popularTopics.map((topic) => (
                <div key={topic.name} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{topic.name}</span>
                    <span className="text-xs text-white/60">{topic.mentions.toLocaleString()} mentions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-yellow-500 via-green-500 to-green-400"
                        style={{ width: `${topic.sentiment}%` }}
                      ></div>
                    </div>
                    <span className="text-xs">{topic.sentiment}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Additional sentiment analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mention Volume */}
        <div className="bg-black/40 backdrop-blur-xl rounded-xl border border-white/10 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Mention Volume</h2>
            <div className="flex space-x-1">
              {["24h", "7d", "30d"].map((period) => (
                <button
                  key={period}
                  className={`px-2 py-1 text-xs rounded-md transition-colors ${
                    timeframe === period
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                      : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
                  }`}
                  onClick={() => setTimeframe(period)}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={volumeTrend[timeframe as keyof typeof volumeTrend]}
                margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
              >
                <XAxis 
                  dataKey="time" 
                  tick={{ fill: '#9ca3af', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fill: '#9ca3af', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  width={40}
                  tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}
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
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Market Influencers */}
        <div className="bg-black/40 backdrop-blur-xl rounded-xl border border-white/10 p-6">
          <h2 className="text-lg font-bold mb-4">Market Influencers</h2>
          
          <div className="space-y-4">
            {marketInfluencers.map((influencer, index) => (
              <div 
                key={influencer.name}
                className="p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center font-bold">
                        {influencer.name.charAt(0)}
                      </div>
                      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-xs">
                        {index + 1}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">{influencer.name}</div>
                      <div className="text-xs text-white/60">{influencer.followers} followers</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-xs text-white/60">Impact</div>
                      <div className="font-medium">{influencer.impact}</div>
                    </div>
                    <div className={`px-2 py-0.5 rounded-full text-xs ${
                      getSentimentBgColor(influencer.sentiment)} ${getSentimentColor(influencer.sentiment)}`}>
                      {influencer.sentiment}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SentimentTab;