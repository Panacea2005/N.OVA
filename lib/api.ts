import axios from 'axios';
import { Connection, PublicKey } from '@solana/web3.js';

// Thay đổi cách xác định API_BASE_URL để sử dụng Next.js API route
const API_BASE_URL = '/api/proxy'; // Sử dụng API proxy route của Next.js
const SOLANA_RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';

// Tăng cường hàm axios.create với timeout dài hơn và retries
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000, // Tăng timeout lên 30 giây
});

// Tạo hàm retry cho API requests với kiểu hàm đúng
const retryAxios = async <T>(axiosCall: () => Promise<T>, retries = 3, delay = 1000): Promise<T> => {
    try {
        return await axiosCall();
    } catch (error) {
        if (retries <= 0) {
            throw error;
        }
        await new Promise(resolve => setTimeout(resolve, delay));
        return retryAxios(axiosCall, retries - 1, delay * 2);
    }
};

// Cải thiện response interceptor với retry và thêm thông tin lỗi
api.interceptors.response.use(
    response => response,
    async (error) => {
        let errorMessage = 'Unknown error occurred';

        if (error.response) {
            // Server responded with an error status code
            errorMessage = `Server error: ${error.response.status} - ${JSON.stringify(error.response.data)}`;
            console.error('API error response:', errorMessage);
        } else if (error.request) {
            // Request was made but no response received
            errorMessage = `Network error: ${error.message} - Server không phản hồi`;
            console.error('API request error (no response):', errorMessage);
        } else {
            // Error in setting up the request
            errorMessage = `Setup error: ${error.message}`;
            console.error('API setup error:', errorMessage);
        }

        // Thêm thông tin lỗi để debugging
        error.friendlyMessage = errorMessage;
        return Promise.reject(error);
    }
);

// Khởi tạo Solana connection
let connection;
try {
    connection = new Connection(SOLANA_RPC_URL, 'confirmed');
} catch (error) {
    console.error('Failed to initialize Solana connection:', error);
    // Fallback to public endpoint if custom one fails
    connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');
}

// Solana API
export const solanaApi = {
    getTokenPrices: async () => {
        try {
            return await retryAxios(async () => {
                const response = await api.get('/solana/token/prices');
                return response.data;
            });
        } catch (error) {
            console.error('Failed to fetch token prices:', error);
            throw error;
        }
    },

    getNFTMetadata: async (address: string) => {
        try {
            return await retryAxios(async () => {
                const response = await api.get(`/solana/nft/${address}/metadata`);
                return response.data;
            });
        } catch (error) {
            console.error(`Failed to fetch NFT metadata for ${address}:`, error);
            throw error;
        }
    },

    getWalletTransactions: async (address: string) => {
        try {
            return await retryAxios(async () => {
                const response = await api.get(`/solana/wallet/${address}/transactions`);
                return response.data;
            });
        } catch (error) {
            console.error(`Failed to fetch wallet transactions for ${address}:`, error);
            throw error;
        }
    },

    getNetworkHealth: async () => {
        try {
            return await retryAxios(async () => {
                const response = await api.get('/solana/network/health');
                return response.data;
            });
        } catch (error) {
            console.error('Failed to fetch network health:', error);
            throw error;
        }
    },

    getDefiProtocols: async () => {
        try {
            return await retryAxios(async () => {
                const response = await api.get('/solana/defi/protocols');
                return response.data;
            });
        } catch (error) {
            console.error('Failed to fetch DeFi protocols:', error);
            throw error;
        }
    },

    getPoolLiquidity: async (poolAddress: string) => {
        try {
            return await retryAxios(async () => {
                const response = await api.get(`/solana/defi/pool/${poolAddress}/liquidity`);
                return response.data;
            });
        } catch (error) {
            console.error(`Failed to fetch pool liquidity for ${poolAddress}:`, error);
            throw error;
        }
    },

    getNetworkStats: async () => {
        try {
            return await retryAxios(async () => {
                const response = await api.get('/solana/network/stats');
                return response.data;
            });
        } catch (error) {
            console.error('Failed to fetch network stats:', error);
            throw error;
        }
    },

    getWalletHoldings: async (address: string) => {
        try {
            return await retryAxios(async () => {
                const response = await api.get(`/solana/wallet/${address}/holdings`);
                return response.data;
            });
        } catch (error) {
            console.error(`Failed to fetch wallet holdings for ${address}:`, error);
            throw error;
        }
    },

    getWalletPerformance: async (address: string) => {
        try {
            return await retryAxios(async () => {
                const response = await api.get(`/solana/wallet/${address}/performance`);
                return response.data;
            });
        } catch (error) {
            console.error(`Failed to fetch wallet performance for ${address}:`, error);
            throw error;
        }
    },
};

