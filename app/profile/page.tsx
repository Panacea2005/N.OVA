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
import { usePhantom } from "@/hooks/use-phantom"

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
  const { walletAddress, balance, isConnected } = usePhantom()

  // Remove mock data
  const displayName = walletAddress || ""
  const username = walletAddress || ""
  const avatarUrl = walletAddress ? `/placeholder.svg?height=100&width=100` : "/placeholder.svg"
  const avatarAlt = walletAddress || "Wallet"

  if (!isConnected) {
    return (
      <main className="relative min-h-screen bg-black text-white font-mono">
        <div className="fixed inset-0 bg-gradient-to-br from-black via-black to-purple-950 opacity-80 z-0" />
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
          <h1 className="text-4xl font-bold mb-8">Please Connect Your Wallet</h1>
          <p className="text-xl text-gray-400 mb-8">Connect your Phantom wallet to view your profile</p>
          <Link href="/" className="px-6 py-3 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors">
            Go to Home
          </Link>
        </div>
      </main>
    )
  }

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
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} />
              <HolographicSphere />
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
                  src={walletAddress ? `/placeholder.svg?height=100&width=100` : "/placeholder.svg"}
                  alt={walletAddress || "Wallet"}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
            </motion.div>

            {/* User Info */}
            <div className="flex-1">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <h1 className="text-3xl md:text-4xl font-bold tracking-tighter mb-2">{walletAddress || "Wallet"}</h1>
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
                    {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
                  </span>
                  <button
                    onClick={() => navigator.clipboard.writeText(walletAddress || '')}
                    className="ml-2 text-white/60 hover:text-white transition-colors"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
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
                      <h3 className="text-3xl font-bold">{balance} SOL</h3>
                    </div>
                    <div className="p-2 bg-white/10 rounded-full">
                      <CreditCard className="h-6 w-6" />
                    </div>
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
                  <h2 className="text-xl font-bold mb-4">Wallet Overview</h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 mb-8">
                    <div className="border border-white/10 p-4">
                      <div className="flex items-center">
                        <div className="p-2 bg-white/10 rounded-full mr-3">
                          <BarChart3 className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-white/60 text-sm">Total Value</p>
                          <p className="text-lg font-bold">{balance} SOL</p>
                        </div>
                      </div>
                    </div>

                    <div className="border border-white/10 p-4">
                      <div className="flex items-center">
                        <div className="p-2 bg-white/10 rounded-full mr-3">
                          <Shield className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-white/60 text-sm">Network</p>
                          <p className="text-lg font-bold">Solana</p>
                        </div>
                      </div>
                    </div>
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
                    </div>
                    <div className="h-64">
                      <LineChart data={[{ date: "Today", value: balance }]} />
                    </div>
                  </div>

                  {/* Transaction Distribution */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div className="border border-white/10 p-6">
                      <h2 className="text-xl font-bold mb-4">Transaction Activity</h2>
                      <div className="h-64">
                        <BarChart data={[{ name: "Received", value: balance }, { name: "Sent", value: 0 }]} />
                      </div>
                    </div>

                    <div className="border border-white/10 p-6">
                      <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                          <div className="flex items-center">
                            <div
                              className="w-2 h-2 rounded-full mr-2 bg-green-500"
                            ></div>
                            <div>
                              <p className="text-sm font-medium">Received</p>
                              <p className="text-xs text-white/60">{new Date().toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-green-400">+{balance} SOL</p>
                          </div>
                        </div>
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
                              Date
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div
                                  className="w-2 h-2 rounded-full mr-2 bg-green-500"
                                ></div>
                                <span>Received</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="font-medium text-green-400">+{balance} SOL</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-white/60">
                              {new Date().toLocaleDateString()}
                            </td>
                          </tr>
                        </tbody>
                      </table>
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
                    <PieChart data={[{ name: "SOL", value: balance }]} />
                  </div>
                </div>

                <div className="border border-white/10 p-6">
                  <h2 className="text-xl font-bold mb-4">Market Overview</h2>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-white/60">Market Cap</span>
                      <span className="font-bold">{balance} SOL</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/60">24h Volume</span>
                      <span className="font-bold">0 SOL</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/60">BTC Dominance</span>
                      <span className="font-bold">0%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/60">ETH Gas</span>
                      <span className="font-bold">0 Gwei</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2">
                <div className="border border-white/10 p-6 mb-8">
                  <h2 className="text-xl font-bold mb-6">Your Assets</h2>
                  <div className="space-y-4">
                    <div className="border border-white/10 p-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mr-4">
                            <span className="text-2xl font-bold">
                              {walletAddress?.slice(0, 2).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-bold">SOL</h3>
                            <p className="text-sm text-white/60">{balance} SOL</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">${balance * 20}</p>
                        </div>
                      </div>
                      <div className="mt-4 w-full bg-white/10 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-purple-500 h-full rounded-full"
                          style={{ width: "100%" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border border-white/10 p-6">
                  <h2 className="text-xl font-bold mb-6">Price Charts</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="border border-white/10 p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold">SOL/USD</h3>
                        <span className="text-green-400">+0.0%</span>
                      </div>
                      <div className="h-48">
                        <LineChart data={[{ date: "Today", value: balance }]} />
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
                      <span className="font-bold">{balance} SOL</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/60">Total Rewards</span>
                      <span className="font-bold">0 SOL</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/60">Average APY</span>
                      <span className="font-bold">0%</span>
                    </div>
                  </div>
                </div>

                <div className="border border-white/10 p-6">
                  <h2 className="text-xl font-bold mb-4">Rewards Chart</h2>
                  <div className="h-64">
                    <BarChart
                      data={[
                        { name: "Today", value: 0 },
                      ]}
                    />
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2">
                <div className="border border-white/10 p-6 mb-8">
                  <h2 className="text-xl font-bold mb-6">Active Staking Pools</h2>
                  <div className="space-y-6">
                    <div className="border border-white/10 p-4">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <h3 className="font-bold text-lg">SOL Staking</h3>
                          <p className="text-sm text-white/60">0% APY</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-white/60 text-sm">Staked</p>
                          <p className="font-bold">{balance} SOL</p>
                        </div>
                        <div>
                          <p className="text-white/60 text-sm">Rewards</p>
                          <p className="font-bold">0 SOL</p>
                        </div>
                        <div>
                          <p className="text-white/60 text-sm">APY</p>
                          <p className="font-bold">0%</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border border-white/10 p-6">
                  <h2 className="text-xl font-bold mb-6">Available Staking Pools</h2>
                  <div className="space-y-6">
                    <div className="border border-white/10 p-4">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <h3 className="font-bold text-lg">Gamma Pool</h3>
                          <p className="text-sm text-white/60">0% APY</p>
                        </div>
                      </div>
                      <div className="mb-4">
                        <p className="text-white/60 text-sm mb-2">
                          Stake your SOL tokens in our high-yield Gamma pool with a 0% APY.
                        </p>
                      </div>
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
                  {/* NFT cards would be populated here */}
                </div>
              </div>

              <div className="border border-white/10 p-6">
                <h2 className="text-xl font-bold mb-6">NFT Marketplace</h2>
                <div className="text-center py-8">
                  <p className="text-white/60 mb-4">Explore and trade NFTs in our marketplace.</p>
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
                        defaultValue={displayName}
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 focus:outline-none focus:ring-1 focus:ring-purple-500"
                        disabled
                      />
                    </div>
                    <div>
                      <label className="block text-white/60 text-sm mb-2">Username</label>
                      <input
                        type="text"
                        defaultValue={username}
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 focus:outline-none focus:ring-1 focus:ring-purple-500"
                        disabled
                      />
                    </div>
                    <div>
                      <label className="block text-white/60 text-sm mb-2">Wallet Address</label>
                      <input
                        type="text"
                        defaultValue={walletAddress}
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 focus:outline-none focus:ring-1 focus:ring-purple-500"
                        disabled
                      />
                    </div>
                    <div>
                      <label className="block text-white/60 text-sm mb-2">Profile Image</label>
                      <div className="flex items-center">
                        <img
                          src={avatarUrl}
                          alt={avatarAlt}
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
