"use client";

import { useState, useEffect } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
                    <Card className="glassmorphic border-glow">
                        <CardHeader>
                            <CardTitle>Top Solana Traders</CardTitle>
                            <CardDescription>
                                Select a trader to copy their trades in real-time
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="h-[300px] flex items-center justify-center">
                                    <div className="animate-pulse text-purple-400">Loading trader data...</div>
                                </div>
                            ) : topTraders.length === 0 ? (
                                <div className="h-[300px] flex items-center justify-center">
                                    <div className="text-purple-400">No traders available at the moment</div>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Trader</TableHead>
                                                <TableHead>Profit</TableHead>
                                                <TableHead>Win Rate</TableHead>
                                                <TableHead>Strategy</TableHead>
                                                <TableHead>Risk</TableHead>
                                                <TableHead>Action</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {topTraders.map((trader) => (
                                                <TableRow key={trader.address} className={selectedTrader === trader.address ? "bg-purple-950/30" : ""}>
                                                    <TableCell className="font-medium">{trader.displayAddress}</TableCell>
                                                    <TableCell className="text-green-400">+${trader.totalProfit.toLocaleString()}</TableCell>
                                                    <TableCell>{trader.winRate}%</TableCell>
                                                    <TableCell>{trader.strategy}</TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant="outline"
                                                            className={
                                                                trader.riskScore === "Low"
                                                                    ? "bg-green-900/20 text-green-400 border-green-400/30"
                                                                    : trader.riskScore === "Medium"
                                                                        ? "bg-yellow-900/20 text-yellow-400 border-yellow-400/30"
                                                                        : "bg-red-900/20 text-red-400 border-red-400/30"
                                                            }
                                                        >
                                                            {trader.riskScore}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className={selectedTrader === trader.address ? "bg-purple-500/20 text-purple-300" : ""}
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
                        </CardContent>
                    </Card>
                </div>

                {/* Trade Settings Section */}
                <div className="md:col-span-1">
                    <Card className="glassmorphic border-glow h-full">
                        <CardHeader>
                            <CardTitle>Copy Trade Settings</CardTitle>
                            <CardDescription>
                                Configure your copy trading parameters
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="allocation">Allocation (% of portfolio)</Label>
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

                            <div className="space-y-2">
                                <Label htmlFor="stopLoss">Stop Loss (%)</Label>
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

                            <div className="space-y-2">
                                <Label htmlFor="takeProfit">Take Profit (%)</Label>
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

                            <div className="flex flex-col space-y-4 pt-4">
                                <Button
                                    onClick={handleSimulate}
                                    disabled={!selectedTrader || isSimulating}
                                    variant="outline"
                                >
                                    {isSimulating ? "Simulating..." : "Simulate Returns"}
                                </Button>

                                <Button
                                    onClick={handleActivate}
                                    disabled={!selectedTrader}
                                    variant={isActive ? "destructive" : "default"}
                                    className={!isActive ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700" : ""}
                                >
                                    {isActive ? "Stop Copy Trading" : "Activate Copy Trading"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Simulation Results */}
            {showSimulation && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Card className="glassmorphic border-glow">
                        <CardHeader>
                            <CardTitle>Simulated Performance</CardTitle>
                            <CardDescription>
                                Historical performance simulation based on your settings
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px]">
                                <LineChart data={simulationData} />
                            </div>
                            <div className="mt-4 grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-400">Initial Investment</p>
                                    <p className="text-lg">${simulationData[0]?.value.toLocaleString()}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-400">Current Value</p>
                                    <p className="text-lg text-green-400">
                                        ${simulationData[simulationData.length - 1]?.value.toLocaleString()}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-400">Total Profit</p>
                                    <p className="text-lg text-green-400">
                                        +${(simulationData[simulationData.length - 1]?.value - simulationData[0]?.value).toLocaleString()}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-400">ROI</p>
                                    <p className="text-lg text-green-400">
                                        +{((simulationData[simulationData.length - 1]?.value / simulationData[0]?.value - 1) * 100).toFixed(2)}%
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Active Copy Trading Status */}
            {isActive && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Card className="glassmorphic border-glow border-green-500/30">
                        <CardHeader>
                            <CardTitle className="text-green-400">Copy Trading Active</CardTitle>
                            <CardDescription>
                                You are currently copying trades from {topTraders.find(t => t.address === selectedTrader)?.displayAddress}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-400">Allocation</p>
                                    <p className="text-lg">{tradeSize}%</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-400">Stop Loss</p>
                                    <p className="text-lg">{stopLoss}%</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-400">Take Profit</p>
                                    <p className="text-lg">{takeProfit}%</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}
        </motion.div>
    );
} 