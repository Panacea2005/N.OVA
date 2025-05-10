// Integrated API Service Module - combines api-service.ts and api-service.tsx
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import axios from 'axios';
import { toast } from '@/components/ui/use-toast';

// Define types locally since they're not exported from @/lib/api
interface SentimentData {
    score: number;
    mentions: number;
    trend: string;
    timestamp: string;
}

interface Event {
    title: string;
    description: string;
    impact: string;
    timestamp: string;
    source: string;
}

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

interface NewsItem {
    id: string;
    title: string;
    url: string;
    source: {
        title: string;
        domain: string;
        path: string;
    };
    domain: string;
    published_at: string;
    created_at: string;
    votes: {
        negative: number;
        positive: number;
        important: number;
        liked: number;
        disliked: number;
        lol: number;
        toxic: number;
        saved: number;
        comments: number;
    };
    metadata?: {
        description?: string;
        image?: string;
    };
    currencies?: Array<{
        code: string;
        title: string;
        slug: string;
        url: string;
    }>;
}

interface CryptoPanicResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: NewsItem[];
}

// DefiLlama protocol interface
interface DefiProtocol {
    name: string;
    chains: string[];
    tvl: number;
    change_1d: number;
    change_7d: number;
    category: string;
}

interface Token {
    symbol: string;
    name: string;
    amount: number;
    decimals: number;
    uiAmount: number;
    price?: number;
    value?: number;
    change24h?: number;
}

interface NFTCollection {
    name: string;
    floorPrice: number;
    volume24h: number;
    items: number;
    owners: number;
    marketCap?: number;
}

interface PortfolioData {
    totalValue: number;
    totalPnL: number;
    pnlPercentage: number;
    tokens: Token[];
    nfts: NFTCollection[];
    allocation: { name: string; value: number; amount: number }[];
    performanceHistory: { name: string; value: number }[];
}

// Add axios response types
interface AxiosResponse<T = any> {
    data: T;
    status: number;
    statusText: string;
    headers: any;
    config: any;
}

// Token sentiment interface
interface TokenSentiment {
    name: string;
    score: number;
    change: string;
    status: string;
    mentions: number;
    chartData: Array<{ name: string; value: number }>;
}

// Platform sentiment interface
interface PlatformSentiment {
    name: string;
    positive: number;
    neutral: number;
    negative: number;
}

// Chart data point interface
interface ChartDataPoint {
    name: string;
    value: number;
}

// Connection to Solana blockchain - use devnet as default per user preference
const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com');

// CoinGecko API for token prices
const COINGECKO_API = 'https://api.coingecko.com/api/v3';
// CryptoPanic API for news and sentiment
const CRYPTOPANIC_API = 'https://cryptopanic.com/api/v1';
const CRYPTOPANIC_API_KEY = process.env.NEXT_PUBLIC_CRYPTOPANIC_API_KEY || '';
// DefiLlama API
const DEFILLAMA_API = 'https://api.llama.fi';
// Helius API (if available)
const HELIUS_API = process.env.NEXT_PUBLIC_HELIUS_API_URL || '';
const HELIUS_API_KEY = process.env.NEXT_PUBLIC_HELIUS_API_KEY || '';

// Helper function to handle API request failures
const fetchWithRetry = async (url: string, options: any = {}, retries = 3, backoff = 300) => {
    try {
        return await axios.get(url, options);
    } catch (error) {
        if (retries === 0) throw error;

        await new Promise(resolve => setTimeout(resolve, backoff));
        return fetchWithRetry(url, options, retries - 1, backoff * 2);
    }
};

// Helper function to fetch DeFi protocol data from DefiLlama
const fetchDefiProtocols = async (): Promise<DefiProtocol[]> => {
    try {
        const response = await fetchWithRetry(`${DEFILLAMA_API}/protocols`);
        // Filter protocols on Solana
        return (response.data as any[])
            .filter((protocol: any) =>
                protocol.chains.includes('Solana') &&
                protocol.tvl > 1000000
            )
            .sort((a: any, b: any) => b.tvl - a.tvl)
            .slice(0, 10)
            .map((protocol: any) => ({
                name: protocol.name,
                chains: protocol.chains,
                tvl: protocol.tvl,
                change_1d: protocol.change_1d || 0,
                change_7d: protocol.change_7d || 0,
                category: protocol.category
            }));
    } catch (error) {
        console.error('Error fetching DeFi protocols:', error);
        // Return mock data in case of error
        return [
            { name: 'Marinade Finance', chains: ['Solana'], tvl: 124000000, change_1d: 0.8, change_7d: 2.3, category: 'Liquid Staking' },
            { name: 'Jupiter', chains: ['Solana'], tvl: 89000000, change_1d: 1.2, change_7d: 3.5, category: 'Dexes' },
            { name: 'Drift Protocol', chains: ['Solana'], tvl: 67000000, change_1d: 0.5, change_7d: 1.8, category: 'Derivatives' },
            { name: 'Kamino Finance', chains: ['Solana'], tvl: 45000000, change_1d: 0.3, change_7d: 1.1, category: 'Yield' },
            { name: 'Solend', chains: ['Solana'], tvl: 38000000, change_1d: -0.2, change_7d: 0.9, category: 'Lending' }
        ];
    }
};

