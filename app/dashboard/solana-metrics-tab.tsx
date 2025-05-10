"use client";

import { useState, useEffect, useRef } from "react";
import LineChart from "@/components/charts/line-chart";
import BarChart from "@/components/charts/bar-chart";
import PieChart from "@/components/charts/pie-chart";
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
        <div className="border border-white/30 p-0.5 mb-8">
            <div className="border border-white/10 p-5">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-light uppercase">Solana Network Status</h2>
                    {isConnected && (
                        <div className="flex items-center">
                            <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse mr-1"></span>
                            <span className="text-xs text-white/60">LIVE</span>
                        </div>
                    )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-0">
                    <div className="border border-white/20 p-5">
                        <div className="text-sm text-white/60 mb-1 uppercase">TPS</div>
                        <div className="text-2xl font-light">{networkStats.tps.toLocaleString()}</div>
                    </div>
                    <div className="border border-white/20 p-5">
                        <div className="text-sm text-white/60 mb-1 uppercase">Current Slot</div>
                        <div className="text-2xl font-light">{networkStats.slot.toLocaleString()}</div>
                    </div>
                    <div className="border border-white/20 p-5">
                        <div className="text-sm text-white/60 mb-1 uppercase">Latency</div>
                        <div className="text-2xl font-light">{networkStats.latency.toFixed(2)}s</div>
                    </div>
                    <div className="border border-white/20 p-5">
                        <div className="text-sm text-white/60 mb-1 uppercase">Status</div>
                        <div className={`text-2xl font-light ${getStatusColor(networkStats.status)}`}>
                            {networkStats.status === 'up' ? 'Healthy' :
                                networkStats.status === 'degraded' ? 'Degraded' : 'Down'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
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
        <div className="border border-white/30 p-0.5 mb-8">
            <div className="border border-white/10 p-5">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h2 className="text-xl font-light uppercase">Solana Ecosystem Tokens</h2>
                        <p className="text-white/60 text-sm uppercase">Real-time price data for top Solana tokens</p>
                    </div>
                    {isConnected && (
                        <div className="flex items-center">
                            <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse mr-1"></span>
                            <span className="text-xs text-white/60">LIVE</span>
                        </div>
                    )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-0">
                    {tokens.map(symbol => {
                        const data = tokenPrices[symbol];
                        const changeColor = data?.change24h > 0 ? "text-green-400" :
                            data?.change24h < 0 ? "text-red-400" : "text-white/60";
                        const changeArrow = data?.change24h > 0 ? "↑" :
                            data?.change24h < 0 ? "↓" : "";

                        return (
                            <div key={symbol} className="border border-white/20 p-5">
                                <div className="flex justify-between">
                                    <div className="font-mono uppercase text-white/80">{symbol}</div>
                                    {data?.price > 0 && (
                                        <div className={changeColor}>
                                            {changeArrow} {Math.abs(data?.change24h || 0).toFixed(2)}%
                                        </div>
                                    )}
                                </div>
                                <div className="text-2xl mt-1 font-light">
                                    {data?.price > 0 ?
                                        `$${data.price.toLocaleString(undefined, {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 4
                                        })}` :
                                        <div className="h-6 flex items-center">
                                            <div className="animate-pulse text-white/60 text-sm">Loading...</div>
                                        </div>
                                    }
                                </div>
                                {data?.volume24h > 0 && (
                                    <div className="text-xs text-white/60 mt-1 uppercase">
                                        Vol: ${(data.volume24h / 1000000).toFixed(2)}M
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
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
        <div className="border border-white/30 p-0.5 mb-8">
            <div className="border border-white/10 p-5">
                <div className="mb-4">
                    <h2 className="text-xl font-light uppercase">Transaction Activity</h2>
                    <p className="text-white/60 text-sm uppercase">Transactions per second over time</p>
                </div>
                <div className="h-80 border border-white/10 p-4">
                    <LineChart data={txData} />
                </div>
            </div>
        </div>
    );
}

// Ecosystem Health Component with Custom Tabs
function EcosystemHealth() {
    const [activeTab, setActiveTab] = useState("validators");

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
    };

    return (
        <div className="border border-white/30 p-0.5 mb-8">
            <div className="border border-white/10 p-0">
                <div className="p-5 border-b border-white/10">
                    <h2 className="text-xl font-light uppercase">Solana Ecosystem Health</h2>
                    <p className="text-white/60 text-sm uppercase">Key metrics for the Solana blockchain</p>
                </div>
                
                {/* Custom Tab Navigation */}
                <div className="flex border-b border-white/10">
                    <button
                        className={`px-6 py-4 text-sm font-mono relative ${
                            activeTab === "validators"
                                ? "text-white border-b border-white"
                                : "text-white/40 hover:text-white/60"
                        }`}
                        onClick={() => handleTabChange("validators")}
                    >
                        VALIDATORS
                    </button>
                    <button
                        className={`px-6 py-4 text-sm font-mono relative ${
                            activeTab === "programs"
                                ? "text-white border-b border-white"
                                : "text-white/40 hover:text-white/60"
                        }`}
                        onClick={() => handleTabChange("programs")}
                    >
                        PROGRAMS
                    </button>
                    <button
                        className={`px-6 py-4 text-sm font-mono relative ${
                            activeTab === "accounts"
                                ? "text-white border-b border-white"
                                : "text-white/40 hover:text-white/60"
                        }`}
                        onClick={() => handleTabChange("accounts")}
                    >
                        ACCOUNTS
                    </button>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                    {activeTab === "validators" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="border border-white/30 p-0.5">
                                <div className="border border-white/10 p-5">
                                    <h3 className="text-lg font-light uppercase mb-4">Validator Distribution</h3>
                                    <div className="h-60 border border-white/10 p-4">
                                        <PieChart data={[
                                            { name: 'Stake Labs', value: 15 },
                                            { name: 'Chorus One', value: 12 },
                                            { name: 'Everstake', value: 10 },
                                            { name: 'Figment', value: 8 },
                                            { name: 'Other', value: 55 },
                                        ]} />
                                    </div>
                                </div>
                            </div>
                            <div className="border border-white/30 p-0.5">
                                <div className="border border-white/10 p-5">
                                    <h3 className="text-lg font-light uppercase mb-4">Validator Stats</h3>
                                    <div className="grid grid-cols-2 gap-0">
                                        <div className="border border-white/20 p-5">
                                            <div className="text-sm text-white/60 mb-1 uppercase">Active</div>
                                            <div className="text-2xl font-light">1,782</div>
                                        </div>
                                        <div className="border border-white/20 p-5">
                                            <div className="text-sm text-white/60 mb-1 uppercase">Total</div>
                                            <div className="text-2xl font-light">2,105</div>
                                        </div>
                                        <div className="border border-white/20 p-5">
                                            <div className="text-sm text-white/60 mb-1 uppercase">Delinquent</div>
                                            <div className="text-2xl font-light text-yellow-400">32</div>
                                        </div>
                                        <div className="border border-white/20 p-5">
                                            <div className="text-sm text-white/60 mb-1 uppercase">Stake</div>
                                            <div className="text-2xl font-light">456M SOL</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "programs" && (
                        <div className="border border-white/30 p-0.5">
                            <div className="border border-white/10 p-5">
                                <h3 className="text-lg font-light uppercase mb-4">Top Programs by Transactions</h3>
                                <div className="h-60 border border-white/10 p-4">
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
                        </div>
                    )}

                    {activeTab === "accounts" && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
                            <div className="border border-white/20 p-5">
                                <div className="text-sm text-white/60 mb-1 uppercase">Total Accounts</div>
                                <div className="text-3xl font-light">218.4M</div>
                                <div className="text-xs text-green-400 mt-1 uppercase">+142,567 (24h)</div>
                            </div>
                            <div className="border border-white/20 p-5">
                                <div className="text-sm text-white/60 mb-1 uppercase">Active Wallets (24h)</div>
                                <div className="text-3xl font-light">1.7M</div>
                                <div className="text-xs text-green-400 mt-1 uppercase">+12.4% (vs last week)</div>
                            </div>
                            <div className="border border-white/20 p-5">
                                <div className="text-sm text-white/60 mb-1 uppercase">New Wallets (24h)</div>
                                <div className="text-3xl font-light">24.5K</div>
                                <div className="text-xs text-green-400 mt-1 uppercase">+8.2% (vs last week)</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
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

            <EcosystemHealth />
        </div>
    );
}