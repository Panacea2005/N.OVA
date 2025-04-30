"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Canvas } from "@react-three/fiber"
import { Environment } from "@react-three/drei"
import dynamic from "next/dynamic"
import {
  ArrowUpRight,
  Copy,
  CreditCard,
  BarChart3,
  Clock,
  Shield,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Search,
  Wallet,
  Layers,
  Settings,
  ImageIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

const Navigation = dynamic(() => import("@/components/navigation"), {
  ssr: false,
})

const Footer = dynamic(() => import("@/components/footer"), {
  ssr: false,
})

const ParticleBackground = dynamic(() => import("@/components/3d/particle-background"), {
  ssr: false,
})

const HolographicSphere = dynamic(() => import("@/components/3d/holographic-sphere"), {
  ssr: false,
})

// Dynamic import for charts
const LineChart = dynamic(() => import("@/components/charts/line-chart"), {
  ssr: false,
})

const BarChart = dynamic(() => import("@/components/charts/bar-chart"), {
  ssr: false,
})

const PieChart = dynamic(() => import("@/components/charts/pie-chart"), {
  ssr: false,
})

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [showAllTransactions, setShowAllTransactions] = useState(false)
  const [chartPeriod, setChartPeriod] = useState("1M")

  // Mock user data
  const user = {
    name: "Alex Quantum",
    username: "alexq",
    avatar: "/placeholder.svg?height=100&width=100",
    address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
    balance: 2458.92,
    currency: "NOVA",
    joined: "March 2023",
    level: "Sovereign",
    verified: true,
  }

  // Mock transaction data
  const transactions = [
    {
      id: "tx1",
      type: "Received",
      amount: 250,
      from: "0x3Dc6...8F9a",
      to: user.address.substring(0, 6) + "..." + user.address.substring(user.address.length - 4),
      date: "2023-04-28T14:32:00",
      status: "completed",
      currency: "NOVA",
    },
    {
      id: "tx2",
      type: "Sent",
      amount: 75.5,
      from: user.address.substring(0, 6) + "..." + user.address.substring(user.address.length - 4),
      to: "0x8a71...2E4b",
      date: "2023-04-25T09:15:00",
      status: "completed",
      currency: "NOVA",
    },
    {
      id: "tx3",
      type: "Staked",
      amount: 500,
      from: user.address.substring(0, 6) + "..." + user.address.substring(user.address.length - 4),
      to: "Staking Pool",
      date: "2023-04-20T16:45:00",
      status: "completed",
      currency: "NOVA",
    },
    {
      id: "tx4",
      type: "Reward",
      amount: 12.75,
      from: "Protocol",
      to: user.address.substring(0, 6) + "..." + user.address.substring(user.address.length - 4),
      date: "2023-04-18T00:00:00",
      status: "completed",
      currency: "NOVA",
    },
    {
      id: "tx5",
      type: "Sent",
      amount: 150,
      from: user.address.substring(0, 6) + "..." + user.address.substring(user.address.length - 4),
      to: "0x2Fb3...9D7c",
      date: "2023-04-15T11:22:00",
      status: "pending",
      currency: "NOVA",
    },
    {
      id: "tx6",
      type: "Received",
      amount: 890,
      from: "0x6Ea2...1F3d",
      to: user.address.substring(0, 6) + "..." + user.address.substring(user.address.length - 4),
      date: "2023-04-10T08:17:00",
      status: "completed",
      currency: "NOVA",
    },
  ]

  // Mock stats data
  const stats = [
    { label: "Total Value", value: "$2,458.92", icon: <BarChart3 className="h-5 w-5" /> },
    { label: "Transactions", value: "24", icon: <CreditCard className="h-5 w-5" /> },
    { label: "Staked", value: "500 NOVA", icon: <Shield className="h-5 w-5" /> },
    { label: "Member Since", value: "Mar 2023", icon: <Clock className="h-5 w-5" /> },
  ]

  // Mock chart data
  const balanceHistory = {
    "1W": [
      { date: "Mon", value: 2100 },
      { date: "Tue", value: 2200 },
      { date: "Wed", value: 2150 },
      { date: "Thu", value: 2300 },
      { date: "Fri", value: 2250 },
      { date: "Sat", value: 2400 },
      { date: "Sun", value: 2458.92 },
    ],
    "1M": [
      { date: "Week 1", value: 1800 },
      { date: "Week 2", value: 2000 },
      { date: "Week 3", value: 2200 },
      { date: "Week 4", value: 2458.92 },
    ],
    "3M": [
      { date: "Jan", value: 1500 },
      { date: "Feb", value: 1800 },
      { date: "Mar", value: 2100 },
      { date: "Apr", value: 2458.92 },
    ],
    "1Y": [
      { date: "Q1", value: 1200 },
      { date: "Q2", value: 1600 },
      { date: "Q3", value: 2000 },
      { date: "Q4", value: 2458.92 },
    ],
  }

  // Mock assets data
  const assets = [
    { name: "NOVA", amount: 2458.92, value: 2458.92, percentage: 70 },
    { name: "ETH", amount: 0.25, value: 750, percentage: 20 },
    { name: "BTC", amount: 0.01, value: 350, percentage: 10 },
  ]

  // Mock staking data
  const stakingData = [
    {
      pool: "Alpha Pool",
      staked: 300,
      rewards: 8.5,
      apy: "12%",
      lockPeriod: "30 days",
      status: "active",
    },
    {
      pool: "Beta Pool",
      staked: 200,
      rewards: 4.25,
      apy: "8%",
      lockPeriod: "7 days",
      status: "active",
    },
  ]

  // Mock NFT data
  const nfts = [
    {
      id: "nft1",
      name: "Quantum Fragment #42",
      image: "/placeholder.svg?height=300&width=300",
      collection: "Quantum Fragments",
      acquired: "2023-03-15",
    },
    {
      id: "nft2",
      name: "Neural Pattern #17",
      image: "/placeholder.svg?height=300&width=300",
      collection: "Neural Patterns",
      acquired: "2023-02-28",
    },
    {
      id: "nft3",
      name: "Digital Soul #3",
      image: "/placeholder.svg?height=300&width=300",
      collection: "Digital Souls",
      acquired: "2023-04-05",
    },
  ]

  const displayedTransactions = showAllTransactions ? transactions : transactions.slice(0, 3)

  // Mock transaction activity by type
  const transactionsByType = [
    { name: "Received", value: 1140 },
    { name: "Sent", value: 225.5 },
    { name: "Staked", value: 500 },
    { name: "Rewards", value: 12.75 },
  ]

  // Asset allocation data for pie chart
  const assetAllocation = assets.map((asset) => ({
    name: asset.name,
    value: asset.value,
  }))

  return (
    <main className="relative min-h-screen bg-black text-white font-mono">
      {/* Background Gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-black via-black to-purple-950 opacity-80 z-0" />

      {/* Particle Background */}
      <ParticleBackground />

      {/* Navigation */}
      <Navigation />

      <div className="container mx-auto px-4 md:px-6 pt-24 pb-16 relative z-10">
        {/* Profile Header */}
        <div className="relative mb-12 border-b border-white/10 pb-8">
          {/* 3D Background Element */}
          <div className="absolute right-0 top-0 w-1/3 h-full opacity-30 pointer-events-none">
            <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
              <HolographicSphere />
              <Environment preset="night" />
            </Canvas>
          </div>

          <motion.div
            className="flex flex-col md:flex-row items-start md:items-center gap-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Avatar */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-purple-500/50 p-1 glassmorphic">
                <img
                  src={user.avatar || "/placeholder.svg"}
                  alt={user.name}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              {user.verified && (
                <div className="absolute bottom-0 right-0 bg-purple-500 rounded-full p-1">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              )}
            </motion.div>

            {/* User Info */}
            <div className="flex-1">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <h1 className="text-3xl md:text-4xl font-bold tracking-tighter mb-2">{user.name}</h1>
                <div className="flex items-center mb-4">
                  <span className="text-white/60 mr-2">@{user.username}</span>
                  <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-xs rounded-full">
                    {user.level}
                  </span>
                </div>
              </motion.div>

              <motion.div
                className="flex items-center mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <div className="flex-1 bg-white/5 backdrop-blur-md rounded-lg px-4 py-2 flex items-center">
                  <span className="text-white/60 text-sm mr-2">Wallet:</span>
                  <span className="text-sm font-mono">
                    {user.address.substring(0, 6)}...{user.address.substring(user.address.length - 4)}
                  </span>
                  <button className="ml-2 text-white/60 hover:text-white transition-colors">
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                <button className="ml-4 px-4 py-2 bg-white text-black text-sm uppercase tracking-widest hover:bg-white/90 transition-colors flex items-center">
                  Connect
                  <ArrowUpRight className="ml-1 h-4 w-4" />
                </button>
              </motion.div>
            </div>

            {/* Balance Card */}
            <motion.div
              className="w-full md:w-auto"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <div className="border border-white/10 backdrop-blur-md bg-white/5 relative overflow-hidden p-6">
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className="text-white/60 text-sm">Total Balance</p>
                      <h3 className="text-3xl font-bold">{user.balance.toLocaleString()}</h3>
                      <p className="text-purple-300">{user.currency}</p>
                    </div>
                    <div className="p-2 bg-white/10 rounded-full">
                      <CreditCard className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <button className="text-xs uppercase tracking-wider text-white/60 hover:text-white transition-colors flex items-center">
                      <ArrowUpRight className="mr-1 h-4 w-4" /> Send
                    </button>
                    <button className="text-xs uppercase tracking-wider text-white/60 hover:text-white transition-colors flex items-center">
                      Receive <ArrowUpRight className="ml-1 h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Tabs Navigation */}
        <div className="border-b border-white/10 mb-8">
          <div className="flex overflow-x-auto hide-scrollbar">
            {[
              { id: "overview", icon: <BarChart3 className="h-4 w-4 mr-2" /> },
              { id: "assets", icon: <Wallet className="h-4 w-4 mr-2" /> },
              { id: "transactions", icon: <CreditCard className="h-4 w-4 mr-2" /> },
              { id: "staking", icon: <Layers className="h-4 w-4 mr-2" /> },
              { id: "nfts", icon: <ImageIcon className="h-4 w-4 mr-2" /> },
              { id: "settings", icon: <Settings className="h-4 w-4 mr-2" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                className={cn(
                  "px-6 py-4 text-sm font-medium whitespace-nowrap capitalize transition-colors flex items-center",
                  activeTab === tab.id ? "text-white border-b-2 border-purple-500" : "text-white/60 hover:text-white",
                )}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                {tab.id}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-8">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Stats */}
              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <h2 className="text-xl font-bold mb-4">Account Overview</h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 mb-8">
                    {stats.map((stat, index) => (
                      <motion.div
                        key={stat.label}
                        className="border border-white/10 p-4"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                      >
                        <div className="flex items-center">
                          <div className="p-2 bg-white/10 rounded-full mr-3">{stat.icon}</div>
                          <div>
                            <p className="text-white/60 text-sm">{stat.label}</p>
                            <p className="text-lg font-bold">{stat.value}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <h2 className="text-xl font-bold mb-4">Asset Allocation</h2>
                  <div className="border border-white/10 p-4 mb-8">
                    <div className="h-64">
                      <PieChart data={assetAllocation} />
                    </div>
                  </div>

                  <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
                  <div className="space-y-2">
                    {["Send NOVA", "Receive NOVA", "Stake Tokens", "View History"].map((action, index) => (
                      <motion.button
                        key={action}
                        className="w-full text-left px-4 py-3 border border-white/10 hover:bg-white/5 transition-colors flex items-center justify-between"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                      >
                        <span>{action}</span>
                        <ArrowUpRight className="h-4 w-4" />
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Right Column - Charts and Transactions */}
              <div className="lg:col-span-2">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  {/* Balance Chart */}
                  <div className="mb-8 border border-white/10 p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold">Balance History</h2>
                      <div className="flex space-x-2">
                        {["1W", "1M", "3M", "1Y"].map((period) => (
                          <button
                            key={period}
                            className={cn(
                              "px-3 py-1 text-xs",
                              chartPeriod === period
                                ? "bg-white text-black"
                                : "bg-white/10 text-white hover:bg-white/20",
                            )}
                            onClick={() => setChartPeriod(period)}
                          >
                            {period}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="h-64">
                      <LineChart data={balanceHistory[chartPeriod as keyof typeof balanceHistory]} />
                    </div>
                  </div>

                  {/* Transaction Distribution */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div className="border border-white/10 p-6">
                      <h2 className="text-xl font-bold mb-4">Transaction Activity</h2>
                      <div className="h-64">
                        <BarChart data={transactionsByType} />
                      </div>
                    </div>

                    <div className="border border-white/10 p-6">
                      <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
                      <div className="space-y-4">
                        {transactions.slice(0, 3).map((tx) => (
                          <div key={tx.id} className="flex items-center justify-between border-b border-white/10 pb-3">
                            <div className="flex items-center">
                              <div
                                className={cn(
                                  "w-2 h-2 rounded-full mr-2",
                                  tx.type === "Received" || tx.type === "Reward" ? "bg-green-500" : "bg-blue-500",
                                )}
                              ></div>
                              <div>
                                <p className="text-sm font-medium">{tx.type}</p>
                                <p className="text-xs text-white/60">{new Date(tx.date).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p
                                className={cn(
                                  "text-sm font-medium",
                                  tx.type === "Received" || tx.type === "Reward" ? "text-green-400" : "",
                                )}
                              >
                                {tx.type === "Received" || tx.type === "Reward" ? "+" : ""}
                                {tx.amount} {tx.currency}
                              </p>
                            </div>
                          </div>
                        ))}
                        <Link
                          href="#"
                          className="text-xs text-white/60 hover:text-white flex items-center justify-center mt-4"
                          onClick={() => setActiveTab("transactions")}
                        >
                          View All Transactions <ArrowUpRight className="ml-1 h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Recent Transactions */}
                  <div className="border border-white/10">
                    <div className="p-6 border-b border-white/10">
                      <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold">Recent Transactions</h2>
                        <div className="relative">
                          <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" />
                          <input
                            type="text"
                            placeholder="Search transactions"
                            className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-white/10">
                            <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                              Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                              Amount
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                              From/To
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                              Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {displayedTransactions.map((tx, index) => (
                            <motion.tr
                              key={tx.id}
                              className="border-b border-white/5 hover:bg-white/5 transition-colors"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div
                                    className={cn(
                                      "w-2 h-2 rounded-full mr-2",
                                      tx.type === "Received" || tx.type === "Reward" ? "bg-green-500" : "bg-blue-500",
                                    )}
                                  ></div>
                                  <span>{tx.type}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={cn(
                                    "font-medium",
                                    tx.type === "Received" || tx.type === "Reward" ? "text-green-400" : "",
                                  )}
                                >
                                  {tx.type === "Received" || tx.type === "Reward" ? "+" : ""}
                                  {tx.amount} {tx.currency}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-white/60">
                                  {tx.type === "Received" || tx.type === "Reward" ? "From: " : "To: "}
                                  {tx.type === "Received" || tx.type === "Reward" ? tx.from : tx.to}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-white/60">
                                {new Date(tx.date).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={cn(
                                    "px-2 py-1 text-xs rounded-full",
                                    tx.status === "completed"
                                      ? "bg-green-500/20 text-green-300"
                                      : "bg-yellow-500/20 text-yellow-300",
                                  )}
                                >
                                  {tx.status === "completed" ? (
                                    <div className="flex items-center">
                                      <CheckCircle2 className="h-3 w-3 mr-1" />
                                      <span>Completed</span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center">
                                      <AlertCircle className="h-3 w-3 mr-1" />
                                      <span>Pending</span>
                                    </div>
                                  )}
                                </span>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="p-4 border-t border-white/10">
                      <button
                        className="w-full py-2 text-center text-white/60 hover:text-white flex items-center justify-center"
                        onClick={() => setShowAllTransactions(!showAllTransactions)}
                      >
                        {showAllTransactions ? (
                          <>
                            Show Less <ChevronUp className="ml-1 h-4 w-4" />
                          </>
                        ) : (
                          <>
                            Show All <ChevronDown className="ml-1 h-4 w-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          )}

          {/* Assets Tab */}
          {activeTab === "assets" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <div className="border border-white/10 p-6 mb-8">
                  <h2 className="text-xl font-bold mb-6">Asset Allocation</h2>
                  <div className="h-64">
                    <PieChart data={assetAllocation} />
                  </div>
                </div>

                <div className="border border-white/10 p-6">
                  <h2 className="text-xl font-bold mb-4">Market Overview</h2>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-white/60">Market Cap</span>
                      <span className="font-bold">$2.1T</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/60">24h Volume</span>
                      <span className="font-bold">$78.5B</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/60">BTC Dominance</span>
                      <span className="font-bold">42.3%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/60">ETH Gas</span>
                      <span className="font-bold">25 Gwei</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2">
                <div className="border border-white/10 p-6 mb-8">
                  <h2 className="text-xl font-bold mb-6">Your Assets</h2>
                  <div className="space-y-4">
                    {assets.map((asset) => (
                      <div key={asset.name} className="border border-white/10 p-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mr-4">
                              {asset.name.charAt(0)}
                            </div>
                            <div>
                              <h3 className="font-bold">{asset.name}</h3>
                              <p className="text-sm text-white/60">{asset.amount} tokens</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">${asset.value.toLocaleString()}</p>
                            <p className="text-sm text-white/60">{asset.percentage}% of portfolio</p>
                          </div>
                        </div>
                        <div className="mt-4 w-full bg-white/10 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-purple-500 h-full rounded-full"
                            style={{ width: `${asset.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border border-white/10 p-6">
                  <h2 className="text-xl font-bold mb-6">Price Charts</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="border border-white/10 p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold">NOVA/USD</h3>
                        <span className="text-green-400">+5.2%</span>
                      </div>
                      <div className="h-48">
                        <LineChart data={balanceHistory["1M"]} />
                      </div>
                    </div>
                    <div className="border border-white/10 p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold">ETH/USD</h3>
                        <span className="text-green-400">+2.8%</span>
                      </div>
                      <div className="h-48">
                        <LineChart data={balanceHistory["1W"]} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Staking Tab */}
          {activeTab === "staking" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <div className="border border-white/10 p-6 mb-8">
                  <h2 className="text-xl font-bold mb-4">Staking Overview</h2>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-white/60">Total Staked</span>
                      <span className="font-bold">500 NOVA</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/60">Total Rewards</span>
                      <span className="font-bold">12.75 NOVA</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/60">Average APY</span>
                      <span className="font-bold">10.5%</span>
                    </div>
                  </div>
                </div>

                <div className="border border-white/10 p-6">
                  <h2 className="text-xl font-bold mb-4">Rewards Chart</h2>
                  <div className="h-64">
                    <BarChart
                      data={[
                        { name: "Week 1", value: 2.5 },
                        { name: "Week 2", value: 3.2 },
                        { name: "Week 3", value: 3.5 },
                        { name: "Week 4", value: 3.55 },
                      ]}
                    />
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2">
                <div className="border border-white/10 p-6 mb-8">
                  <h2 className="text-xl font-bold mb-6">Active Staking Pools</h2>
                  <div className="space-y-6">
                    {stakingData.map((pool) => (
                      <div key={pool.pool} className="border border-white/10 p-4">
                        <div className="flex justify-between items-center mb-4">
                          <div>
                            <h3 className="font-bold text-lg">{pool.pool}</h3>
                            <p className="text-sm text-white/60">{pool.lockPeriod} lock period</p>
                          </div>
                          <div className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full">
                            {pool.status}
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-white/60 text-sm">Staked</p>
                            <p className="font-bold">{pool.staked} NOVA</p>
                          </div>
                          <div>
                            <p className="text-white/60 text-sm">Rewards</p>
                            <p className="font-bold">{pool.rewards} NOVA</p>
                          </div>
                          <div>
                            <p className="text-white/60 text-sm">APY</p>
                            <p className="font-bold">{pool.apy}</p>
                          </div>
                        </div>
                        <div className="flex space-x-4">
                          <button className="px-4 py-2 bg-white text-black text-xs uppercase tracking-widest hover:bg-white/90 transition-colors">
                            Claim Rewards
                          </button>
                          <button className="px-4 py-2 border border-white/20 text-xs uppercase tracking-widest hover:bg-white/10 transition-colors">
                            Unstake
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border border-white/10 p-6">
                  <h2 className="text-xl font-bold mb-6">Available Staking Pools</h2>
                  <div className="space-y-6">
                    <div className="border border-white/10 p-4">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <h3 className="font-bold text-lg">Gamma Pool</h3>
                          <p className="text-sm text-white/60">90 days lock period</p>
                        </div>
                        <div className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full">15% APY</div>
                      </div>
                      <div className="mb-4">
                        <p className="text-white/60 text-sm mb-2">
                          Stake your NOVA tokens in our high-yield Gamma pool with a 90-day lock period.
                        </p>
                      </div>
                      <button className="px-4 py-2 bg-white text-black text-xs uppercase tracking-widest hover:bg-white/90 transition-colors">
                        Stake Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* NFTs Tab */}
          {activeTab === "nfts" && (
            <div>
              <div className="border border-white/10 p-6 mb-8">
                <h2 className="text-xl font-bold mb-6">Your NFT Collection</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {nfts.map((nft) => (
                    <div key={nft.id} className="border border-white/10 overflow-hidden">
                      <div className="aspect-square">
                        <img
                          src={nft.image || "/placeholder.svg"}
                          alt={nft.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold">{nft.name}</h3>
                        <p className="text-sm text-white/60 mb-2">{nft.collection}</p>
                        <p className="text-xs text-white/40">Acquired: {new Date(nft.acquired).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-white/10 p-6">
                <h2 className="text-xl font-bold mb-6">NFT Marketplace</h2>
                <div className="text-center py-8">
                  <p className="text-white/60 mb-4">Explore and trade NFTs in our marketplace.</p>
                  <button className="px-6 py-3 bg-white text-black text-sm uppercase tracking-widest hover:bg-white/90 transition-colors">
                    Launch Marketplace
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <div className="border border-white/10 p-6">
                  <h2 className="text-xl font-bold mb-6">Account Settings</h2>
                  <div className="space-y-4">
                    <button className="w-full text-left px-4 py-3 border border-white/10 hover:bg-white/5 transition-colors flex items-center justify-between">
                      <span>Profile Settings</span>
                      <ArrowUpRight className="h-4 w-4" />
                    </button>
                    <button className="w-full text-left px-4 py-3 border border-white/10 hover:bg-white/5 transition-colors flex items-center justify-between">
                      <span>Security</span>
                      <ArrowUpRight className="h-4 w-4" />
                    </button>
                    <button className="w-full text-left px-4 py-3 border border-white/10 hover:bg-white/5 transition-colors flex items-center justify-between">
                      <span>Notifications</span>
                      <ArrowUpRight className="h-4 w-4" />
                    </button>
                    <button className="w-full text-left px-4 py-3 border border-white/10 hover:bg-white/5 transition-colors flex items-center justify-between">
                      <span>Connected Wallets</span>
                      <ArrowUpRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2">
                <div className="border border-white/10 p-6">
                  <h2 className="text-xl font-bold mb-6">Profile Settings</h2>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-white/60 text-sm mb-2">Display Name</label>
                      <input
                        type="text"
                        defaultValue={user.name}
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-white/60 text-sm mb-2">Username</label>
                      <input
                        type="text"
                        defaultValue={user.username}
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-white/60 text-sm mb-2">Email</label>
                      <input
                        type="email"
                        defaultValue="alex@example.com"
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-white/60 text-sm mb-2">Profile Image</label>
                      <div className="flex items-center">
                        <img
                          src={user.avatar || "/placeholder.svg"}
                          alt={user.name}
                          className="w-16 h-16 rounded-full object-cover mr-4"
                        />
                        <button className="px-4 py-2 border border-white/20 text-xs uppercase tracking-widest hover:bg-white/10 transition-colors">
                          Change Image
                        </button>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-white/10">
                      <button className="px-6 py-3 bg-white text-black text-sm uppercase tracking-widest hover:bg-white/90 transition-colors">
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </main>
  )
}