// Solana ecosystem data APIs
export const getSolanaData = async () => {
    try {
        // Fetch real Solana network data
        const [slot, version, supply, performance] = await Promise.all([
            connection.getSlot(),
            connection.getVersion(),
            connection.getSupply(),
            connection.getRecentPerformanceSamples(1)
        ]);

        // Calculate TPS from performance samples
        const tps = performance.length > 0 ? Math.round(performance[0].numTransactions / performance[0].samplePeriodSecs) : 0;

        // Fetch token prices from CoinGecko
        const tokenPricesResponse = await fetchWithRetry(`${COINGECKO_API}/simple/price`, {
            params: {
                ids: 'solana,usd-coin,jupiter,bonk,raydium,jito-dao',
                vs_currencies: 'usd',
                include_24hr_change: true,
                include_market_cap: true
            }
        });

        const tokenPrices = tokenPricesResponse.data;

        // Format the data to match expected structure
        return {
            tokenPrices,
            networkHealth: {
                slot,
                version: version?.['solana-core'],
                health: 'up', // Simplified health status
                tps,
                supply: {
                    total: supply.value.total / LAMPORTS_PER_SOL,
                    circulating: supply.value.circulating / LAMPORTS_PER_SOL
                }
            },
            defiProtocols: await fetchDefiProtocols()
        };
    } catch (error) {
        console.error('Error fetching Solana data:', error);
        throw error;
    }
};

// Fetch historical SOL price data from CoinGecko (or your preferred API)
export const getSolHistoricalData = async (days = 1, interval = 'hourly') => {
    try {
        const params: any = {
            vs_currency: 'usd',
            days
        };

        if (interval) {
            params.interval = interval;
        }

        const response = await fetchWithRetry(
            `${COINGECKO_API}/coins/solana/market_chart`,
            { params }
        );

        // Process the data for the chart
        const prices = (response.data as any).prices;
        return prices.map((item: [number, number]) => {
            const date = new Date(item[0]);
            let label;

            if (days <= 1) {
                const hours = date.getHours();
                label = hours < 10 ? `0${hours}:00` : `${hours}:00`;
            } else if (days <= 30) {
                label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            } else {
                label = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
            }

            return {
                name: label,
                value: parseFloat(item[1].toFixed(2))
            };
        });
    } catch (error) {
        console.error('Error fetching SOL historical data:', error);
        return [];
    }
};

// Fetch real-time token volume data
export const getTokenVolumeData = async () => {
    try {
        // Use your preferred API for token data
        const apiUrl = process.env.NEXT_PUBLIC_TOKEN_API_URL || `${COINGECKO_API}/coins/markets`;

        // Fetch from API for real volume data
        const response = await fetchWithRetry(apiUrl, {
            params: {
                vs_currency: 'usd',
                ids: 'solana,usd-coin,jupiter,bonk,raydium',
                order: 'volume_desc',
                per_page: 5,
                page: 1,
                sparkline: false,
                price_change_percentage: '24h'
            }
        });

        return (response.data as any[]).map((token: any) => ({
            name: token.symbol.toUpperCase(),
            value: Math.round(token.total_volume),
            price: token.current_price,
            change24h: token.price_change_percentage_24h
        }));
    } catch (error) {
        console.error("Error fetching token volume data:", error);
        // Return minimal data as fallback
        return [
            { name: "SOL", value: 450_000_000 },
            { name: "USDC", value: 320_000_000 },
            { name: "JTO", value: 280_000_000 },
            { name: "BONK", value: 240_000_000 },
            { name: "RAY", value: 200_000_000 },
        ];
    }
};

// Types for websocket data
export interface NetworkStatsData {
    tps: number;
    slot: number;
    latency: number;
    status: 'up' | 'degraded' | 'down';
    timestamp: number;
    validators?: {
        active: number;
        total: number;
        delinquent: number;
    };
    avgBlockTime?: number;
    epoch?: {
        current: number;
        slot: number;
        progress: number;
    };
}

export interface OrderBookEntry {
    price: number;
    size: number;
    total?: number;
}

export interface OrderBookData {
    market?: string;
    asks: OrderBookEntry[];
    bids: OrderBookEntry[];
    timestamp?: number;
}

export interface AlertData {
    id: string;
    type: 'price' | 'news' | 'whale' | 'technical' | 'general';
    priority: 'low' | 'medium' | 'high';
    title: string;
    message: string;
    asset?: string;
    timestamp: number;
}

