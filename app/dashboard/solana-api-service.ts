import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import axios from 'axios';

// Define the interfaces for the Solana API data
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

export interface PriceUpdateData {
    symbol: string;
    price: number;
    change24h: number;
    volume24h: number;
    marketCap: number;
    timestamp: number;
}

// Connection to Solana blockchain - use devnet as default
const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com');

// CoinGecko API for token prices
const COINGECKO_API = 'https://api.coingecko.com/api/v3';

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

// Fetch Solana network data
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
            }
        };
    } catch (error) {
        console.error('Error fetching Solana data:', error);
        throw error;
    }
};

// Fetch historical SOL price data
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
        const prices = (response.data as { prices: [number, number][] }).prices;
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
        throw error;
    }
};

// Fetch token volume data
export const getTokenVolumeData = async () => {
    try {
        // For demonstration purposes - replace with actual API call in production
        return [
            { name: 'SOL', value: 287.5 },
            { name: 'JUP', value: 124.3 },
            { name: 'JTO', value: 89.7 },
            { name: 'BONK', value: 67.2 },
            { name: 'RAY', value: 42.1 }
        ];
    } catch (error) {
        console.error('Error fetching token volume data:', error);
        return [];
    }
};

// Fetch NFT marketplace volume data
export const getNFTVolumeData = async () => {
    try {
        // For demonstration purposes - replace with actual API call in production
        return [
            { name: 'Magic Eden', value: 42.7 },
            { name: 'Tensor', value: 31.4 },
            { name: 'Solanart', value: 12.6 },
            { name: 'Solsea', value: 8.4 },
            { name: 'Other', value: 4.9 }
        ];
    } catch (error) {
        console.error('Error fetching NFT volume data:', error);
        return [];
    }
};

// WebSocket simulation for network stats (since we can't create actual WebSockets in this context)
export const createNetworkStatsWebSocket = (onUpdate: (data: NetworkStatsData) => void) => {
    // For demonstration - this would use an actual WebSocket in production
    const interval = setInterval(() => {
        const randomTPS = Math.floor(2000 + Math.random() * 2500);
        const randomSlot = 200000000 + Math.floor(Math.random() * 10000);

        onUpdate({
            tps: randomTPS,
            slot: randomSlot,
            latency: 0.8 + Math.random() * 0.4, // Random latency between 0.8 and 1.2s
            status: Math.random() > 0.95 ? 'degraded' : 'up', // Occasional degraded status
            timestamp: Date.now(),
            validators: {
                active: 1782,
                total: 2105,
                delinquent: Math.floor(Math.random() * 50)
            },
            epoch: {
                current: 420,
                slot: randomSlot % 432000, // Slots in epoch
                progress: (randomSlot % 432000) / 432000 * 100
            }
        });
    }, 5000); // Update every 5 seconds

    return {
        disconnect: () => clearInterval(interval)
    };
};

// WebSocket simulation for token prices
export const createTokenPriceWebSocket = (
    symbols: string[],
    onUpdate: (data: Record<string, PriceUpdateData>) => void
) => {
    // Initial token price data
    const baseTokenData: Record<string, PriceUpdateData> = {
        SOL: { symbol: 'SOL', price: 178.24, change24h: 2.4, volume24h: 287500000, marketCap: 78560000000, timestamp: Date.now() },
        JTO: { symbol: 'JTO', price: 2.87, change24h: 1.2, volume24h: 89700000, marketCap: 1450000000, timestamp: Date.now() },
        BONK: { symbol: 'BONK', price: 0.00001867, change24h: -3.1, volume24h: 67200000, marketCap: 1210000000, timestamp: Date.now() },
        JUP: { symbol: 'JUP', price: 1.42, change24h: 0.8, volume24h: 124300000, marketCap: 2150000000, timestamp: Date.now() },
        RAY: { symbol: 'RAY', price: 0.786, change24h: -1.5, volume24h: 42100000, marketCap: 674000000, timestamp: Date.now() },
        PYTH: { symbol: 'PYTH', price: 0.672, change24h: 4.2, volume24h: 56700000, marketCap: 982000000, timestamp: Date.now() },
        RENDER: { symbol: 'RENDER', price: 10.23, change24h: 0.5, volume24h: 34500000, marketCap: 1820000000, timestamp: Date.now() }
    };

    // Immediately send initial data
    const filteredData: Record<string, PriceUpdateData> = {};
    symbols.forEach(symbol => {
        if (baseTokenData[symbol]) {
            filteredData[symbol] = baseTokenData[symbol];
        }
    });
    onUpdate(filteredData);

    // Update prices periodically
    const interval = setInterval(() => {
        const updatedData: Record<string, PriceUpdateData> = {};
        const symbolsToUpdate = symbols.filter(() => Math.random() > 0.7); // Only update some tokens each time

        symbolsToUpdate.forEach(symbol => {
            if (baseTokenData[symbol]) {
                // Create a small random price change
                const priceChange = baseTokenData[symbol].price * (Math.random() * 0.01 - 0.005); // -0.5% to +0.5%
                const newPrice = baseTokenData[symbol].price + priceChange;

                // Update the base data
                baseTokenData[symbol] = {
                    ...baseTokenData[symbol],
                    price: newPrice,
                    change24h: baseTokenData[symbol].change24h + (Math.random() * 0.4 - 0.2), // Adjust 24h change slightly
                    timestamp: Date.now()
                };

                // Add to update batch
                updatedData[symbol] = baseTokenData[symbol];
            }
        });

        if (Object.keys(updatedData).length > 0) {
            onUpdate(updatedData);
        }
    }, 3000); // Update every 3 seconds

    return {
        disconnect: () => clearInterval(interval)
    };
}; 