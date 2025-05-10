"use client";

import { useState, useEffect, useRef } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import LineChart from "@/components/charts/line-chart";
import BarChart from "@/components/charts/bar-chart";
import PieChart from "@/components/charts/pie-chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import {
    getSolanaData,
    createNetworkStatsWebSocket,
    NetworkStatsData,
    createTokenPriceWebSocket,
    PriceUpdateData
} from "./solana-api-service";

// Interfaces for the component
interface TransactionMetrics {
    count: number;
    tps: number;
    avgFee: number;
    successRate: number;
    history: { name: string; value: number }[];
}

interface ValidatorInfo {
    active: number;
    total: number;
    delinquent: number;
    distribution: { name: string; value: number }[];
}

interface BlockchainStats {
    currentSlot: number;
    finalized: number;
    blockTime: number;
    epoch: {
        current: number;
        slot: number;
        progress: number;
    };
}

// Real-time Solana Stats Component
function SolanaNetworkStatus() {
    const [networkStats, setNetworkStats] = useState<NetworkStatsData>({
        tps: 0,
        slot: 0,
        latency: 0,
        status: 'up',
        timestamp: Date.now(),
    });
    const [isConnected, setIsConnected] = useState(false);
    const networkStatsSocketRef = useRef<ReturnType<typeof createNetworkStatsWebSocket> | null>(null);

    useEffect(() => {
        // Initial data fetch
        const fetchInitialData = async () => {
            try {
                const solanaData = await getSolanaData();
                setNetworkStats({
                    tps: solanaData.networkHealth.tps,
                    slot: solanaData.networkHealth.slot,
                    latency: 1.0, // Default value until real-time data
                    status: solanaData.networkHealth.health === 'up' ? 'up' : 'degraded',
                    timestamp: Date.now(),
                });
            } catch (error) {
                console.error("Error fetching initial network data:", error);
            }
        };

        fetchInitialData();

        // Set up WebSocket for real-time updates
        networkStatsSocketRef.current = createNetworkStatsWebSocket(
            (data: NetworkStatsData) => {
                setNetworkStats(data);
                setIsConnected(true);
            }
        );

        return () => {
            if (networkStatsSocketRef.current) {
                networkStatsSocketRef.current.disconnect();
            }
        };
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'up': return "text-green-400";
            case 'degraded': return "text-yellow-400";
            case 'down': return "text-red-400";
            default: return "text-gray-400";
        }
    };

    return (
        <Card className="glassmorphic border-glow">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">Solana Network Status</CardTitle>
                    {isConnected && (
                        <div className="flex items-center">
                            <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse mr-1"></span>
                            <span className="text-xs text-gray-400">Live</span>
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-black/30 p-3 rounded-lg border border-purple-900/30">
                        <div className="text-sm text-gray-400">TPS</div>
                        <div className="text-2xl font-bold">{networkStats.tps.toLocaleString()}</div>
                    </div>
                    <div className="bg-black/30 p-3 rounded-lg border border-purple-900/30">
                        <div className="text-sm text-gray-400">Current Slot</div>
                        <div className="text-2xl font-bold">{networkStats.slot.toLocaleString()}</div>
                    </div>
                    <div className="bg-black/30 p-3 rounded-lg border border-purple-900/30">
                        <div className="text-sm text-gray-400">Latency</div>
                        <div className="text-2xl font-bold">{networkStats.latency.toFixed(2)}s</div>
                    </div>
                    <div className="bg-black/30 p-3 rounded-lg border border-purple-900/30">
                        <div className="text-sm text-gray-400">Status</div>
                        <div className={`text-2xl font-bold ${getStatusColor(networkStats.status)}`}>
                            {networkStats.status === 'up' ? 'Healthy' :
                                networkStats.status === 'degraded' ? 'Degraded' : 'Down'}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// Token Tracker Component
function TokenTracker() {
    const [tokenPrices, setTokenPrices] = useState<Record<string, PriceUpdateData>>({});
    const [isConnected, setIsConnected] = useState(false);
    const tokenPriceSocketRef = useRef<ReturnType<typeof createTokenPriceWebSocket> | null>(null);

    // Tokens to track - major Solana ecosystem tokens
    const tokens = ['SOL', 'JTO', 'BONK', 'JUP', 'RAY', 'PYTH', 'RENDER'];

    useEffect(() => {
        // Default initial data
        const initialData: Record<string, PriceUpdateData> = {};
        tokens.forEach(token => {
            initialData[token] = {
                symbol: token,
                price: 0,
                change24h: 0,
                volume24h: 0,
                marketCap: 0,
                timestamp: Date.now()
            };
        });
        setTokenPrices(initialData);

        // Set up WebSocket for token price updates
        tokenPriceSocketRef.current = createTokenPriceWebSocket(
            tokens,
            (data: Record<string, PriceUpdateData>) => {
                setTokenPrices(prev => ({
                    ...prev,
                    ...data
                }));
                setIsConnected(true);
            }
        );

        return () => {
            if (tokenPriceSocketRef.current) {
                tokenPriceSocketRef.current.disconnect();
            }
        };
    }, []);

    return (
        <Card className="glassmorphic border-glow">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">Solana Ecosystem Tokens</CardTitle>
                    {isConnected && (
                        <div className="flex items-center">
                            <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse mr-1"></span>
                            <span className="text-xs text-gray-400">Live</span>
                        </div>
                    )}
                </div>
                <CardDescription>Real-time price data for top Solana tokens</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {tokens.map(symbol => {
                        const data = tokenPrices[symbol];
                        const changeColor = data?.change24h > 0 ? "text-green-400" :
                            data?.change24h < 0 ? "text-red-400" : "text-gray-400";
                        const changeArrow = data?.change24h > 0 ? "↑" :
                            data?.change24h < 0 ? "↓" : "";

                        return (
                            <div key={symbol} className="bg-black/30 p-3 rounded-lg border border-purple-900/30">
                                <div className="flex justify-between">
                                    <div className="font-bold">{symbol}</div>
                                    {data?.price > 0 && (
                                        <div className={changeColor}>
                                            {changeArrow} {Math.abs(data?.change24h || 0).toFixed(2)}%
                                        </div>
                                    )}
                                </div>
                                <div className="text-xl mt-1 font-bold">
                                    {data?.price > 0 ?
                                        `$${data.price.toLocaleString(undefined, {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 4
                                        })}` :
                                        <div className="h-6 flex items-center">
                                            <div className="animate-pulse text-purple-400 text-sm">Loading...</div>
                                        </div>
                                    }
                                </div>
                                {data?.volume24h > 0 && (
                                    <div className="text-xs text-gray-400 mt-1">
                                        Vol: ${(data.volume24h / 1000000).toFixed(2)}M
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}

// Transaction Activity Component
function TransactionActivity() {
    // Simulated data for transaction chart - would be replaced with real data in production
    const [txData, setTxData] = useState<{ name: string; value: number }[]>([]);

    useEffect(() => {
        // Generate sample data for demo purposes
        const generateSampleData = () => {
            const now = new Date();
            const data = [];

            for (let i = 12; i >= 0; i--) {
                const time = new Date(now.getTime() - i * 5 * 60000);
                const hours = time.getHours();
                const minutes = time.getMinutes();
                const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

                // Random TPS between 2000-4500
                const value = Math.floor(2000 + Math.random() * 2500);

                data.push({
                    name: formattedTime,
                    value: value
                });
            }

            setTxData(data);
        };

        generateSampleData();

        // Update chart data every 30 seconds
        const interval = setInterval(() => {
            setTxData(prevData => {
                const newData = [...prevData.slice(1)];
                const now = new Date();
                const formattedTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

                newData.push({
                    name: formattedTime,
                    value: Math.floor(2000 + Math.random() * 2500)
                });

                return newData;
            });
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    return (
        <Card className="glassmorphic border-glow">
            <CardHeader>
                <CardTitle>Transaction Activity</CardTitle>
                <CardDescription>Transactions per second over time</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-80">
                    <LineChart data={txData} />
                </div>
            </CardContent>
        </Card>
    );
}

// Main component export
export default function SolanaMetricsTab() {
    return (
        <div className="space-y-6">
            <SolanaNetworkStatus />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TokenTracker />
                <TransactionActivity />
            </div>

            <Card className="glassmorphic border-glow">
                <CardHeader>
                    <CardTitle>Solana Ecosystem Health</CardTitle>
                    <CardDescription>Key metrics for the Solana blockchain</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="validators">
                        <TabsList className="mb-4">
                            <TabsTrigger value="validators">Validators</TabsTrigger>
                            <TabsTrigger value="programs">Programs</TabsTrigger>
                            <TabsTrigger value="accounts">Accounts</TabsTrigger>
                        </TabsList>

                        <TabsContent value="validators">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <h3 className="text-lg font-medium mb-2">Validator Distribution</h3>
                                    <div className="h-60">
                                        <PieChart data={[
                                            { name: 'Stake Labs', value: 15 },
                                            { name: 'Chorus One', value: 12 },
                                            { name: 'Everstake', value: 10 },
                                            { name: 'Figment', value: 8 },
                                            { name: 'Other', value: 55 },
                                        ]} />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium mb-2">Validator Stats</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-black/30 p-3 rounded-lg border border-purple-900/30">
                                            <div className="text-sm text-gray-400">Active</div>
                                            <div className="text-2xl font-bold">1,782</div>
                                        </div>
                                        <div className="bg-black/30 p-3 rounded-lg border border-purple-900/30">
                                            <div className="text-sm text-gray-400">Total</div>
                                            <div className="text-2xl font-bold">2,105</div>
                                        </div>
                                        <div className="bg-black/30 p-3 rounded-lg border border-purple-900/30">
                                            <div className="text-sm text-gray-400">Delinquent</div>
                                            <div className="text-2xl font-bold text-yellow-400">32</div>
                                        </div>
                                        <div className="bg-black/30 p-3 rounded-lg border border-purple-900/30">
                                            <div className="text-sm text-gray-400">Stake</div>
                                            <div className="text-2xl font-bold">456M SOL</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="programs">
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">Top Programs by Transactions</h3>
                                <div className="h-60">
                                    <BarChart data={[
                                        { name: 'Jupiter', value: 42 },
                                        { name: 'Mango', value: 28 },
                                        { name: 'Marinade', value: 15 },
                                        { name: 'Solend', value: 12 },
                                        { name: 'Raydium', value: 10 },
                                        { name: 'Drift', value: 9 },
                                        { name: 'Orca', value: 8 },
                                    ]} />
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="accounts">
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-black/30 p-4 rounded-lg border border-purple-900/30">
                                        <div className="text-sm text-gray-400">Total Accounts</div>
                                        <div className="text-3xl font-bold">218.4M</div>
                                        <div className="text-xs text-green-400 mt-1">+142,567 (24h)</div>
                                    </div>
                                    <div className="bg-black/30 p-4 rounded-lg border border-purple-900/30">
                                        <div className="text-sm text-gray-400">Active Wallets (24h)</div>
                                        <div className="text-3xl font-bold">1.7M</div>
                                        <div className="text-xs text-green-400 mt-1">+12.4% (vs last week)</div>
                                    </div>
                                    <div className="bg-black/30 p-4 rounded-lg border border-purple-900/30">
                                        <div className="text-sm text-gray-400">New Wallets (24h)</div>
                                        <div className="text-3xl font-bold">24.5K</div>
                                        <div className="text-xs text-green-400 mt-1">+8.2% (vs last week)</div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
} 