// Simple WebSocket connection handler
function createWebSocketConnection<T>(
    url: string,
    onMessage: (data: T) => void,
    onConnect?: () => void,
    onDisconnect?: () => void,
    reconnectDelay = 3000,
    headers?: Record<string, string>
) {
    console.log(`Creating WebSocket connection to ${url}`);

    // In a production app, this would use actual WebSockets
    // For this demo, we'll simulate with an interval
    let connected = false;
    let intervalId: NodeJS.Timeout | null = null;

    // Function to simulate random data updates
    const simulateData = () => {
        // Generate mock data based on URL to create appropriate fake data
        let mockData: any = {
            timestamp: Date.now()
        };

        // If this is an orderbook connection
        if (url.includes('orderbook')) {
            // Extract market from the URL
            const marketParam = new URLSearchParams(url.split('?')[1] || '');
            const market = marketParam.get('market') || 'SOL/USDC';

            // Generate base price for the market
            const basePrice = market.startsWith('SOL') ? 175 + (Math.random() * 10 - 5)
                : market.startsWith('JUP') ? 1.40 + (Math.random() * 0.2 - 0.1)
                    : market.startsWith('JTO') ? 2.85 + (Math.random() * 0.3 - 0.15)
                        : 50 + (Math.random() * 5);

            // Generate asks (sell orders) - starting slightly above base price
            const asks: OrderBookEntry[] = [];
            let askPrice = basePrice * 1.001;
            let totalAsk = 0;

            for (let i = 0; i < 15; i++) {
                const size = Math.random() * 150 + 10;
                totalAsk += size;
                asks.push({
                    price: parseFloat(askPrice.toFixed(3)),
                    size: parseFloat(size.toFixed(2)),
                    total: parseFloat(totalAsk.toFixed(2))
                });
                askPrice *= 1.001 + (Math.random() * 0.001);
            }

            // Generate bids (buy orders) - starting slightly below base price
            const bids: OrderBookEntry[] = [];
            let bidPrice = basePrice * 0.999;
            let totalBid = 0;

            for (let i = 0; i < 15; i++) {
                const size = Math.random() * 150 + 10;
                totalBid += size;
                bids.push({
                    price: parseFloat(bidPrice.toFixed(3)),
                    size: parseFloat(size.toFixed(2)),
                    total: parseFloat(totalBid.toFixed(2))
                });
                bidPrice *= 0.999 - (Math.random() * 0.001);
            }

            // Sort orders appropriately
            asks.sort((a, b) => a.price - b.price);
            bids.sort((a, b) => b.price - a.price);

            mockData = {
                market,
                bids,
                asks,
                timestamp: Date.now()
            };
        }
        // If this is a network stats connection
        else if (url.includes('network-stats')) {
            const tps = Math.floor(1500 + Math.random() * 1000);
            const slot = 150000000 + Math.floor(Date.now() / 400);
            const latency = 0.2 + Math.random() * 0.3;

            let status: 'up' | 'degraded' | 'down' = 'up';
            if (tps < 1800) status = 'degraded';
            if (tps < 1000) status = 'down';

            mockData = {
                tps,
                slot,
                latency,
                status,
                timestamp: Date.now(),
                validators: {
                    active: 1700 + Math.floor(Math.random() * 20),
                    total: 1800,
                    delinquent: Math.floor(Math.random() * 15)
                },
                avgBlockTime: 0.4 + Math.random() * 0.1,
                epoch: {
                    current: 535,
                    slot: 230400000 + slot % 432000,
                    progress: ((slot % 432000) / 432000) * 100
                }
            };
        }
        // If this is an alerts connection
        else if (url.includes('alerts')) {
            // Only occasionally send alerts (20% chance)
            if (Math.random() < 0.2) {
                const alertTypes = ['price', 'news', 'whale', 'technical', 'general'] as const;
                const priorities = ['low', 'medium', 'high'] as const;
                const assets = ['SOL', 'JUP', 'BONK', 'JTO', 'RAY'];

                mockData = {
                    id: `alert-${Date.now()}`,
                    type: alertTypes[Math.floor(Math.random() * alertTypes.length)],
                    priority: priorities[Math.floor(Math.random() * priorities.length)],
                    title: `Demo Alert for ${assets[Math.floor(Math.random() * assets.length)]}`,
                    message: 'This is a simulated alert for testing purposes.',
                    asset: assets[Math.floor(Math.random() * assets.length)],
                    timestamp: Date.now()
                };
            } else {
                // Skip this update
                return;
            }
        }

        onMessage(mockData as T);
    };

    // "Connect" the mock WebSocket with a short delay to simulate connection time
    setTimeout(() => {
        if (onConnect) onConnect();
        connected = true;

        // Start sending mock data - use different intervals for different data types
        const updateInterval = url.includes('orderbook') ? 2000 : // Order books update quickly
            url.includes('network-stats') ? 5000 : // Network stats less frequently
                10000; // Alerts even less frequently

        intervalId = setInterval(simulateData, updateInterval);

        // Send initial data immediately
        simulateData();
    }, 500);

    return {
        connect: () => {
            if (!connected && onConnect) onConnect();
            connected = true;
        },
        disconnect: () => {
            if (connected && onDisconnect) onDisconnect();
            connected = false;
            if (intervalId) clearInterval(intervalId);
        },
        send: (data: any) => {
            console.log('Simulated WebSocket send:', data);
        },
        getStatus: () => connected ? 1 : 3 // 1 = OPEN, 3 = CLOSED in WebSocket spec
    };
}

// Network stats WebSocket
export const createNetworkStatsWebSocket = (
    onUpdate: (data: NetworkStatsData) => void
) => {
    // Replace with your actual network stats WebSocket URL
    const webSocketUrl = process.env.NEXT_PUBLIC_NETWORK_WEBSOCKET_URL || 'wss://your-api-endpoint/network-stats';
    const apiKey = process.env.NEXT_PUBLIC_SOLANA_API_KEY || '';

    // Fix the headers type
    const headers: Record<string, string> = {};
    if (apiKey) {
        headers['api-key'] = apiKey;
    }

    // If no WebSocket API is available, we can simulate real-time updates
    if (webSocketUrl === 'wss://your-api-endpoint/network-stats') {
        console.log('Using simulated network stats updates');
        // Simulated WebSocket for development
        const intervalId = setInterval(() => {
            const currentTime = Date.now();
            // Create realistic-looking data with some randomness
            const tps = Math.floor(1500 + Math.random() * 1000); // 1500-2500 TPS
            const slot = 150000000 + Math.floor(currentTime / 400); // Increment ~2.5 slots/sec
            const latency = 0.2 + Math.random() * 0.3; // 200-500ms latency

            // Calculate status based on TPS and latency
            let status: 'up' | 'degraded' | 'down' = 'up';
            if (tps < 1800) status = 'degraded';
            if (tps < 1000) status = 'down';

            const data: NetworkStatsData = {
                tps,
                slot,
                latency,
                status,
                timestamp: currentTime,
                validators: {
                    active: 1700 + Math.floor(Math.random() * 20),
                    total: 1800,
                    delinquent: Math.floor(Math.random() * 15)
                },
                avgBlockTime: 0.4 + Math.random() * 0.1,
                epoch: {
                    current: 535,
                    slot: 230400000 + slot % 432000,
                    progress: ((slot % 432000) / 432000) * 100
                }
            };

            onUpdate(data);
        }, 5000); // Update every 5 seconds

        // Return a mock WebSocket-like object
        return {
            connect: () => { },
            disconnect: () => { clearInterval(intervalId); },
            send: () => { },
            getStatus: () => 1 // 1 = WebSocket.OPEN
        };
    }

    return createWebSocketConnection<NetworkStatsData>(
        webSocketUrl,
        onUpdate,
        () => {
            console.log('Network Stats WebSocket connected');
            toast({
                title: "Connected to network stats",
                description: "Receiving real-time blockchain performance data",
                duration: 3000
            });
        },
        () => console.log('Network Stats WebSocket disconnected'),
        undefined,
        headers
    );
};

