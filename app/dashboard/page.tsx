"use client";

import { useState, useEffect } from "react";
import { usePhantom } from "@/hooks/use-phantom";
import { ConnectWalletButton } from "@/components/ui/connect-wallet-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";

// Dynamically load tab components
const CopyTradingTab = dynamic(() => import("./copy-trading-tab"), {
    ssr: false,
    loading: () => <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-pulse text-white/70">Loading Copy Trading...</div>
    </div>
});

const SentimentTab = dynamic(() => import("@/app/dashboard/sentiment-tab"), {
    ssr: false,
    loading: () => <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-pulse text-white/70">Loading Sentiment Analysis...</div>
    </div>
});

const AIInsightsTab = dynamic(() => import("@/app/dashboard/ai-insights-tab"), {
    ssr: false,
    loading: () => <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-pulse text-white/70">Loading AI Insights...</div>
    </div>
});

// Add the new Solana Metrics Tab
const SolanaMetricsTab = dynamic(() => import("@/app/dashboard/solana-metrics-tab"), {
    ssr: false,
    loading: () => <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-pulse text-white/70">Loading Solana Metrics...</div>
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
                <div className="fixed inset-0 bg-black z-0" />
                <div className="fixed inset-0 z-0 opacity-10"
                    style={{
                        backgroundImage:
                            "linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px)",
                        backgroundSize: "40px 40px",
                    }}
                />
                <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
                    <h1 className="text-4xl font-light mb-8">NOVA Dashboard</h1>
                    <p className="text-white/70 uppercase mb-8">
                        Connect your Phantom wallet to access the dashboard
                    </p>
                    <ConnectWalletButton />
                </div>
            </main>
        );
    }

    return (
        <main className="relative min-h-screen bg-black text-white font-mono">
            {/* Background */}
            <div className="fixed inset-0 bg-black z-0" />
            <div className="fixed inset-0 z-0 opacity-10"
                style={{
                    backgroundImage:
                        "linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                }}
            />

            {/* Navigation */}
            <Navigation />

            <div className="container mx-auto px-2 pt-24 pb-16 relative z-10">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                        className="mb-16"
                    >
                        <h1 className="text-8xl font-light mb-6">DASHBOARD</h1>
                        <p className="text-white/70 uppercase max-w-4xl">
                            REAL-TIME ANALYTICS AND INSIGHTS FOR YOUR SOLANA WALLET
                        </p>
                    </motion.div>

                    {/* Main Dashboard Content */}
                    <div className="border border-white/30 p-0.5 mb-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.2 }}
                            className="border border-white/10 px-6 py-8"
                        >
                            <Tabs defaultValue="solana-metrics" className="w-full">
                                <TabsList className="grid grid-cols-4 mb-8">
                                    <TabsTrigger 
                                        value="solana-metrics" 
                                        className="py-3 data-[state=active]:bg-white/5 data-[state=active]:border-b data-[state=active]:border-white text-white/70 data-[state=active]:text-white"
                                    >
                                        SOLANA METRICS
                                    </TabsTrigger>
                                    <TabsTrigger 
                                        value="sentiment" 
                                        className="py-3 data-[state=active]:bg-white/5 data-[state=active]:border-b data-[state=active]:border-white text-white/70 data-[state=active]:text-white"
                                    >
                                        MARKET SENTIMENT
                                    </TabsTrigger>
                                    <TabsTrigger 
                                        value="ai-insights" 
                                        className="py-3 data-[state=active]:bg-white/5 data-[state=active]:border-b data-[state=active]:border-white text-white/70 data-[state=active]:text-white"
                                    >
                                        AI INSIGHTS
                                    </TabsTrigger>
                                    <TabsTrigger 
                                        value="copy-trading" 
                                        className="py-3 data-[state=active]:bg-white/5 data-[state=active]:border-b data-[state=active]:border-white text-white/70 data-[state=active]:text-white"
                                    >
                                        COPY TRADING
                                    </TabsTrigger>
                                </TabsList>

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
                            </Tabs>
                        </motion.div>
                    </div>

                    <div className="text-xs text-white/40 text-center">
                        <p>Data provided by Solana RPC and CoinGecko</p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <Footer />
        </main>
    );
}