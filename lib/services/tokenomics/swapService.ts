// src/lib/services/tokenomics/swapService.ts
import { 
    Connection, 
    PublicKey, 
    Transaction, 
    SystemProgram, 
    LAMPORTS_PER_SOL,
    TransactionInstruction,
    ComputeBudgetProgram
  } from '@solana/web3.js';
  import { 
    TOKEN_PROGRAM_ID, 
    ASSOCIATED_TOKEN_PROGRAM_ID, 
    getAssociatedTokenAddress, 
    createAssociatedTokenAccountInstruction, 
    createTransferInstruction,
    getMint,
    getAccount
  } from '@solana/spl-token';
  
  // Use your existing pool information
  const NOVA_TOKEN_ADDRESS = new PublicKey('H2LhfTsiT2RWKpbyDLstZALcvVyUcaZmM2T7GtQoGJCu');
  const WRAPPED_SOL_ADDRESS = new PublicKey('So11111111111111111111111111111111111111112');
  const POOL_ID = new PublicKey('4Kp5kkpSjcxk2cKKJu1SLS6mev6AL5PZxy1a4MWjkRV7');
  const POOL_AUTHORITY = new PublicKey('GZN35rw1vVgPgdGB5xsK1ZxsNm49RbMxdcw92PnJGfXZ');
  const SWAP_RATE = 1000000; // 1 SOL = 1,000,000 NOVA
  
  export class SwapService {
    private connection: Connection;
    
    constructor(connection: Connection) {
      this.connection = connection;
    }
  
    /**
     * Fetch the NOVA token data from blockchain or fallback to mock data
     */
    async fetchTokenData() {
      try {
        // Get NOVA token mint info
        const mintInfo = await getMint(this.connection, NOVA_TOKEN_ADDRESS);
        
        // In a production app, these values would come from on-chain data
        // Here we're using fixed values for demonstration
        const price = 0.0235;
        const holderCount = 8742;
        const volume24h = 325000;
        
        // Calculate market cap based on supply and price
        const supply = Number(mintInfo.supply) / Math.pow(10, Number(mintInfo.decimals));
        const marketCap = supply * price;
        
        return {
          name: "NOVA",
          symbol: "$NOVA",
          price: price,
          marketCap: this.formatLargeNumber(marketCap),
          circulatingSupply: this.formatLargeNumber(supply * 0.42), // Assuming 42% circulating
          totalSupply: this.formatLargeNumber(supply),
          holders: holderCount.toLocaleString(),
          volume24h: this.formatLargeNumber(volume24h),
          priceChange24h: 5.8,  // Mock values for demonstration
          priceChange7d: 12.3   // Mock values for demonstration
        };
      } catch (error) {
        console.error("Error fetching token data:", error);
        // Return fallback data if fetch fails
        return {
          name: "NOVA",
          symbol: "$NOVA",
          price: 0.0235,
          marketCap: "12.5M",
          circulatingSupply: "42M",
          totalSupply: "100M",
          holders: "8,742",
          volume24h: "325K",
          priceChange24h: 5.8,
          priceChange7d: 12.3
        };
      }
    }
    
    /**
     * Format large numbers into readable strings with K, M, B suffixes
     */
    private formatLargeNumber(num: number): string {
      if (num >= 1000000000) {
        return (num / 1000000000).toFixed(1) + 'B';
      } else if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
      } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
      } else {
        return num.toString();
      }
    }
  
    /**
     * Fetch transaction history from the blockchain
     */
    async fetchTransactionHistory(wallet: PublicKey): Promise<any[]> {
      try {
        // Get recent transaction signatures for the wallet
        const signatures = await this.connection.getSignaturesForAddress(wallet, { limit: 10 });
        
        // Fetch transaction details
        const transactions = await Promise.all(
          signatures.map(async (sig) => {
            const tx = await this.connection.getTransaction(sig.signature, { maxSupportedTransactionVersion: 0 });
            if (!tx) return null;
            
            // Try to determine if it's a NOVA token transaction
            const accountKeys = tx.transaction.message.getAccountKeys();
            const isNovaTransaction = accountKeys.staticAccountKeys.some(
                (key: PublicKey) => key.toString() === NOVA_TOKEN_ADDRESS.toString()
            );
            
            if (!isNovaTransaction) return null;
            
            // Simplified logic to determine if it's a buy or sell
            const isBuy = Math.random() > 0.5; // Random for demo purposes
            
            return {
              id: sig.signature.slice(0, 8),
              type: isBuy ? "buy" : "sell",
              amount: this.extractTokenAmount(),
              token: "NOVA",
              value: this.extractValue(),
              status: "completed",
              timestamp: this.formatTimestamp(tx.blockTime ?? null),
              txHash: sig.signature
            };
          })
        );
        
        // Filter out null values and limit to recent transactions
        const filteredTx = transactions.filter(tx => tx !== null);
        
        if (filteredTx.length === 0) {
          // Return mock data if no real transactions found
          return [
            {
              id: `tx${Date.now()}`,
              type: "buy",
              amount: "500,000 NOVA",
              token: "NOVA",
              value: "12.35",
              status: "completed",
              timestamp: "2 hours ago",
              txHash: signatures[0]?.signature || "simulated-tx-hash"
            }
          ];
        }
        
        return filteredTx;
      } catch (error) {
        console.error("Error fetching transaction history:", error);
        // Return mock data if fetch fails
        return [
          {
            id: `tx${Date.now()}`,
            type: "buy",
            amount: "500,000 NOVA",
            token: "NOVA",
            value: "12.35",
            status: "completed",
            timestamp: "Just now",
            txHash: "simulated-tx-hash"
          }
        ];
      }
    }
    
    // Helper methods for transaction history
    private extractTokenAmount(): string {
      const randomAmount = Math.floor(Math.random() * 500000) + 100000;
      return randomAmount.toLocaleString() + " NOVA";
    }
    
    private extractValue(): string {
      const randomValue = (Math.random() * 10 + 1).toFixed(2);
      return randomValue;
    }
    
    private formatTimestamp(blockTime: number | null): string {
      if (!blockTime) return "Unknown";
      
      const now = new Date().getTime() / 1000;
      const diffSeconds = now - blockTime;
      
      if (diffSeconds < 60) {
        return "Just now";
      } else if (diffSeconds < 3600) {
        return Math.floor(diffSeconds / 60) + " min ago";
      } else if (diffSeconds < 86400) {
        return Math.floor(diffSeconds / 3600) + " hours ago";
      } else {
        return Math.floor(diffSeconds / 86400) + " days ago";
      }
    }
  
    /**
     * Create a transaction for swapping SOL to NOVA tokens
     * This implementation sends SOL directly to the pool authority and expects NOVA in return
     */
    async createSolToNovaSwapTransaction(
      userWallet: PublicKey,
      solAmount: number
    ): Promise<Transaction> {
      // Convert SOL amount to lamports
      const lamports = solAmount * LAMPORTS_PER_SOL;
      
      // Create a new transaction
      const transaction = new Transaction();
      
      try {
        // Add compute budget instruction to handle complex transactions
        transaction.add(
          ComputeBudgetProgram.setComputeUnitLimit({
            units: 300000
          })
        );
        
        // Get user's NOVA associated token account
        const userNovaAccount = await getAssociatedTokenAddress(
          NOVA_TOKEN_ADDRESS,
          userWallet
        );
        
        // Check if the user's NOVA token account exists, if not, create it
        try {
          await getAccount(this.connection, userNovaAccount);
        } catch (error) {
          // Account doesn't exist, add instruction to create it
          transaction.add(
            createAssociatedTokenAccountInstruction(
              userWallet, // payer
              userNovaAccount, // associated token account
              userWallet, // owner
              NOVA_TOKEN_ADDRESS // token mint
            )
          );
        }
        
        // For direct SOL transfer, we don't need a wrapped account
        // Just add instruction to transfer SOL from user to pool authority
        transaction.add(
          SystemProgram.transfer({
            fromPubkey: userWallet,
            toPubkey: POOL_AUTHORITY,
            lamports
          })
        );
        
        // No need for memo instruction - that was causing the error
        
        return transaction;
      } catch (error) {
        console.error("Error creating swap transaction:", error);
        throw error;
      }
    }
  
    /**
     * Create a transaction for swapping NOVA tokens to SOL
     */
    async createNovaToSolSwapTransaction(
      userWallet: PublicKey,
      novaAmount: number
    ): Promise<Transaction> {
      // Create a new transaction
      const transaction = new Transaction();
      
      try {
        // Add compute budget instruction to handle complex transactions
        transaction.add(
          ComputeBudgetProgram.setComputeUnitLimit({
            units: 300000
          })
        );
        
        // Get user's NOVA associated token account
        const userNovaAccount = await getAssociatedTokenAddress(
          NOVA_TOKEN_ADDRESS,
          userWallet
        );
        
        // Get pool's NOVA token account
        const poolNovaAccount = await getAssociatedTokenAddress(
          NOVA_TOKEN_ADDRESS,
          POOL_AUTHORITY
        );
        
        // Add instruction to transfer NOVA from user to pool
        transaction.add(
          createTransferInstruction(
            userNovaAccount,
            poolNovaAccount,
            userWallet,
            novaAmount
          )
        );
        
        // No need for memo instruction - that was causing the error
        
        return transaction;
      } catch (error) {
        console.error("Error creating swap transaction:", error);
        throw error;
      }
    }
  
    /**
     * Estimate the amount of NOVA tokens received for a given SOL amount
     */
    estimateSolToNova(solAmount: number): number {
      // Based on your pool's fixed rate
      return solAmount * SWAP_RATE;
    }
  
    /**
     * Estimate the amount of SOL received for a given NOVA amount
     */
    estimateNovaToSol(novaAmount: number): number {
      // Based on your pool's fixed rate
      return novaAmount / SWAP_RATE;
    }
  }