// Order book WebSocket
export const createOrderBookWebSocket = (
    market: string,
    onUpdate: (data: OrderBookData) => void
) => {
    const webSocketUrl = `${process.env.NEXT_PUBLIC_ORDERBOOK_WEBSOCKET_URL || 'wss://your-api-endpoint/orderbook'}?market=${market}`;

    return createWebSocketConnection<OrderBookData>(
        webSocketUrl,
        onUpdate,
        () => console.log(`Order Book WebSocket for ${market} connected`),
        () => console.log(`Order Book WebSocket for ${market} disconnected`)
    );
};

// Alerts WebSocket
export const createAlertsWebSocket = (
    onAlert: (data: AlertData) => void
) => {
    const webSocketUrl = process.env.NEXT_PUBLIC_ALERTS_WEBSOCKET_URL || 'wss://your-api-endpoint/alerts';

    return createWebSocketConnection<AlertData>(
        webSocketUrl,
        onAlert,
        () => console.log('Alerts WebSocket connected'),
        () => console.log('Alerts WebSocket disconnected')
    );
};

// AI Insights APIs
export const getPersonalizedRecommendations = async (userId: string) => {
    try {
        // In a real app, this would call a recommendation engine API
        // Simulate response based on real token data
        const tokenDataResponse = await fetchWithRetry(`${COINGECKO_API}/coins/markets`, {
            params: {
                vs_currency: 'usd',
                category: 'solana-ecosystem',
                order: 'market_cap_desc',
                per_page: 15,
                page: 1,
                sparkline: false,
                price_change_percentage: '24h'
            }
        });

        const tokenData = tokenDataResponse.data as any[];

        // Filter tokens with positive momentum
        const risingTokens = tokenData
            .filter((token: any) => token.price_change_percentage_24h > 0)
            .sort((a: any, b: any) => b.price_change_percentage_24h - a.price_change_percentage_24h)
            .slice(0, 3)
            .map((token: any) => ({
                symbol: token.symbol.toUpperCase(),
                name: token.name,
                price: token.current_price,
                change24h: token.price_change_percentage_24h,
                marketCap: token.market_cap,
                reason: `${token.price_change_percentage_24h.toFixed(1)}% gain in 24h, strong momentum`
            }));

        // Get DeFi protocols with increasing TVL
        const defiProtocols = await fetchDefiProtocols();
        const promisingDeFi = defiProtocols
            .filter((protocol: any) => protocol.change_1d > 0)
            .sort((a: any, b: any) => b.change_1d - a.change_1d)
            .slice(0, 2)
            .map((protocol: any) => ({
                name: protocol.name,
                category: protocol.category,
                tvl: `$${(protocol.tvl / 1000000).toFixed(1)}M`,
                change24h: protocol.change_1d,
                reason: `${protocol.change_1d.toFixed(1)}% TVL increase in 24h, growing adoption`
            }));

        return {
            tokens: risingTokens,
            protocols: promisingDeFi,
            strategies: [
                {
                    name: "Momentum Trading",
                    suitability: "High",
                    timeframe: "Short-term",
                    description: "Market showing strong momentum with key tokens breaking resistance levels"
                },
                {
                    name: "DeFi Yield Farming",
                    suitability: "Medium",
                    timeframe: "Medium-term",
                    description: "Multiple protocols showing TVL growth with attractive yield opportunities"
                }
            ]
        };
    } catch (error) {
        console.error('Error getting personalized recommendations:', error);
        return {
            tokens: [],
            protocols: [],
            strategies: []
        };
    }
};

// Get DeFi opportunities
export const getDefiOpportunities = async () => {
    try {
        // In a real app, this would call DeFi protocol APIs
        // Here we'll use DefiLlama data to get real protocols at least

        const protocols = await fetchDefiProtocols();

        // Transform into opportunities (in a real app these would include APY data)
        return protocols.slice(0, 5).map((protocol: any) => ({
            protocol: protocol.name,
            pool: protocol.category === 'Liquid Staking' ? 'Staking' : 'Multiple pools',
            apy: (Math.random() * 30 + 5).toFixed(1),
            tvl: `$${(protocol.tvl / 1000000).toFixed(1)}M`,
            risk: protocol.tvl > 100000000 ? 'Low' : (protocol.tvl > 10000000 ? 'Medium' : 'High')
        }));
    } catch (error) {
        console.error('Error getting DeFi opportunities:', error);
        return [];
    }
};

// Mock implementation for top traders
export const getTopTraders = async (): Promise<Trader[]> => {
    // In a real app, this would fetch real data from an API
    return [
        {
            address: "JuT35R1idBsYShZFWvPHJbQ9YPgZ8cGwBokaEkEgu6F",
            displayAddress: "JuT35R...EkEgu6F",
            totalProfit: 125430,
            totalTrades: 432,
            winRate: 76,
            strategy: "Momentum",
            riskScore: "Medium"
        },
        {
            address: "3xTy8J4NPyBcVKbNVDSCxGhGvuZ3uXVnKJpCG7NARTrs",
            displayAddress: "3xTy8J...ARTrs",
            totalProfit: 231250,
            totalTrades: 156,
            winRate: 83,
            strategy: "Arbitrage",
            riskScore: "Low"
        },
        {
            address: "7Y7xYpX5REvM1MWYRhCGZMnKUT7Cnc5MjxX7zGSDv4LY",
            displayAddress: "7Y7xYp...SDv4LY",
            totalProfit: 567890,
            totalTrades: 921,
            winRate: 68,
            strategy: "Swing",
            riskScore: "High"
        },
        {
            address: "BbvHGHBvSbVijbNbXEcGfuEnq45Za7pTp9XRpMnzHmG9",
            displayAddress: "BbvHGH...zHmG9",
            totalProfit: 98760,
            totalTrades: 325,
            winRate: 71,
            strategy: "DeFi Yield",
            riskScore: "Medium"
        },
        {
            address: "EvE1DqPTtMhGjG9Vje7txkQak9VG9gXXpwXYBvbXUyNx",
            displayAddress: "EvE1Dq...UyNx",
            totalProfit: 345670,
            totalTrades: 587,
            winRate: 74,
            strategy: "NFT Flipping",
            riskScore: "High"
        }
    ];
};

