"use client";

import { useState, useEffect } from "react";
import { usePhantom } from "@/hooks/use-phantom";
import { ConnectWalletButton } from "@/components/ui/connect-wallet-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import Navigation from "@/components/navigation";

// Dynamically load tab components
const CopyTradingTab = dynamic(() => import("./copy-trading-tab"), {
    ssr: false,
    loading: () => <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-pulse text-purple-400">Loading Copy Trading...</div>
    </div>
});

const SentimentTab = dynamic(() => import("@/app/dashboard/sentiment-tab"), {
    ssr: false,
    loading: () => <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-pulse text-purple-400">Loading Sentiment Analysis...</div>
    </div>
});

const AIInsightsTab = dynamic(() => import("@/app/dashboard/ai-insights-tab"), {
    ssr: false,
    loading: () => <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-pulse text-purple-400">Loading AI Insights...</div>
    </div>
});

// Add the new Solana Metrics Tab
const SolanaMetricsTab = dynamic(() => import("@/app/dashboard/solana-metrics-tab"), {
    ssr: false,
    loading: () => <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-pulse text-purple-400">Loading Solana Metrics...</div>
    </div>
});

export default function Dashboard() {
    const [mounted, setMounted] = useState(false);
    const { isConnected } = usePhantom();

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    if (!isConnected) {
        return (
            <main className="relative min-h-screen bg-black text-white font-mono">
                <div className="fixed inset-0 bg-gradient-to-br from-black via-black to-purple-950 opacity-80 z-0" />
                <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
                    <h1 className="text-4xl font-bold mb-8">NOVA Dashboard</h1>
                    <p className="text-xl text-gray-400 mb-8">
                        Connect your Phantom wallet to access the dashboard
                    </p>
                    <ConnectWalletButton />
                </div>
            </main>
        );
    }

    return (
        <main className="relative min-h-screen bg-black text-white">
            {/* Background Gradient */}
            <div className="fixed inset-0 bg-gradient-to-br from-black via-black to-purple-950 opacity-80 z-0" />

            {/* Main Content */}
            <div className="relative z-10 p-4 md:p-6">
                <Navigation />

                <div className="py-6">
                    <h1 className="text-3xl font-bold text-white">Solana Dashboard</h1>
                    <p className="text-gray-400 mt-1">Real-time analytics and insights</p>
                </div>

                {/* Main Dashboard Content */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <Tabs defaultValue="solana-metrics" className="w-full">
                        <TabsList className="flex w-full bg-black/40 backdrop-blur-sm border-b border-purple-900/30 p-0 h-auto">
                            <TabsTrigger
                                value="solana-metrics"
                                className="flex-1 py-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-purple-500"
                            >
                                Solana Metrics
                            </TabsTrigger>
                            <TabsTrigger
                                value="sentiment"
                                className="flex-1 py-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-purple-500"
                            >
                                Market Sentiment
                            </TabsTrigger>
                            <TabsTrigger
                                value="ai-insights"
                                className="flex-1 py-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-purple-500"
                            >
                                AI Insights
                            </TabsTrigger>
                            <TabsTrigger
                                value="copy-trading"
                                className="flex-1 py-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-purple-500"
                            >
                                Copy Trading
                            </TabsTrigger>
                        </TabsList>

                        <div className="bg-black/20 backdrop-blur-sm p-4 md:p-6">
                            <TabsContent value="solana-metrics" className="mt-0">
                                <SolanaMetricsTab />
                            </TabsContent>

                            <TabsContent value="sentiment" className="mt-0">
                                <SentimentTab />
                            </TabsContent>

                            <TabsContent value="ai-insights" className="mt-0">
                                <AIInsightsTab />
                            </TabsContent>

                            <TabsContent value="copy-trading" className="mt-0">
                                <CopyTradingTab />
                            </TabsContent>
                        </div>
                    </Tabs>
                </motion.div>

                <div className="mt-4 text-xs text-gray-500 text-center">
                    <p>Data provided by Solana RPC and CoinGecko</p>
                </div>
            </div>
        </main>
    );
} 