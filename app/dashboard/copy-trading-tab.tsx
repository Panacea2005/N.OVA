"use client";

import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import LineChart from "@/components/charts/line-chart";
import { motion } from "framer-motion";
import { getTopTraders, setupCopyTrading, stopCopyTrading } from "./api-service";

// Type definition for traders
interface Trader {
    address: string;
    displayAddress: string;
    totalProfit: number;
    totalTrades: number;
    winRate: number;
    strategy: string;
    riskScore: string;
}

interface CopyTradingSetup {
    traderAddress: string;
    allocation: number;
    stopLoss: number;
    takeProfit: number;
}

export default function CopyTradingTab() {
    const [topTraders, setTopTraders] = useState<Trader[]>([]);
    const [selectedTrader, setSelectedTrader] = useState<string | null>(null);
    const [tradeSize, setTradeSize] = useState(25);
    const [stopLoss, setStopLoss] = useState(15);
    const [takeProfit, setTakeProfit] = useState(30);
    const [isSimulating, setIsSimulating] = useState(false);
    const [showSimulation, setShowSimulation] = useState(false);
    const [isActive, setIsActive] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [simulationData, setSimulationData] = useState<{ name: string, value: number }[]>([]);

    // Fetch top traders on component mount
    useEffect(() => {
        const fetchTraders = async () => {
            try {
                setIsLoading(true);
                const tradersData = await getTopTraders();
                setTopTraders(tradersData);
            } catch (error) {
                console.error("Error fetching top traders:", error);
                // Fallback to empty array
                setTopTraders([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTraders();
    }, []);

    const handleTraderSelect = (address: string) => {
        setSelectedTrader(address);
        setShowSimulation(false); // Reset simulation when trader changes
    };

    const handleSimulate = () => {
        if (!selectedTrader) return;

        setIsSimulating(true);

        // Generate simulation data
        // In a real app, this would call an API endpoint
        setTimeout(() => {
            const simulationPoints = 9; // 9 data points
            const baseValue = 10000; // Starting with $10k

            const data = Array.from({ length: simulationPoints }, (_, index) => {
                // Create some variation for the simulation
                const month = new Date();
                month.setMonth(month.getMonth() - (simulationPoints - 1) + index);
                const monthName = month.toLocaleString('default', { month: 'short' });

                // Calculate a value with some randomness but trending upward
                const trend = 1 + (index * 0.03); // 3% upward trend per point
                const random = 0.9 + (Math.random() * 0.2); // Random factor between 0.9 and 1.1
                const value = Math.round(baseValue * trend * random);

                return {
                    name: monthName,
                    value
                };
            });

            setSimulationData(data);
            setIsSimulating(false);
            setShowSimulation(true);
        }, 1500);
    };

    const handleActivate = async () => {
        if (!selectedTrader) return;

        try {
            if (!isActive) {
                // Set up copy trading
                const setup: CopyTradingSetup = {
                    traderAddress: selectedTrader,
                    allocation: tradeSize,
                    stopLoss: stopLoss,
                    takeProfit: takeProfit
                };

                await setupCopyTrading(setup);
            } else {
                // Stop copy trading
                await stopCopyTrading(selectedTrader);
            }

            setIsActive(!isActive);
        } catch (error) {
            console.error("Error toggling copy trading:", error);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
        >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Top Traders Section */}
                <div className="md:col-span-2">
                    <div className="border border-white/30 p-0.5">
                        <div className="border border-white/10 p-5">
                            <div className="mb-4">
                                <h2 className="text-xl font-light uppercase">Top Solana Traders</h2>
                                <p className="text-white/60 text-sm uppercase">
                                    Select a trader to copy their trades in real-time
                                </p>
                            </div>
                            {isLoading ? (
                                <div className="h-[300px] flex items-center justify-center">
                                    <div className="animate-pulse text-white/60">Loading trader data...</div>
                                </div>
                            ) : topTraders.length === 0 ? (
                                <div className="h-[300px] flex items-center justify-center">
                                    <div className="text-white/60">No traders available at the moment</div>
                                </div>
                            ) : (
                                <div className="overflow-x-auto border border-white/10">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-b border-white/10 hover:bg-transparent">
                                                <TableHead className="text-white/60 uppercase text-xs font-normal">Trader</TableHead>
                                                <TableHead className="text-white/60 uppercase text-xs font-normal">Profit</TableHead>
                                                <TableHead className="text-white/60 uppercase text-xs font-normal">Win Rate</TableHead>
                                                <TableHead className="text-white/60 uppercase text-xs font-normal">Strategy</TableHead>
                                                <TableHead className="text-white/60 uppercase text-xs font-normal">Risk</TableHead>
                                                <TableHead className="text-white/60 uppercase text-xs font-normal">Action</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {topTraders.map((trader) => (
                                                <TableRow key={trader.address} className={`border-b border-white/10 hover:bg-white/5 ${selectedTrader === trader.address ? "bg-white/5" : ""}`}>
                                                    <TableCell className="font-mono">{trader.displayAddress}</TableCell>
                                                    <TableCell className="text-green-400">+${trader.totalProfit.toLocaleString()}</TableCell>
                                                    <TableCell>{trader.winRate}%</TableCell>
                                                    <TableCell>{trader.strategy}</TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            className={
                                                                trader.riskScore === "Low"
                                                                    ? "border border-green-500 text-green-400 bg-transparent uppercase text-xs"
                                                                    : trader.riskScore === "Medium"
                                                                        ? "border border-yellow-500 text-yellow-400 bg-transparent uppercase text-xs"
                                                                        : "border border-red-500 text-red-400 bg-transparent uppercase text-xs"
                                                            }
                                                        >
                                                            {trader.riskScore}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className={`uppercase text-xs ${selectedTrader === trader.address ? "bg-white/5 border-white" : "border-white/20"}`}
                                                            onClick={() => handleTraderSelect(trader.address)}
                                                        >
                                                            {selectedTrader === trader.address ? "Selected" : "Select"}
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Trade Settings Section */}
                <div className="md:col-span-1">
                    <div className="border border-white/30 p-0.5 h-full">
                        <div className="border border-white/10 p-5 h-full">
                            <div className="mb-4">
                                <h2 className="text-xl font-light uppercase">Copy Trade Settings</h2>
                                <p className="text-white/60 text-sm uppercase">
                                    Configure your copy trading parameters
                                </p>
                            </div>
                            <div className="space-y-6">
                                <div className="border border-white/20 p-4">
                                    <Label htmlFor="allocation" className="text-white/60 uppercase text-xs mb-2 block">
                                        Allocation (% of portfolio)
                                    </Label>
                                    <div className="flex items-center space-x-2">
                                        <Slider
                                            id="allocation"
                                            defaultValue={[25]}
                                            max={100}
                                            step={5}
                                            onValueChange={(value) => setTradeSize(value[0])}
                                            disabled={!selectedTrader || isActive}
                                            className="flex-1"
                                        />
                                        <span className="w-12 text-center">{tradeSize}%</span>
                                    </div>
                                </div>

                                <div className="border border-white/20 p-4">
                                    <Label htmlFor="stopLoss" className="text-white/60 uppercase text-xs mb-2 block">
                                        Stop Loss (%)
                                    </Label>
                                    <div className="flex items-center space-x-2">
                                        <Slider
                                            id="stopLoss"
                                            defaultValue={[15]}
                                            max={50}
                                            step={1}
                                            onValueChange={(value) => setStopLoss(value[0])}
                                            disabled={!selectedTrader || isActive}
                                            className="flex-1"
                                        />
                                        <span className="w-12 text-center">{stopLoss}%</span>
                                    </div>
                                </div>

                                <div className="border border-white/20 p-4">
                                    <Label htmlFor="takeProfit" className="text-white/60 uppercase text-xs mb-2 block">
                                        Take Profit (%)
                                    </Label>
                                    <div className="flex items-center space-x-2">
                                        <Slider
                                            id="takeProfit"
                                            defaultValue={[30]}
                                            max={100}
                                            step={5}
                                            onValueChange={(value) => setTakeProfit(value[0])}
                                            disabled={!selectedTrader || isActive}
                                            className="flex-1"
                                        />
                                        <span className="w-12 text-center">{takeProfit}%</span>
                                    </div>
                                </div>

                                <div className="flex flex-col space-y-3 pt-4">
                                    <Button
                                        onClick={handleSimulate}
                                        disabled={!selectedTrader || isSimulating}
                                        variant="outline"
                                        className="w-full border-white/20 text-white/70 uppercase hover:bg-white/5"
                                    >
                                        {isSimulating ? "Simulating..." : "Simulate Returns"}
                                    </Button>

                                    <Button
                                        onClick={handleActivate}
                                        disabled={!selectedTrader}
                                        variant={isActive ? "destructive" : "default"}
                                        className={!isActive ? "w-full bg-white text-black hover:bg-white/90 uppercase" : "w-full uppercase"}
                                    >
                                        {isActive ? "Stop Copy Trading" : "Activate Copy Trading"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Simulation Results */}
            {showSimulation && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="border border-white/30 p-0.5">
                        <div className="border border-white/10 p-5">
                            <div className="mb-4">
                                <h2 className="text-xl font-light uppercase">Simulated Performance</h2>
                                <p className="text-white/60 text-sm uppercase">
                                    Historical performance simulation based on your settings
                                </p>
                            </div>
                            <div className="h-[300px] border border-white/10 p-4 mb-6">
                                <LineChart data={simulationData} />
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-0">
                                <div className="border border-white/20 p-4">
                                    <div className="text-sm text-white/60 uppercase mb-1">Initial Investment</div>
                                    <div className="text-xl font-light">${simulationData[0]?.value.toLocaleString()}</div>
                                </div>
                                <div className="border border-white/20 p-4">
                                    <div className="text-sm text-white/60 uppercase mb-1">Current Value</div>
                                    <div className="text-xl font-light text-green-400">
                                        ${simulationData[simulationData.length - 1]?.value.toLocaleString()}
                                    </div>
                                </div>
                                <div className="border border-white/20 p-4">
                                    <div className="text-sm text-white/60 uppercase mb-1">Total Profit</div>
                                    <div className="text-xl font-light text-green-400">
                                        +${(simulationData[simulationData.length - 1]?.value - simulationData[0]?.value).toLocaleString()}
                                    </div>
                                </div>
                                <div className="border border-white/20 p-4">
                                    <div className="text-sm text-white/60 uppercase mb-1">ROI</div>
                                    <div className="text-xl font-light text-green-400">
                                        +{((simulationData[simulationData.length - 1]?.value / simulationData[0]?.value - 1) * 100).toFixed(2)}%
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Active Copy Trading Status */}
            {isActive && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="border border-white/30 border-green-500/30 p-0.5">
                        <div className="border border-white/10 p-5">
                            <div className="mb-4">
                                <h2 className="text-xl font-light uppercase text-green-400">Copy Trading Active</h2>
                                <p className="text-white/60 text-sm uppercase">
                                    You are currently copying trades from {topTraders.find(t => t.address === selectedTrader)?.displayAddress}
                                </p>
                            </div>
                            <div className="grid grid-cols-3 gap-0">
                                <div className="border border-white/20 p-4">
                                    <div className="text-sm text-white/60 uppercase mb-1">Allocation</div>
                                    <div className="text-xl font-light">{tradeSize}%</div>
                                </div>
                                <div className="border border-white/20 p-4">
                                    <div className="text-sm text-white/60 uppercase mb-1">Stop Loss</div>
                                    <div className="text-xl font-light">{stopLoss}%</div>
                                </div>
                                <div className="border border-white/20 p-4">
                                    <div className="text-sm text-white/60 uppercase mb-1">Take Profit</div>
                                    <div className="text-xl font-light">{takeProfit}%</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}