// Mock implementation for setting up copy trading
export const setupCopyTrading = async (setup: CopyTradingSetup): Promise<boolean> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // In a real app, this would call an API to set up the copy trading
    console.log("Setting up copy trading with:", setup);

    // Simulate 95% success rate
    if (Math.random() > 0.05) {
        toast({
            title: "Copy Trading Setup",
            description: `Successfully set up copy trading for trader ${setup.traderAddress.slice(0, 6)}...`,
            duration: 3000
        });
        return true;
    } else {
        // Simulate occasional failure
        throw new Error("Failed to set up copy trading. Please try again.");
    }
};

// Mock implementation for stopping copy trading
export const stopCopyTrading = async (traderAddress: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // In a real app, this would call an API to stop the copy trading
    console.log("Stopping copy trading for:", traderAddress);

    // Simulate high success rate
    if (Math.random() > 0.02) {
        toast({
            title: "Copy Trading Stopped",
            description: `Successfully stopped copy trading for trader ${traderAddress.slice(0, 6)}...`,
            duration: 3000
        });
        return true;
    } else {
        // Simulate occasional failure
        throw new Error("Failed to stop copy trading. Please try again.");
    }
};

// Get news and sentiment - more comprehensive implementation from both files
export const getNewsAndSentiment = async (filter = "all", category = "trending") => {
    try {
        // In a real app, this would call a news API like CryptoPanic
        // Generate mock news items for consistent return format
        const generateMockNews = (count: number): NewsItem[] => {
            const results: NewsItem[] = [];
            const sources = [
                { title: "Crypto News", domain: "cryptonews.com" },
                { title: "Solana Times", domain: "solanatimes.io" },
                { title: "Twitter", domain: "twitter.com" },
                { title: "Reddit", domain: "reddit.com" },
                { title: "BlockWorks", domain: "blockworks.co" },
            ];

            const titles = [
                "Solana reaches new all-time high in daily transactions",
                "Jupiter introduces new swap protocol on Solana",
                "Solana DeFi ecosystem surpasses $10B in TVL",
                "New NFT collection launches on Solana, sells out in minutes",
                "Ethereum bridge to Solana sees increased activity",
                "Major exchange adds support for JTO and BONK tokens",
                "Analysts predict bullish Q3 for Solana ecosystem",
                "Developers flock to Solana for new DeFi applications",
                "SOL price breaks through key resistance level",
                "Solana Foundation announces new developer grants",
                "Community votes on key protocol upgrade for Solana",
                "Mad Lads NFT floor price surges after new utility announcement",
            ];

            const descriptions = [
                "The Solana blockchain has set a new record for daily transactions, surpassing previous highs with over 50 million transactions in 24 hours.",
                "Jupiter, the leading aggregator on Solana, has released a new swap protocol that improves execution and reduces slippage.",
                "Solana's DeFi ecosystem has grown significantly, now exceeding $10 billion in total value locked across various protocols.",
                "A new collection of NFTs on the Solana blockchain sold out within minutes of launch, demonstrating continued demand.",
                "The bridge between Ethereum and Solana has seen increased activity as users move assets between the two blockchains.",
                "A major cryptocurrency exchange has added support for JTO and BONK tokens, two popular tokens in the Solana ecosystem.",
                "Several market analysts have released reports predicting a bullish third quarter for the Solana ecosystem.",
                "Developer activity on Solana continues to grow as more teams build DeFi applications on the high-performance blockchain.",
                "The price of SOL has broken through a key resistance level, potentially signaling a new bullish trend.",
                "The Solana Foundation has announced a new round of developer grants to support projects building on the blockchain.",
                "The Solana community is voting on a key protocol upgrade that aims to improve performance and stability.",
                "The floor price for Mad Lads NFTs has increased significantly following an announcement of new utility features."
            ];

            for (let i = 0; i < count; i++) {
                const sourceIndex = Math.floor(Math.random() * sources.length);
                const titleIndex = Math.floor(Math.random() * titles.length);
                const source = sources[sourceIndex];
                const title = titles[titleIndex];
                const description = descriptions[titleIndex];

                const positiveVotes = Math.floor(Math.random() * 1000) + 50;
                const negativeVotes = Math.floor(Math.random() * 500);

                const hoursAgo = Math.floor(Math.random() * 48);
                const publishedDate = new Date();
                publishedDate.setHours(publishedDate.getHours() - hoursAgo);

                results.push({
                    id: `news-${i}`,
                    title,
                    url: `https://${source.domain}/article-${i}`,
                    source: {
                        title: source.title,
                        domain: source.domain,
                        path: `/article-${i}`,
                    },
                    domain: source.domain,
                    published_at: publishedDate.toISOString(),
                    created_at: publishedDate.toISOString(),
                    votes: {
                        negative: negativeVotes,
                        positive: positiveVotes,
                        important: Math.floor(Math.random() * 100) + 10,
                        liked: Math.floor(Math.random() * 200) + 20,
                        disliked: Math.floor(Math.random() * 50) + 5,
                        lol: Math.floor(Math.random() * 30),
                        toxic: Math.floor(Math.random() * 20),
                        saved: Math.floor(Math.random() * 150) + 15,
                        comments: Math.floor(Math.random() * 200) + 10,
                    },
                    metadata: {
                        description: description,
                        image: `https://picsum.photos/seed/solana${i}/200/200`,
                    },
                    currencies: [
                        {
                            code: "SOL",
                            title: "Solana",
                            slug: "solana",
                            url: "https://solana.com",
                        },
                    ],
                });
            }

            return results;
        };

        // Generate mock news data
        let mockNewsItems = generateMockNews(20);

        // Filter news items based on the filter parameter if needed
        let filteredNews = mockNewsItems;
        if (filter !== "all") {
            filteredNews = mockNewsItems.filter(item =>
                item.currencies?.some(currency => currency.code.toLowerCase() === filter.toLowerCase())
            );
        }

        // Filter based on category (trending, hot, bullish, bearish)
        if (category === "hot") {
            filteredNews = filteredNews.sort((a, b) =>
                (b.votes.positive + b.votes.negative) - (a.votes.positive + a.votes.negative)
            );
        } else if (category === "bullish") {
            filteredNews = filteredNews.filter(item =>
                item.votes.positive > item.votes.negative * 2
            );
        } else if (category === "bearish") {
            filteredNews = filteredNews.filter(item =>
                item.votes.negative > item.votes.positive
            );
        }

        // Ensure we always have at least 5 results regardless of filter
        if (filteredNews.length < 5) {
            const additionalItems = generateMockNews(10);
            filteredNews = [...filteredNews, ...additionalItems].slice(0, 10);
        }

        // Create mock response structure
        const mockResponse: CryptoPanicResponse = {
            count: filteredNews.length,
            next: null,
            previous: null,
            results: filteredNews
        };

        return mockResponse;
    } catch (error) {
        console.error("Error fetching news and sentiment:", error);
        throw error;
    }
};

