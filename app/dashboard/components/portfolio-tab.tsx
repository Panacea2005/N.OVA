"use client"

import { useState, useEffect } from "react"
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  ChevronRight, 
  ExternalLink,
  ArrowRight,
  Filter,
  Search,
  Star,
  Clock,
  Info,
  AlertCircle,
  Globe,
  Activity,
  DollarSign,
  RefreshCw,
  Zap,
  Settings,
  ChevronDown,
  PieChart as PieChartIcon,
  Menu
} from "lucide-react"
import { AreaChart, Area, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { ValueType } from "recharts/types/component/DefaultTooltipContent";

// Function to format large numbers with k, M, B
const formatNumber = (num: number | null | undefined, digits = 2) => {
  if (num === null || num === undefined) return '—';
  
  const absNum = Math.abs(num);
  if (absNum >= 1000000000) return (num / 1000000000).toFixed(digits) + 'B';
  if (absNum >= 1000000) return (num / 1000000).toFixed(digits) + 'M';
  if (absNum >= 1000) return (num / 1000).toFixed(digits) + 'K';
  return num.toFixed(digits);
};

// Format percentage
const formatPercent = (percent: number | null | undefined) => {
  if (percent === null || percent === undefined) return '—';
  return (percent > 0 ? '+' : '') + percent.toFixed(2) + '%';
};

const CryptoMarketDashboard = () => {
  const [timePeriod, setTimePeriod] = useState("1W")
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedToken, setSelectedToken] = useState("NOVA")
  const [searchTerm, setSearchTerm] = useState("")
  const [marketView, setMarketView] = useState("all")
  const [isNewsExpanded, setIsNewsExpanded] = useState<Record<number, boolean>>({})
  
  // Mock global market data
  const marketData = {
    totalMarketCap: 2.84,  // in trillions
    volume24h: 142.8,      // in billions
    btcDominance: 52.6,    // percentage
    marketChange24h: 3.2,  // percentage
    marketCapChange: 87.5, // in billions
    activeCoins: 12879,
    activePairs: 43215,
    marketSentiment: 65,   // 0-100 scale, higher is more bullish
  }
  
  // Price chart data for different time periods
  const generateChartData = (token: string, period: string, trend = "up") => {
    const basePrice = 
      token === "NOVA" ? 4.42 : 
      token === "SOL" ? 191.07 : 
      token === "ETH" ? 3207.82 : 
      token === "BTC" ? 65347.97 : 
      token === "USDC" ? 1.00 : 0;
      
    const volatility = 
      token === "NOVA" ? 0.08 : 
      token === "SOL" ? 0.06 : 
      token === "ETH" ? 0.04 : 
      token === "BTC" ? 0.03 : 
      token === "USDC" ? 0.001 : 0.05;
    
    const points = 
      period === "1D" ? 24 : 
      period === "1W" ? 7 : 
      period === "1M" ? 30 : 
      period === "3M" ? 90 : 
      period === "1Y" ? 52 : 24;
    
    const trendFactor = trend === "up" ? 1 : -1;
    
    return Array.from({ length: points }, (_, i) => {
      const randomFactor = (Math.random() - 0.5) * volatility;
      const trendComponent = trendFactor * (i / points) * volatility * 5;
      const priceFactor = 1 + randomFactor + trendComponent;
      
      return {
        time: i,
        price: basePrice * priceFactor,
        volume: Math.random() * basePrice * 5000000 * priceFactor,
      };
    });
  };
  
  // Generate price chart data for different tokens and periods
  const priceChartData = {
    NOVA: {
      "1D": generateChartData("NOVA", "1D", "up"),
      "1W": generateChartData("NOVA", "1W", "up"),
      "1M": generateChartData("NOVA", "1M", "up"),
      "3M": generateChartData("NOVA", "3M", "up"),
      "1Y": generateChartData("NOVA", "1Y", "up"),
    },
    SOL: {
      "1D": generateChartData("SOL", "1D", "up"),
      "1W": generateChartData("SOL", "1W", "up"),
      "1M": generateChartData("SOL", "1M", "up"),
      "3M": generateChartData("SOL", "3M", "up"),
      "1Y": generateChartData("SOL", "1Y", "up"),
    },
    ETH: {
      "1D": generateChartData("ETH", "1D", "down"),
      "1W": generateChartData("ETH", "1W", "up"),
      "1M": generateChartData("ETH", "1M", "up"),
      "3M": generateChartData("ETH", "3M", "up"),
      "1Y": generateChartData("ETH", "1Y", "up"),
    },
    BTC: {
      "1D": generateChartData("BTC", "1D", "down"),
      "1W": generateChartData("BTC", "1W", "down"),
      "1M": generateChartData("BTC", "1M", "up"),
      "3M": generateChartData("BTC", "3M", "up"),
      "1Y": generateChartData("BTC", "1Y", "up"),
    },
    USDC: {
      "1D": generateChartData("USDC", "1D", "up"),
      "1W": generateChartData("USDC", "1W", "up"),
      "1M": generateChartData("USDC", "1M", "up"),
      "3M": generateChartData("USDC", "3M", "up"),
      "1Y": generateChartData("USDC", "1Y", "up"),
    },
  };
  
  // Global market charts
  const globalMarketCharts = {
    marketCap: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      value: 2.5 + (i / 100) + (Math.random() * 0.1),  // in trillions
    })),
    volume: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      value: 100 + (Math.random() * 80),  // in billions
    })),
    btcDominance: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      value: 50 + (Math.sin(i / 5) * 5) + (Math.random() * 2), // percentage
    })),
    sentiment: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      value: 50 + (Math.sin(i / 3) * 15) + (Math.random() * 5), // 0-100 scale
    })),
  };
  
  // Token info
  const tokens = [
    {
      id: "nova",
      name: "NOVA",
      symbol: "NOVA",
      logo: "N",
      price: 4.42,
      change24h: 5.2,
      change7d: 12.5,
      marketCap: 188250720,
      volume24h: 28543120,
      circulatingSupply: 42589230,
      totalSupply: 100000000,
      allTimeHigh: 5.15,
      allTimeHighDate: "2025-03-15",
      rank: 54,
      category: "AI & Identity",
      description: "Native token of the NOVA AI Identity Platform on Solana",
      chart: Array.from({ length: 24 }, () => 0.9 + Math.random() * 0.2),
    },
    {
      id: "sol",
      name: "Solana",
      symbol: "SOL",
      logo: "S",
      price: 191.07,
      change24h: 8.3,
      change7d: -2.4,
      marketCap: 84526589326,
      volume24h: 3543876230,
      circulatingSupply: 442385201,
      totalSupply: 560292882,
      allTimeHigh: 259.96,
      allTimeHighDate: "2023-12-25",
      rank: 5,
      category: "Layer 1",
      description: "High-performance blockchain supporting fast, secure, and scalable decentralized apps",
      chart: Array.from({ length: 24 }, () => 0.9 + Math.random() * 0.2),
    },
    {
      id: "eth",
      name: "Ethereum",
      symbol: "ETH",
      logo: "E",
      price: 3207.82,
      change24h: 2.8,
      change7d: 5.6,
      marketCap: 385246972145,
      volume24h: 18452963875,
      circulatingSupply: 120128645,
      totalSupply: 120128645,
      allTimeHigh: 4891.70,
      allTimeHighDate: "2021-11-16",
      rank: 2,
      category: "Layer 1",
      description: "Decentralized computing platform enabling smart contracts and dApps",
      chart: Array.from({ length: 24 }, () => 0.9 + Math.random() * 0.2),
    },
    {
      id: "btc",
      name: "Bitcoin",
      symbol: "BTC",
      logo: "B",
      price: 65347.97,
      change24h: -1.2,
      change7d: 3.8,
      marketCap: 1285463287145,
      volume24h: 35426987254,
      circulatingSupply: 19669918,
      totalSupply: 21000000,
      allTimeHigh: 73738.45,
      allTimeHighDate: "2024-03-14",
      rank: 1,
      category: "Currency",
      description: "First decentralized cryptocurrency, designed as a peer-to-peer electronic cash system",
      chart: Array.from({ length: 24 }, () => 0.9 + Math.random() * 0.2),
    },
    {
      id: "usdc",
      name: "USD Coin",
      symbol: "USDC",
      logo: "U",
      price: 1.00,
      change24h: 0.02,
      change7d: 0.01,
      marketCap: 32543698214,
      volume24h: 8765432198,
      circulatingSupply: 32543698214,
      totalSupply: 32543698214,
      allTimeHigh: 1.03,
      allTimeHighDate: "2020-03-13",
      rank: 8,
      category: "Stablecoin",
      description: "USD-backed stablecoin designed for stability and usability in global digital finance",
      chart: Array.from({ length: 24 }, () => 0.9 + Math.random() * 0.2),
    },
  ];
  
  // Top gainers/losers in past 24h
  const topGainers = [
    { name: "NOVA", symbol: "NOVA", price: 4.42, change24h: 5.2 },
    { name: "Solana", symbol: "SOL", price: 191.07, change24h: 8.3 },
    { name: "Render", symbol: "RNDR", price: 8.75, change24h: 12.7 },
    { name: "Injective", symbol: "INJ", price: 32.60, change24h: 15.4 },
    { name: "Fetch.ai", symbol: "FET", price: 2.43, change24h: 18.2 },
  ].sort((a, b) => b.change24h - a.change24h);
  
  const topLosers = [
    { name: "Bitcoin", symbol: "BTC", price: 65347.97, change24h: -1.2 },
    { name: "Cardano", symbol: "ADA", price: 0.58, change24h: -3.5 },
    { name: "Dogecoin", symbol: "DOGE", price: 0.14, change24h: -4.2 },
    { name: "Polkadot", symbol: "DOT", price: 7.92, change24h: -5.8 },
    { name: "Shiba Inu", symbol: "SHIB", price: 0.00002758, change24h: -7.3 },
  ].sort((a, b) => a.change24h - b.change24h);
  
  // Trading pairs for selected token
  const generateTradingPairs = (token: string) => {
    const basePairs = [
      { pair: `${token}/USDT`, price: tokens.find(t => t.symbol === token)?.price || 0, volume24h: Math.random() * 10000000 + 5000000, change24h: (Math.random() * 10) - 3 },
      { pair: `${token}/USDC`, price: tokens.find(t => t.symbol === token)?.price || 0, volume24h: Math.random() * 8000000 + 3000000, change24h: (Math.random() * 10) - 3 },
      { pair: `${token}/BTC`, price: (tokens.find(t => t.symbol === token)?.price || 0) / 65347.97, volume24h: Math.random() * 5000000 + 2000000, change24h: (Math.random() * 10) - 3 },
      { pair: `${token}/ETH`, price: (tokens.find(t => t.symbol === token)?.price || 0) / 3207.82, volume24h: Math.random() * 3000000 + 1000000, change24h: (Math.random() * 10) - 3 },
    ];
    
    if (token !== "SOL") {
      basePairs.push({ pair: `${token}/SOL`, price: (tokens.find(t => t.symbol === token)?.price || 0) / 191.07, volume24h: Math.random() * 2000000 + 500000, change24h: (Math.random() * 10) - 3 });
    }
    
    return basePairs;
  };
  
  // News and updates for crypto market
  const marketNews = [
    {
      id: 1,
      title: "Federal Reserve Signals Interest Rate Cut: Potential Boost for Crypto Markets",
      source: "CryptoNews Daily",
      date: "2 hours ago",
      snippet: "The Federal Reserve has indicated a possible interest rate cut in the coming months, which could potentially drive more capital into cryptocurrency markets as investors seek higher yields.",
      fullText: "The Federal Reserve has indicated a possible interest rate cut in the coming months, which could potentially drive more capital into cryptocurrency markets as investors seek higher yields.\n\nDuring the latest Federal Open Market Committee meeting, officials suggested that improving inflation data could support an easing of monetary policy before the end of the year. Cryptocurrency markets have historically shown positive price action following interest rate cuts, as lower rates typically reduce returns on traditional fixed-income investments and increase the appeal of alternative assets.\n\nMarket analysts suggest this could particularly benefit Bitcoin and Ethereum, which are increasingly viewed as inflation hedges and stores of value by institutional investors. Industry experts point to increased institutional interest in crypto as a sign that the sector is maturing and becoming more integrated with traditional finance."
    },
    {
      id: 2,
      title: "NOVA Protocol Announces Major Partnership with Global Identity Verification Provider",
      source: "Blockchain Insider",
      date: "5 hours ago",
      snippet: "NOVA, the AI-powered identity protocol on Solana, has announced a strategic partnership with a leading global identity verification provider, potentially bringing its technology to millions of new users.",
      fullText: "NOVA, the AI-powered identity protocol on Solana, has announced a strategic partnership with a leading global identity verification provider, potentially bringing its technology to millions of new users.\n\nThe partnership aims to integrate NOVA's decentralized identity solutions with traditional verification systems, creating a hybrid approach that combines the security and privacy benefits of blockchain with the regulatory compliance of traditional systems.\n\nThe NOVA token surged following the announcement, with trading volume increasing by over 300% in the 24 hours after the news broke. Industry analysts suggest this move could accelerate mainstream adoption of blockchain-based identity solutions and position NOVA as a bridge between traditional systems and Web3 technologies."
    },
    {
      id: 3,
      title: "New Regulatory Framework for Crypto Proposed in European Union",
      source: "Global Finance Today",
      date: "Yesterday",
      snippet: "The European Commission has unveiled a comprehensive regulatory framework for cryptocurrencies aimed at consumer protection while fostering innovation in the digital asset space.",
      fullText: "The European Commission has unveiled a comprehensive regulatory framework for cryptocurrencies aimed at consumer protection while fostering innovation in the digital asset space.\n\nThe proposed regulations include clear guidelines for token issuance, trading platform operations, and stablecoin reserves. Unlike previous approaches, this framework takes a technology-neutral stance, focusing on the functions and risks of digital assets rather than the underlying technology.\n\nIndustry responses have been cautiously positive, with many highlighting the potential for regulatory clarity to drive institutional adoption. However, concerns remain about compliance costs for smaller projects and startups. The framework is expected to be implemented in phases over the next two years, giving market participants time to adapt to the new requirements."
    },
    {
      id: 4,
      title: "Solana TVL Reaches All-Time High as DeFi Activity Surges",
      source: "DeFi Pulse",
      date: "Yesterday",
      snippet: "Total Value Locked (TVL) on Solana has reached an all-time high of $14.8 billion, driven by increased DeFi activity and the growing popularity of liquid staking derivatives.",
      fullText: "Total Value Locked (TVL) on Solana has reached an all-time high of $14.8 billion, driven by increased DeFi activity and the growing popularity of liquid staking derivatives.\n\nThe surge represents a 45% increase since the beginning of the year, significantly outpacing growth on other layer-1 blockchains. Analysts attribute this growth to Solana's consistent performance improvements, reduced network outages, and the increasing adoption of its DeFi ecosystem.\n\nNew yield farming opportunities and innovative DeFi primitives have attracted both retail and institutional liquidity to the network. Additionally, cross-chain bridges connecting Solana to Ethereum and other major blockchains have facilitated easier capital movement into the ecosystem."
    },
    {
      id: 5,
      title: "Bitcoin ETFs See Record Inflows as Institutional Interest Grows",
      source: "Institutional Investor",
      date: "2 days ago",
      snippet: "Bitcoin ETFs have recorded their highest weekly inflows since launching, with over $2.3 billion in new capital entering the market as institutional adoption accelerates.",
      fullText: "Bitcoin ETFs have recorded their highest weekly inflows since launching, with over $2.3 billion in new capital entering the market as institutional adoption accelerates.\n\nThe surge in investment comes amid growing acceptance of Bitcoin as a legitimate asset class among traditional financial institutions. Major wealth management firms have begun recommending Bitcoin ETFs as part of diversified portfolio strategies, typically suggesting allocations of 1-5% for suitable clients.\n\nThese developments mark a significant shift in institutional sentiment toward cryptocurrencies. Several pension funds and endowments have also disclosed initial allocations to Bitcoin ETFs, suggesting that digital assets are gradually becoming integrated into traditional investment strategies despite their volatility."
    },
  ];
  
  // Get selected token info
  const selectedTokenInfo = tokens.find(token => token.symbol === selectedToken);
  
  // Filter tokens based on search term
  const filteredTokens = tokens.filter(token => 
    token.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    token.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Format token chart data for display
  const formatChartData = (data: any[]) => {
    return data.map((item: any, index: any) => ({
      name: index,
      value: item,
    }));
  };
  
  // Helper function to determine text color based on percentage change
  const getChangeColor = (change: number) => {
    if (change > 0) return "text-green-400";
    if (change < 0) return "text-red-400";
    return "text-white";
  };
  
  // Format trading volume
  const formatVolume = (volume: ValueType) => {
    const numVolume = Number(volume);
    if (isNaN(numVolume)) return '$0.00';
    
    if (numVolume >= 1000000000) return `$${(numVolume / 1000000000).toFixed(2)}B`;
    if (numVolume >= 1000000) return `$${(numVolume / 1000000).toFixed(2)}M`;
    if (numVolume >= 1000) return `$${(numVolume / 1000).toFixed(2)}K`;
    return `$${numVolume.toFixed(2)}`;
  };
  
  // Format market cap
  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1000000000000) return `$${(marketCap / 1000000000000).toFixed(2)}T`;
    if (marketCap >= 1000000000) return `$${(marketCap / 1000000000).toFixed(2)}B`;
    if (marketCap >= 1000000) return `$${(marketCap / 1000000).toFixed(2)}M`;
    if (marketCap >= 1000) return `$${(marketCap / 1000).toFixed(2)}K`;
    return `$${marketCap.toFixed(2)}`;
  };
  
  // Render token mini chart
  const renderTokenMiniChart = (data: number[]) => {
    const chartData = formatChartData(data);
    
    return (
      <div className="h-10 w-16">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
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
    );
  };
  
  return (
    <div className="space-y-6">
      {/* Market Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-black/40 backdrop-blur-xl rounded-xl border border-white/10 p-4 hover:border-purple-500/30 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-white/70 text-sm">Global Market Cap</h3>
            <DollarSign className="h-4 w-4 text-purple-400" />
          </div>
          <div className="flex items-end justify-between">
            <div>
              <div className="text-2xl font-bold">${marketData.totalMarketCap.toFixed(2)}T</div>
              <div className={`flex items-center text-sm ${getChangeColor(marketData.marketChange24h)}`}>
                {marketData.marketChange24h >= 0 ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                {marketData.marketChange24h >= 0 ? '+' : ''}{marketData.marketChange24h}%
                <span className="ml-1">24h</span>
              </div>
            </div>
            <div className="h-12 w-24">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={globalMarketCharts.marketCap.slice(-14)} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
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
          </div>
        </div>
        
        <div className="bg-black/40 backdrop-blur-xl rounded-xl border border-white/10 p-4 hover:border-purple-500/30 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-white/70 text-sm">24h Volume</h3>
            <BarChart3 className="h-4 w-4 text-blue-400" />
          </div>
          <div className="flex items-end justify-between">
            <div>
              <div className="text-2xl font-bold">${marketData.volume24h.toFixed(1)}B</div>
              <div className="text-sm text-white/60">
                {(marketData.volume24h / marketData.totalMarketCap / 10).toFixed(1)}% of market cap
              </div>
            </div>
            <div className="h-12 w-24">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={globalMarketCharts.volume.slice(-14)} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <Bar dataKey="value" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        <div className="bg-black/40 backdrop-blur-xl rounded-xl border border-white/10 p-4 hover:border-purple-500/30 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-white/70 text-sm">BTC Dominance</h3>
            <PieChartIcon className="h-4 w-4 text-orange-400" />
          </div>
          <div className="flex items-end justify-between">
            <div>
              <div className="text-2xl font-bold">{marketData.btcDominance.toFixed(1)}%</div>
              <div className="text-sm text-white/60">
                ETH: {(100 - marketData.btcDominance - 30).toFixed(1)}%
              </div>
            </div>
            <div className="h-12 w-24">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={globalMarketCharts.btcDominance.slice(-14)} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#f59e0b"
                    strokeWidth={1.5}
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        <div className="bg-black/40 backdrop-blur-xl rounded-xl border border-white/10 p-4 hover:border-purple-500/30 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-white/70 text-sm">Market Sentiment</h3>
            <Activity className="h-4 w-4 text-green-400" />
          </div>
          <div className="flex items-end justify-between">
            <div>
              <div className="text-2xl font-bold">{marketData.marketSentiment} / 100</div>
              <div className={`text-sm ${marketData.marketSentiment > 50 ? 'text-green-400' : 'text-red-400'}`}>
                {marketData.marketSentiment > 50 ? 'Bullish' : 'Bearish'}
              </div>
            </div>
            <div className="h-12 w-24">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={globalMarketCharts.sentiment.slice(-14)} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#10b981"
                    strokeWidth={1.5}
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content Tabs */}
      <div className="bg-black/40 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden">
        <div className="border-b border-white/10 px-6 pt-6 pb-0">
          <div className="flex gap-2 overflow-x-auto hide-scrollbar">
            <button
              className={`px-4 py-2 text-sm font-medium transition-colors rounded-t-lg ${
                activeTab === 'overview'
                  ? 'text-white border-b-2 border-purple-500'
                  : 'text-white/60 hover:text-white'
              }`}
              onClick={() => setActiveTab('overview')}
            >
              Market Overview
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium transition-colors rounded-t-lg ${
                activeTab === 'tokens'
                  ? 'text-white border-b-2 border-purple-500'
                  : 'text-white/60 hover:text-white'
              }`}
              onClick={() => setActiveTab('tokens')}
            >
              Top Tokens
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium transition-colors rounded-t-lg ${
                activeTab === 'charts'
                  ? 'text-white border-b-2 border-purple-500'
                  : 'text-white/60 hover:text-white'
              }`}
              onClick={() => setActiveTab('charts')}
            >
              Charts & Analysis
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium transition-colors rounded-t-lg ${
                activeTab === 'gainers'
                  ? 'text-white border-b-2 border-purple-500'
                  : 'text-white/60 hover:text-white'
              }`}
              onClick={() => setActiveTab('gainers')}
            >
              Gainers & Losers
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium transition-colors rounded-t-lg ${
                activeTab === 'news'
                  ? 'text-white border-b-2 border-purple-500'
                  : 'text-white/60 hover:text-white'
              }`}
              onClick={() => setActiveTab('news')}
            >
              Market News
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {/* Market Overview Tab */}
          {activeTab === 'overview' && (
            <div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Global Market Cap Chart */}
                <div className="lg:col-span-2 bg-white/5 rounded-xl border border-white/10 p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-lg font-medium mb-1">Global Market Cap</h2>
                      <div className="text-sm text-white/60">30-day trend</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 rounded-md bg-white/5 hover:bg-white/10 transition-colors">
                        <RefreshCw className="h-4 w-4" />
                      </button>
                      <button className="p-1.5 rounded-md bg-white/5 hover:bg-white/10 transition-colors">
                        <Settings className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={globalMarketCharts.marketCap}
                        margin={{ top: 5, right: 5, bottom: 20, left: 5 }}
                      >
                        <defs>
                          <linearGradient id="colorMarketCap" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                        <XAxis 
                          dataKey="date" 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#9ca3af', fontSize: 12 }}
                          tickFormatter={(value) => value.split('-')[2]}
                        />
                        <YAxis 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#9ca3af', fontSize: 12 }}
                          width={60}
                          tickFormatter={(value) => `$${value.toFixed(2)}T`}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '0.5rem',
                          }}
                          labelStyle={{ color: '#f3f4f6' }}
                          itemStyle={{ color: '#f3f4f6' }}
                          formatter={(value) => [`$${Number(value).toFixed(2)}T`, 'Market Cap']}
                          labelFormatter={(value) => new Date(value).toLocaleDateString()}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#8b5cf6" 
                          strokeWidth={2}
                          fillOpacity={1} 
                          fill="url(#colorMarketCap)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                {/* Market Stats & Breakdown */}
                <div className="space-y-6">
                  <div className="bg-white/5 rounded-xl border border-white/10 p-5">
                    <h2 className="text-lg font-medium mb-4">Market Distribution</h2>
                    
                    <div className="h-48 mb-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: "Bitcoin", value: marketData.btcDominance },
                              { name: "Ethereum", value: 100 - marketData.btcDominance - 30 },
                              { name: "Stablecoins", value: 15 },
                              { name: "Others", value: 15 },
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            <Cell fill="#f59e0b" />
                            <Cell fill="#3b82f6" />
                            <Cell fill="#10b981" />
                            <Cell fill="#8b5cf6" />
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'rgba(0, 0, 0, 0.8)',
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                              borderRadius: '0.5rem',
                            }}
                            formatter={(value) => [`${typeof value === 'number' ? value.toFixed(1) : value}%`, 'Market Share']}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                          <span>Bitcoin</span>
                        </div>
                        <span>{marketData.btcDominance.toFixed(1)}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                          <span>Ethereum</span>
                        </div>
                        <span>{(100 - marketData.btcDominance - 30).toFixed(1)}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <span>Stablecoins</span>
                        </div>
                        <span>15.0%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                          <span>Others</span>
                        </div>
                        <span>15.0%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/5 rounded-xl border border-white/10 p-5">
                    <h2 className="text-lg font-medium mb-3">Crypto Market Stats</h2>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-white/70">Active Cryptocurrencies</span>
                        <span className="font-medium">{marketData.activeCoins.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/70">Active Trading Pairs</span>
                        <span className="font-medium">{marketData.activePairs.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/70">Trading Volume / Mcap</span>
                        <span className="font-medium">{(marketData.volume24h / marketData.totalMarketCap / 10).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/70">BTC Market Cap</span>
                        <span className="font-medium">${(marketData.totalMarketCap * marketData.btcDominance / 100).toFixed(2)}T</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/70">ETH Market Cap</span>
                        <span className="font-medium">${(marketData.totalMarketCap * (100 - marketData.btcDominance - 30) / 100).toFixed(2)}T</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Top Tokens Snapshot */}
              <div className="mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium">Top Tokens</h2>
                  <button 
                    className="text-sm text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
                    onClick={() => setActiveTab('tokens')}
                  >
                    View All <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px]">
                    <thead>
                      <tr className="text-left text-white/60">
                        <th className="pb-4 font-normal text-sm">Name</th>
                        <th className="pb-4 font-normal text-sm">Price</th>
                        <th className="pb-4 font-normal text-sm">24h %</th>
                        <th className="pb-4 font-normal text-sm">7d %</th>
                        <th className="pb-4 font-normal text-sm">Market Cap</th>
                        <th className="pb-4 font-normal text-sm">Volume (24h)</th>
                        <th className="pb-4 font-normal text-sm text-right">Last 7 Days</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tokens.map((token) => (
                        <tr 
                          key={token.id} 
                          className="border-t border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                          onClick={() => {
                            setSelectedToken(token.symbol);
                            setActiveTab('charts');
                          }}
                        >
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-xs font-bold">
                                {token.logo}
                              </div>
                              <div>
                                <div className="font-medium">{token.name}</div>
                                <div className="text-xs text-white/60">{token.symbol}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4">
                            <div className="font-medium">${token.price.toLocaleString()}</div>
                          </td>
                          <td className="py-4">
                            <div className={getChangeColor(token.change24h)}>
                              {token.change24h > 0 ? "+" : ""}{token.change24h}%
                            </div>
                          </td>
                          <td className="py-4">
                            <div className={getChangeColor(token.change7d)}>
                              {token.change7d > 0 ? "+" : ""}{token.change7d}%
                            </div>
                          </td>
                          <td className="py-4">
                            <div className="font-medium">{formatMarketCap(token.marketCap)}</div>
                          </td>
                          <td className="py-4">
                            <div className="font-medium">{formatVolume(token.volume24h)}</div>
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
            </div>
          )}
          
          {/* Tokens Tab */}
          {activeTab === 'tokens' && (
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
                  <input
                    type="text"
                    placeholder="Search tokens..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500/50 transition-colors"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="flex p-1 bg-white/5 rounded-lg">
                    <button
                      className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                        marketView === 'all'
                          ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                          : "text-white/60 hover:bg-white/10 hover:text-white"
                      }`}
                      onClick={() => setMarketView('all')}
                    >
                      All
                    </button>
                    <button
                      className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                        marketView === 'defi'
                          ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                          : "text-white/60 hover:bg-white/10 hover:text-white"
                      }`}
                      onClick={() => setMarketView('defi')}
                    >
                      DeFi
                    </button>
                    <button
                      className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                        marketView === 'l1'
                          ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                          : "text-white/60 hover:bg-white/10 hover:text-white"
                      }`}
                      onClick={() => setMarketView('l1')}
                    >
                      Layer-1
                    </button>
                  </div>
                  
                  <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                    <Filter className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px]">
                  <thead>
                    <tr className="text-left text-white/60">
                      <th className="pb-4 font-normal text-sm">Rank</th>
                      <th className="pb-4 font-normal text-sm">Name</th>
                      <th className="pb-4 font-normal text-sm">Price</th>
                      <th className="pb-4 font-normal text-sm">24h %</th>
                      <th className="pb-4 font-normal text-sm">7d %</th>
                      <th className="pb-4 font-normal text-sm">Market Cap</th>
                      <th className="pb-4 font-normal text-sm">Volume (24h)</th>
                      <th className="pb-4 font-normal text-sm">Circulating Supply</th>
                      <th className="pb-4 font-normal text-sm text-right">Chart</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTokens.map((token) => (
                      <tr 
                        key={token.id} 
                        className="border-t border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                        onClick={() => {
                          setSelectedToken(token.symbol);
                          setActiveTab('charts');
                        }}
                      >
                        <td className="py-4">
                          <div className="font-medium">{token.rank}</div>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-xs font-bold">
                              {token.logo}
                            </div>
                            <div>
                              <div className="font-medium">{token.name}</div>
                              <div className="text-xs text-white/60">{token.symbol}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="font-medium">${token.price.toLocaleString()}</div>
                        </td>
                        <td className="py-4">
                          <div className={getChangeColor(token.change24h)}>
                            {token.change24h > 0 ? "+" : ""}{token.change24h}%
                          </div>
                        </td>
                        <td className="py-4">
                          <div className={getChangeColor(token.change7d)}>
                            {token.change7d > 0 ? "+" : ""}{token.change7d}%
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="font-medium">{formatMarketCap(token.marketCap)}</div>
                        </td>
                        <td className="py-4">
                          <div className="font-medium">{formatVolume(token.volume24h)}</div>
                        </td>
                        <td className="py-4">
                          <div className="font-medium">{formatNumber(token.circulatingSupply, 0)}</div>
                          <div className="text-xs text-white/60">
                            {((token.circulatingSupply / token.totalSupply) * 100).toFixed(1)}% of total supply
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
          
          {/* Charts & Analysis Tab */}
          {activeTab === 'charts' && (
            <div>
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Left column - Token selector and info */}
                <div className="lg:col-span-1 space-y-4">
                  {/* Token Selector */}
                  <div className="bg-white/5 rounded-xl border border-white/10 p-5">
                    <h2 className="text-lg font-medium mb-4">Select Token</h2>
                    
                    <div className="relative mb-4">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
                      <input
                        type="text"
                        placeholder="Search tokens..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500/50 transition-colors"
                      />
                    </div>
                    
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2 hide-scrollbar">
                      {filteredTokens.map((token) => (
                        <button
                          key={token.id}
                          className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors ${
                            selectedToken === token.symbol
                              ? "bg-purple-500/20 border border-purple-500/40"
                              : "hover:bg-white/10 border border-transparent"
                          }`}
                          onClick={() => setSelectedToken(token.symbol)}
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-xs font-bold">
                              {token.logo}
                            </div>
                            <span>{token.symbol}</span>
                          </div>
                          <div className={getChangeColor(token.change24h)}>
                            {token.change24h > 0 ? "+" : ""}{token.change24h}%
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Token Info */}
                  {selectedTokenInfo && (
                    <div className="bg-white/5 rounded-xl border border-white/10 p-5">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-sm font-bold">
                          {selectedTokenInfo.logo}
                        </div>
                        <div>
                          <div className="font-medium text-lg">{selectedTokenInfo.name}</div>
                          <div className="text-sm text-white/60">{selectedTokenInfo.symbol}</div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-white/70">Price</span>
                          <span className="font-medium">${selectedTokenInfo.price.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-white/70">24h Change</span>
                          <span className={getChangeColor(selectedTokenInfo.change24h)}>
                            {selectedTokenInfo.change24h > 0 ? "+" : ""}{selectedTokenInfo.change24h}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-white/70">7d Change</span>
                          <span className={getChangeColor(selectedTokenInfo.change7d)}>
                            {selectedTokenInfo.change7d > 0 ? "+" : ""}{selectedTokenInfo.change7d}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-white/70">Market Cap</span>
                          <span className="font-medium">{formatMarketCap(selectedTokenInfo.marketCap)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-white/70">Volume (24h)</span>
                          <span className="font-medium">{formatVolume(selectedTokenInfo.volume24h)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-white/70">All-Time High</span>
                          <span className="font-medium">${selectedTokenInfo.allTimeHigh.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-white/70">Circulating Supply</span>
                          <span className="font-medium">{formatNumber(selectedTokenInfo.circulatingSupply, 0)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Right column - Charts */}
                <div className="lg:col-span-3 space-y-6">
                  {/* Price Chart */}
                  <div className="bg-white/5 rounded-xl border border-white/10 p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h2 className="text-lg font-medium mb-1">{selectedTokenInfo?.name} Price Chart</h2>
                        <div className="flex items-center gap-2">
                          <div className="text-2xl font-bold">${selectedTokenInfo?.price.toLocaleString()}</div>
                            <div className={`text-sm ${getChangeColor(selectedTokenInfo?.change24h || 0)}`}>
                            {selectedTokenInfo?.change24h ? (selectedTokenInfo.change24h > 0 ? "+" : "") + selectedTokenInfo.change24h : 0}%
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {["1D", "1W", "1M", "3M", "1Y"].map((period) => (
                          <button
                            key={period}
                            className={`px-3 py-1 text-xs rounded-md transition-colors ${
                              timePeriod === period
                                ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                                : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
                            }`}
                            onClick={() => setTimePeriod(period)}
                          >
                            {period}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={priceChartData[selectedToken as keyof typeof priceChartData]?.[timePeriod as keyof typeof priceChartData["NOVA"]] || []}
                          margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
                        >
                          <defs>
                            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                          <XAxis 
                            dataKey="time" 
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9ca3af', fontSize: 12 }}
                            tickFormatter={(value) => value.toString()}
                          />
                          <YAxis 
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9ca3af', fontSize: 12 }}
                            width={60}
                            domain={['auto', 'auto']}
                            tickFormatter={(value) => `$${value.toFixed(2)}`}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'rgba(0, 0, 0, 0.8)',
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                              borderRadius: '0.5rem',
                            }}
                            labelStyle={{ color: '#f3f4f6' }}
                            itemStyle={{ color: '#f3f4f6' }}
                            formatter={(value) => [`$${typeof value === 'number' ? value.toFixed(4) : '0.0000'}`, 'Price']}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="price" 
                            stroke="#8b5cf6" 
                            strokeWidth={2}
                            fillOpacity={1} 
                            fill="url(#colorPrice)" 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  {/* Volume Chart */}
                  <div className="bg-white/5 rounded-xl border border-white/10 p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h2 className="text-lg font-medium mb-1">Trading Volume</h2>
                        <div className="text-sm text-white/60">24h Volume: {formatVolume(selectedTokenInfo?.volume24h || 0)}</div>
                      </div>
                    </div>
                    
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={priceChartData[selectedToken as keyof typeof priceChartData]?.[timePeriod as keyof typeof priceChartData["NOVA"]] || []}
                          margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                          <XAxis 
                            dataKey="time" 
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9ca3af', fontSize: 12 }}
                            tickFormatter={(value) => value.toString()}
                          />
                          <YAxis 
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9ca3af', fontSize: 12 }}
                            width={70}
                            tickFormatter={(value) => formatVolume(value)}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'rgba(0, 0, 0, 0.8)',
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                              borderRadius: '0.5rem',
                            }}
                            labelStyle={{ color: '#f3f4f6' }}
                            itemStyle={{ color: '#f3f4f6' }}
                            formatter={(value) => [formatVolume(value), 'Volume']}
                          />
                          <Bar 
                            dataKey="volume" 
                            fill="#3b82f6" 
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  {/* Trading Pairs */}
                  <div className="bg-white/5 rounded-xl border border-white/10 p-5">
                    <h2 className="text-lg font-medium mb-4">Trading Pairs</h2>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[600px]">
                        <thead>
                          <tr className="text-left text-white/60">
                            <th className="pb-3 font-normal text-sm">Pair</th>
                            <th className="pb-3 font-normal text-sm">Price</th>
                            <th className="pb-3 font-normal text-sm">24h Change</th>
                            <th className="pb-3 font-normal text-sm">Volume</th>
                          </tr>
                        </thead>
                        <tbody>
                          {generateTradingPairs(selectedToken).map((pair, index) => (
                            <tr key={index} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                              <td className="py-3">{pair.pair}</td>
                              <td className="py-3">{pair.price < 0.001 ? pair.price.toFixed(8) : pair.price.toFixed(4)}</td>
                              <td className="py-3">
                                <div className={getChangeColor(pair.change24h)}>
                                  {pair.change24h > 0 ? "+" : ""}{pair.change24h.toFixed(2)}%
                                </div>
                              </td>
                              <td className="py-3">{formatVolume(pair.volume24h)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Gainers & Losers Tab */}
          {activeTab === 'gainers' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Gainers */}
              <div className="bg-white/5 rounded-xl border border-white/10 p-5">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-white" />
                  </div>
                  <h2 className="text-lg font-medium">Top Gainers</h2>
                </div>
                
                <div className="space-y-4">
                  {topGainers.map((token, index) => (
                    <div 
                      key={token.symbol} 
                      className="p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedToken(token.symbol);
                        setActiveTab('charts');
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-green-500/20 to-emerald-500/20 flex items-center justify-center text-green-400 font-bold">
                            #{index + 1}
                          </div>
                          <div>
                            <div className="font-medium">{token.name}</div>
                            <div className="text-xs text-white/60">{token.symbol}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">${token.price.toLocaleString()}</div>
                          <div className="text-green-400 text-sm">+{token.change24h}%</div>
                        </div>
                      </div>
                      
                      {/* Progress bar showing relative gain */}
                      <div className="mt-3 w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                          style={{ width: `${(token.change24h / topGainers[0].change24h) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Top Losers */}
              <div className="bg-white/5 rounded-xl border border-white/10 p-5">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center">
                    <TrendingDown className="h-4 w-4 text-white" />
                  </div>
                  <h2 className="text-lg font-medium">Top Losers</h2>
                </div>
                
                <div className="space-y-4">
                  {topLosers.map((token, index) => (
                    <div 
                      key={token.symbol} 
                      className="p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedToken(token.symbol);
                        setActiveTab('charts');
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-red-500/20 to-pink-500/20 flex items-center justify-center text-red-400 font-bold">
                            #{index + 1}
                          </div>
                          <div>
                            <div className="font-medium">{token.name}</div>
                            <div className="text-xs text-white/60">{token.symbol}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">${token.price.toLocaleString()}</div>
                          <div className="text-red-400 text-sm">{token.change24h}%</div>
                        </div>
                      </div>
                      
                      {/* Progress bar showing relative loss */}
                      <div className="mt-3 w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-red-500 to-pink-500"
                          style={{ width: `${(token.change24h / topLosers[0].change24h) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Price Movement Analysis */}
              <div className="lg:col-span-2 bg-white/5 rounded-xl border border-white/10 p-5">
                <h2 className="text-lg font-medium mb-4">Market Movement Analysis</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <div className="text-white/60 text-xs mb-1">Extreme Gainers ({'>'}15%)</div>
                    <div className="text-xl font-medium">32</div>
                    <div className="text-green-400 text-xs">+8 from yesterday</div>
                  </div>
                  
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <div className="text-white/60 text-xs mb-1">Moderate Gainers (5-15%)</div>
                    <div className="text-xl font-medium">217</div>
                    <div className="text-green-400 text-xs">+42 from yesterday</div>
                  </div>
                  
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <div className="text-white/60 text-xs mb-1">Moderate Losers (5-15%)</div>
                    <div className="text-xl font-medium">178</div>
                    <div className="text-red-400 text-xs">-15 from yesterday</div>
                  </div>
                  
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <div className="text-white/60 text-xs mb-1">Extreme Losers ({'>'}15%)</div>
                    <div className="text-xl font-medium">14</div>
                    <div className="text-red-400 text-xs">+3 from yesterday</div>
                  </div>
                </div>
                
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { range: ">+20%", count: 18, category: "gain" },
                        { range: "+15-20%", count: 24, category: "gain" },
                        { range: "+10-15%", count: 87, category: "gain" },
                        { range: "+5-10%", count: 130, category: "gain" },
                        { range: "+0-5%", count: 284, category: "gain" },
                        { range: "-0-5%", count: 211, category: "loss" },
                        { range: "-5-10%", count: 94, category: "loss" },
                        { range: "-10-15%", count: 84, category: "loss" },
                        { range: "-15-20%", count: 11, category: "loss" },
                        { range: "<-20%", count: 3, category: "loss" },
                      ]}
                      margin={{ top: 20, right: 30, left: 30, bottom: 40 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                      <XAxis
                        dataKey="range"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={70}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                        width={50}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(0, 0, 0, 0.8)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: '0.5rem',
                        }}
                        labelStyle={{ color: '#f3f4f6' }}
                        itemStyle={{ color: '#f3f4f6' }}
                        formatter={(value) => [`${value} tokens`, 'Count']}
                      />
                      <Bar
                        dataKey="count"
                        name="Token Count"
                        radius={[4, 4, 0, 0]}
                        fill="#8b5cf6"
                      >
                        {Array.from({ length: 10 }).map((_, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={[
                              ">+20%", "+15-20%", "+10-15%", "+5-10%", "+0-5%"
                            ].includes([
                              ">+20%", "+15-20%", "+10-15%", "+5-10%", "+0-5%", 
                              "-0-5%", "-5-10%", "-10-15%", "-15-20%", "<-20%"
                            ][index]) ? "#10b981" : "#ef4444"}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Historical Volatility */}
              <div className="lg:col-span-2 bg-white/5 rounded-xl border border-white/10 p-5">
                <h2 className="text-lg font-medium mb-4">30-Day Volatility Comparison</h2>
                
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={Array.from({ length: 30 }, (_, i) => ({
                        day: i + 1,
                        BTC: 0.5 + Math.random() * 1.5,
                        ETH: 1 + Math.random() * 2,
                        SOL: 2 + Math.random() * 3,
                        NOVA: 2.5 + Math.random() * 4,
                      }))}
                      margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                      <XAxis
                        dataKey="day"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                        width={40}
                        tickFormatter={(value) => `${value}%`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(0, 0, 0, 0.8)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: '0.5rem',
                        }}
                        labelStyle={{ color: '#f3f4f6' }}
                        itemStyle={{ color: '#f3f4f6' }}
                        formatter={(value) => [`${typeof value === 'number' ? value.toFixed(2) : Number(value).toFixed(2)}%`, '']}
                        labelFormatter={(value) => `Day ${value}`}
                      />
                      <Legend
                        verticalAlign="top"
                        height={36}
                        formatter={(value) => <span style={{ color: '#f3f4f6' }}>{value}</span>}
                      />
                      <Line
                        type="monotone"
                        dataKey="BTC"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 6 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="ETH"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 6 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="SOL"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 6 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="NOVA"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
          
          {/* Market News Tab */}
          {activeTab === 'news' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold">Latest Crypto Market News</h2>
                <button className="px-3 py-1.5 bg-white/5 hover:bg-white/10 transition-colors rounded-lg text-sm flex items-center gap-1">
                  <RefreshCw className="h-3.5 w-3.5" /> Refresh
                </button>
              </div>
              
              <div className="space-y-5">
                {marketNews.map((news) => (
                  <div key={news.id} className="bg-white/5 rounded-xl border border-white/10 p-5 hover:bg-white/10 transition-colors">
                    <h3 className="text-lg font-medium mb-2">{news.title}</h3>
                    <div className="flex items-center gap-3 text-white/60 text-sm mb-3">
                      <span>{news.source}</span>
                      <span>•</span>
                      <span>{news.date}</span>
                    </div>
                    
                    <p className="text-white/80 mb-4">
                      {isNewsExpanded[news.id] ? news.fullText : news.snippet}
                    </p>
                    
                    <div className="flex justify-between items-center">
                      <button
                        className="text-purple-400 hover:text-purple-300 transition-colors text-sm"
                        onClick={() => setIsNewsExpanded({ ...isNewsExpanded, [news.id]: !isNewsExpanded[news.id] })}
                      >
                        {isNewsExpanded[news.id] ? "Show less" : "Read more"}
                      </button>
                      
                      <a 
                        href="#" 
                        className="text-sm text-white/60 hover:text-white transition-colors flex items-center gap-1"
                      >
                        View Source <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 bg-white/5 rounded-xl border border-white/10 p-5">
                <h2 className="text-lg font-medium mb-4">News Impact Analysis</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <div className="text-white/60 text-xs mb-1">Bullish News</div>
                    <div className="text-xl font-medium">68%</div>
                    <div className="text-green-400 text-xs">+12% from yesterday</div>
                  </div>
                  
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <div className="text-white/60 text-xs mb-1">Neutral News</div>
                    <div className="text-xl font-medium">22%</div>
                    <div className="text-white/60 text-xs">-8% from yesterday</div>
                  </div>
                  
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <div className="text-white/60 text-xs mb-1">Bearish News</div>
                    <div className="text-xl font-medium">10%</div>
                    <div className="text-red-400 text-xs">-4% from yesterday</div>
                  </div>
                </div>
                
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Regulatory", value: 28 },
                          { name: "Institutional", value: 24 },
                          { name: "Technology", value: 18 },
                          { name: "DeFi", value: 12 },
                          { name: "Market Analysis", value: 10 },
                          { name: "Other", value: 8 },
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        innerRadius={40}
                        fill="#8884d8"
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {[
                          "#8b5cf6", // purple
                          "#3b82f6", // blue
                          "#10b981", // green
                          "#f59e0b", // amber
                          "#ec4899", // pink
                          "#6b7280", // gray
                        ].map((color, index) => (
                          <Cell key={`cell-${index}`} fill={color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(0, 0, 0, 0.8)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: '0.5rem',
                        }}
                        formatter={(value) => [`${value}%`, 'News Share']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Custom Animations */}
      <style jsx global>{`
        @keyframes float {
          0% {
            transform: translateY(0) translateX(0);
          }
          25% {
            transform: translateY(-10px) translateX(10px);
          }
          50% {
            transform: translateY(0) translateX(20px);
          }
          75% {
            transform: translateY(10px) translateX(10px);
          }
          100% {
            transform: translateY(0) translateX(0);
          }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out forwards;
        }
        
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}

export default CryptoMarketDashboard;