// Copy Trading API
export const copyTradingApi = {
    getTopTraders: async () => {
        try {
            const response = await api.get('/copy-trading/traders');
            return response.data;
        } catch (error) {
            console.error('Failed to fetch top traders:', error);
            throw error;
        }
    },

    getTraderPerformance: async (address: string) => {
        try {
            const response = await api.get(`/copy-trading/trader/${address}/performance`);
            return response.data;
        } catch (error) {
            console.error(`Failed to fetch trader performance for ${address}:`, error);
            throw error;
        }
    },

    setupCopyTrading: async (params: {
        traderAddress: string;
        copyPercentage: number;
        stopLoss: number;
        maxTradeAmount: number;
        wallet: PublicKey;
    }) => {
        try {
            const response = await api.post('/copy-trading/setup', params);
            return response.data;
        } catch (error) {
            console.error('Failed to setup copy trading:', error);
            throw error;
        }
    },

    getCopyTradingStatus: async (address: string) => {
        try {
            const response = await api.get(`/copy-trading/status/${address}`);
            return response.data;
        } catch (error) {
            console.error(`Failed to fetch copy trading status for ${address}:`, error);
            throw error;
        }
    },

    stopCopyTrading: async (address: string) => {
        try {
            const response = await api.post(`/copy-trading/stop/${address}`);
            return response.data;
        } catch (error) {
            console.error(`Failed to stop copy trading for ${address}:`, error);
            throw error;
        }
    },

    getUserStats: async (address: string) => {
        try {
            const response = await api.get(`/copy-trading/user/${address}/stats`);
            return response.data;
        } catch (error) {
            console.error(`Failed to fetch user stats for ${address}:`, error);
            throw error;
        }
    },
};

// Sentiment API
export const sentimentApi = {
    analyzeSentiment: async (query: string) => {
        try {
            const response = await api.get('/sentiment/analyze', {
                params: { query },
            });
            return response.data;
        } catch (error) {
            console.error(`Failed to analyze sentiment for query ${query}:`, error);
            throw error;
        }
    },

    getFarcasterData: async (query: string) => {
        try {
            const response = await api.get('/sentiment/farcaster', {
                params: { query },
            });
            return response.data;
        } catch (error) {
            console.error(`Failed to fetch Farcaster data for query ${query}:`, error);
            throw error;
        }
    },

    getTwitterData: async (query: string) => {
        try {
            const response = await api.get('/sentiment/twitter', {
                params: { query },
            });
            return response.data;
        } catch (error) {
            console.error(`Failed to fetch Twitter data for query ${query}:`, error);
            throw error;
        }
    },

    detectEvents: async (query: string) => {
        try {
            const response = await api.get('/sentiment/events', {
                params: { query },
            });
            return response.data;
        } catch (error) {
            console.error(`Failed to detect events for query ${query}:`, error);
            throw error;
        }
    },

    getSentimentTrend: async (query: string, timeframe: string) => {
        try {
            const response = await api.get('/sentiment/trend', {
                params: { query, timeframe },
            });
            return response.data;
        } catch (error) {
            console.error(`Failed to fetch sentiment trend for query ${query}:`, error);
            throw error;
        }
    },
};

export default api; 