// Mock implementation for token sentiment data
export const getTokenSentimentData = async (tokensList: string[] = []) => {
    // In a real app, this would call a sentiment analysis API
    // Normalize input tokens
    const tokens = tokensList.length > 0 ? tokensList : ["SOL", "JUP", "BONK", "JTO", "RAY"];

    // Generate mock token sentiment data
    const generateTokenData = (): TokenSentiment[] => {
        return tokens.map(token => {
            const score = Math.floor(Math.random() * 100);
            let status, changeDirection;

            if (score >= 75) {
                status = "Very Bullish";
                changeDirection = "+";
            } else if (score >= 60) {
                status = "Bullish";
                changeDirection = "+";
            } else if (score <= 25) {
                status = "Very Bearish";
                changeDirection = "-";
            } else if (score <= 40) {
                status = "Bearish";
                changeDirection = "-";
            } else {
                status = "Neutral";
                changeDirection = Math.random() > 0.5 ? "+" : "-";
            }

            const changePercent = (Math.random() * 15).toFixed(2);
            const change = `${changeDirection}${changePercent}%`;
            const mentions = Math.floor(Math.random() * 50000) + 5000;

            // Generate chart data for the last 7 days
            const chartData: ChartDataPoint[] = [];
            for (let i = 6; i >= 0; i--) {
                const day = new Date();
                day.setDate(day.getDate() - i);
                const dayName = day.toLocaleDateString('en-US', { weekday: 'short' });
                chartData.push({
                    name: dayName,
                    value: Math.floor(Math.random() * 100)
                });
            }

            return {
                name: token,
                score,
                change,
                status,
                mentions,
                chartData
            };
        });
    };

    // Generate mock platform sentiment data
    const generatePlatformData = (): PlatformSentiment[] => {
        const platforms = [
            "Twitter",
            "Reddit",
            "Discord",
            "Telegram"
        ];

        return platforms.map(platform => {
            const total = Math.floor(Math.random() * 1000) + 200;
            const positive = Math.floor(Math.random() * (total * 0.6));
            const negative = Math.floor(Math.random() * (total * 0.4));
            const neutral = total - positive - negative;

            return {
                name: platform,
                positive,
                neutral,
                negative
            };
        });
    };

    return {
        tokens: generateTokenData(),
        platforms: generatePlatformData()
    };
};

// Mock implementation for sentiment analysis
export const analyzeSentiment = async (text: string) => {
    // In a real app, this would call an NLP API or sentiment analysis service
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Generate a sentiment score based on keywords in the text
    let score = 0.5; // Neutral default

    const positiveKeywords = ["bullish", "buy", "up", "growth", "increase", "positive", "good", "great", "excellent", "gain"];
    const negativeKeywords = ["bearish", "sell", "down", "decline", "decrease", "negative", "bad", "poor", "loss", "crash"];

    const lowerText = text.toLowerCase();

    // Simple keyword-based analysis
    positiveKeywords.forEach(keyword => {
        if (lowerText.includes(keyword)) score += 0.1;
    });

    negativeKeywords.forEach(keyword => {
        if (lowerText.includes(keyword)) score -= 0.1;
    });

    // Clamp score between 0 and 1
    score = Math.max(0, Math.min(1, score));

    let sentiment;
    if (score > 0.7) {
        sentiment = "positive";
    } else if (score < 0.4) {
        sentiment = "negative";
    } else {
        sentiment = "neutral";
    }

    return {
        score,
        confidence: 0.7 + Math.random() * 0.2, // 70-90% confidence
        sentiment,
        trend: sentiment === "positive" ? "bullish" : 
            sentiment === "negative" ? "bearish" : "neutral",
        entities: [
            { name: "SOL", sentiment: score > 0.5 ? "positive" : "negative", confidence: 0.8 }
        ]
    };
};

// Mock implementation for market events
export const detectEvents = async (query: string = ""): Promise<Event[]> => {
    // In a real app, this would call an event detection API

    // Generate mock events based on query
    const events = [
        {
            title: "Solana Token 2025 Upgrade",
            description: "Solana implementing Token 2025 program with enhanced token features",
            impact: "Medium",
            timestamp: new Date(Date.now() + 2 * 24 * 3600000).toISOString(), // 2 days in future
            source: "Solana Foundation"
        },
        {
            title: "Fed Interest Rate Decision",
            description: "Federal Reserve expected to announce interest rate decision",
            impact: "High",
            timestamp: new Date(Date.now() + 5 * 24 * 3600000).toISOString(), // 5 days in future
            source: "Federal Reserve"
        },
        {
            title: "Jupiter DEX v7 Launch",
            description: "Major upgrade to Jupiter DEX platform with new features",
            impact: "Medium",
            timestamp: new Date(Date.now() + 8 * 24 * 3600000).toISOString(), // 8 days in future
            source: "Jupiter"
        },
        {
            title: "Breakpoint 2025 Conference",
            description: "Annual Solana conference featuring major ecosystem announcements",
            impact: "High",
            timestamp: new Date(Date.now() + 45 * 24 * 3600000).toISOString(), // 45 days in future
            source: "Solana Foundation"
        },
        {
            title: "Firedancer Client Launch",
            description: "Release of the alternative Solana client implementation by Jump Crypto",
            impact: "High",
            timestamp: new Date(Date.now() + 14 * 24 * 3600000).toISOString(), // 14 days in future
            source: "Jump Crypto"
        },
        {
            title: "Solana Hackathon Finals",
            description: "Global hackathon showcasing new projects built on Solana",
            impact: "Low",
            timestamp: new Date(Date.now() + 30 * 24 * 3600000).toISOString(), // 30 days in future
            source: "Solana Labs"
        }
    ];

    // Filter or prioritize events based on query
    if (query && query.toLowerCase() !== "solana ecosystem") {
        const lowerQuery = query.toLowerCase();

        // If query contains specific tokens, filter for those
        if (lowerQuery.includes('sol') || lowerQuery.includes('solana')) {
            return events.filter(event =>
                event.title.toLowerCase().includes('sol') ||
                event.description.toLowerCase().includes('solana')
            );
        }

        if (lowerQuery.includes('bonk')) {
            return events.filter(event =>
                event.title.toLowerCase().includes('bonk') ||
                event.description.toLowerCase().includes('bonk')
            );
        }

        if (lowerQuery.includes('jito')) {
            return events.filter(event =>
                event.title.toLowerCase().includes('jito') ||
                event.description.toLowerCase().includes('jito')
            );
        }

        // Default return all events sorted by time
        return events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    }

    // Return all events if no query specified
    return events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
};

// Portfolio data APIs
export const getPortfolioData = async (walletAddress: string): Promise<PortfolioData> => {
    try {
        if (!walletAddress) throw new Error('Wallet address is required');

        const publicKey = new PublicKey(walletAddress);

        // In a production app, we would use a combination of:
        // 1. RPC calls to get token balances
        // 2. Price APIs to get current prices
        // 3. Historical data APIs for performance
        // 4. NFT APIs for NFT holdings

        // Get token balances
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
            programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
        });

        // Get SOL balance
        const solBalance = await connection.getBalance(publicKey);
        const solBalanceInSol = solBalance / LAMPORTS_PER_SOL;

        // Fetch token prices from CoinGecko
        const tokenPricesResponse = await fetchWithRetry(`${COINGECKO_API}/simple/price`, {
            params: {
                ids: 'solana,usd-coin,jupiter,bonk,raydium,jito-dao',
                vs_currencies: 'usd',
                include_24hr_change: true
            }
        });

        const tokenPrices = tokenPricesResponse.data as any;

        // Process token balances
        const tokens: Token[] = [{
            symbol: 'SOL',
            name: 'Solana',
            amount: solBalance,
            decimals: 9,
            uiAmount: solBalanceInSol,
            price: tokenPrices.solana?.usd || 0,
            value: solBalanceInSol * (tokenPrices.solana?.usd || 0),
            change24h: tokenPrices.solana?.usd_24h_change || 0
        }];

        // Add other tokens
        tokenAccounts.value.forEach(account => {
            const parsedInfo = account.account.data.parsed.info;
            const mintAddress = parsedInfo.mint;
            const amount = parsedInfo.tokenAmount.amount;
            const decimals = parsedInfo.tokenAmount.decimals;
            const uiAmount = parsedInfo.tokenAmount.uiAmount;

            if (uiAmount > 0) {
                // In a real app, we would have a mapping of mint addresses to token info
                const symbol = 'UNKNOWN';
                const name = 'Unknown Token';
                const price = 0;

                tokens.push({
                    symbol,
                    name,
                    amount: Number(amount),
                    decimals,
                    uiAmount,
                    price,
                    value: uiAmount * price
                });
            }
        });

        // Calculate portfolio totals
        const totalValue = tokens.reduce((sum, token) => sum + (token.value || 0), 0);
        const totalPnL = totalValue * 0.15; // Simplified calculation
        const pnlPercentage = 15; // Simplified

        // Create allocation data
        const allocation = tokens
            .filter(token => token.value && token.value > 0)
            .map(token => ({
                name: token.symbol,
                value: Math.round((token.value || 0) / totalValue * 100),
                amount: token.value || 0
            }));

        // Add "Others" category if needed
        if (allocation.length > 4) {
            const topTokens = allocation.slice(0, 4);
            const others = allocation.slice(4);
            const othersValue = others.reduce((sum, item) => sum + item.amount, 0);

            allocation.splice(4, others.length, {
                name: 'Others',
                value: Math.round(othersValue / totalValue * 100),
                amount: othersValue
            });
        }

        return {
            totalValue,
            totalPnL,
            pnlPercentage,
            tokens,
            nfts: [], // Would be populated from NFT API
            allocation,
            performanceHistory: [
                { name: "1w ago", value: totalValue * 0.92 },
                { name: "3d ago", value: totalValue * 0.96 },
                { name: "1d ago", value: totalValue * 0.98 },
                { name: "Now", value: totalValue }
            ]
        };
    } catch (error) {
        console.error('Error getting portfolio data:', error);
        throw error;
    }
};

// Get historical market data for the portfolio
export const getPortfolioPerformanceHistory = async (walletAddress: string, timeframe = '1m') => {
    try {
        // In a real app, this would call historical balance API
        // For now, returning simulated data

        const today = new Date();
        const dataPoints: { name: string; value: number }[] = [];
        let days = 30;

        if (timeframe === '1w') days = 7;
        else if (timeframe === '3m') days = 90;
        else if (timeframe === '1y') days = 365;

        // Generate simulated historical data
        let currentValue = 10000; // Starting value
        const volatility = 0.02; // 2% daily volatility
        const trend = 0.005; // 0.5% average daily growth

        for (let i = days; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);

            // Add random walk with trend
            const randomChange = (Math.random() - 0.5) * 2 * volatility;
            currentValue = currentValue * (1 + randomChange + trend);

            const dateStr = date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });

            dataPoints.push({
                name: dateStr,
                value: Math.round(currentValue * 100) / 100
            });
        }

        return dataPoints;
    } catch (error) {
        console.error('Error getting portfolio performance history:', error);
        return [];
    }
};

// Get NFT collections by volume
export const getNFTCollections = async () => {
    try {
        // In a real app, this would call an NFT marketplace API
        // For now, returning simulated data with randomization

        const collections = [
            {
                name: "Mad Lads",
                floorPrice: 45.5 + Math.random() * 5 - 2.5,
                volume24h: 1250 + Math.random() * 250 - 125,
                items: 10000,
                owners: 3500,
                marketCap: 455000
            },
            {
                name: "DeGods",
                floorPrice: 320.2 + Math.random() * 15 - 7.5,
                volume24h: 2100 + Math.random() * 400 - 200,
                items: 10000,
                owners: 5200,
                marketCap: 3202000
            },
            {
                name: "Okay Bears",
                floorPrice: 25.8 + Math.random() * 3 - 1.5,
                volume24h: 800 + Math.random() * 200 - 100,
                items: 10000,
                owners: 4800,
                marketCap: 258000
            },
            {
                name: "SMB",
                floorPrice: 18.5 + Math.random() * 2 - 1,
                volume24h: 650 + Math.random() * 150 - 75,
                items: 5000,
                owners: 2200,
                marketCap: 92500
            }
        ];

        return collections;
    } catch (error) {
        console.error('Error getting NFT collections:', error);
        return [];
    }
};

// Helper function to generate order book data - alternative implementation
// from api-service.tsx for compatibility
function generateOrderBookData(): OrderBookData {
    const midPrice = 173.5; // Base price for SOL/USDC

    const asks: OrderBookEntry[] = [];
    const bids: OrderBookEntry[] = [];

    // Generate asks (higher than midPrice)
    for (let i = 0; i < 20; i++) {
        const priceGap = 0.2 + (Math.random() * 0.3); // Small random gap between price levels
        const price = midPrice + (i * priceGap);
        const size = 5 + Math.random() * 300; // Random size between 5 and 305

        asks.push({
            price,
            size
        });
    }

    // Sort asks ascending by price
    asks.sort((a, b) => a.price - b.price);

    // Generate bids (lower than midPrice)
    for (let i = 0; i < 20; i++) {
        const priceGap = 0.2 + (Math.random() * 0.3);
        const price = midPrice - (i * priceGap);
        const size = 5 + Math.random() * 300;

        bids.push({
            price,
            size
        });
    }

    // Sort bids descending by price
    bids.sort((a, b) => b.price - a.price);

    return { asks, bids };
}

// Helper to update order book data for simulating real-time changes
function updateOrderBookData(currentData: OrderBookData): OrderBookData {
    const updatedAsks = [...currentData.asks];
    const updatedBids = [...currentData.bids];

    // Modify a few random asks
    for (let i = 0; i < 3; i++) {
        const randomIndex = Math.floor(Math.random() * updatedAsks.length);
        const sizeDelta = (Math.random() * 20) - 10; // Random change between -10 and +10
        updatedAsks[randomIndex].size = Math.max(1, updatedAsks[randomIndex].size + sizeDelta);
    }

    // Modify a few random bids
    for (let i = 0; i < 3; i++) {
        const randomIndex = Math.floor(Math.random() * updatedBids.length);
        const sizeDelta = (Math.random() * 20) - 10;
        updatedBids[randomIndex].size = Math.max(1, updatedBids[randomIndex].size + sizeDelta);
    }

    return {
        asks: updatedAsks,
        bids: updatedBids
    };
}

// Export a default API service object
export default {
    // Core API functions
    getSolanaData,
    getSolHistoricalData,
    getTokenVolumeData,
    
    // Network and WebSocket functions
    createNetworkStatsWebSocket,
    createOrderBookWebSocket,
    createAlertsWebSocket,
    
    // Data retrieval functions
    getPersonalizedRecommendations,
    getDefiOpportunities,
    getTopTraders,
    getPortfolioData,
    getPortfolioPerformanceHistory,
    getNFTCollections,
    
    // Trading functions
    setupCopyTrading,
    stopCopyTrading,
    
    // Analysis functions
    getNewsAndSentiment,
    getTokenSentimentData,
    analyzeSentiment,
    detectEvents
};