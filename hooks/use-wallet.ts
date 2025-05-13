// File: hooks/use-wallet.ts - The core wallet hook with improved connection handling

"use client"

import { useState, useEffect, useCallback, useRef } from 'react';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { usePhantom } from './use-phantom';
import { useLazorKit } from './use-lazorkit';

export type WalletProvider = 'phantom' | 'lazorkit' | null;

export const useWallet = () => {
  const phantom = usePhantom();
  const lazorKit = useLazorKit();
  
  const [activeProvider, setActiveProvider] = useState<WalletProvider>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Add a connection attempt counter for better debugging
  const connectionAttempts = useRef(0);
  // Use a ref to track ongoing operations
  const pendingOperation = useRef<string | null>(null);

  // Reset error state when providers change
  useEffect(() => {
    if (phantom.isConnected || lazorKit.isConnected) {
      setError(null);
    }
  }, [phantom.isConnected, lazorKit.isConnected]);

  // Modified effect to properly track wallet connections with a more robust approach
  useEffect(() => {
    // Skip update during active connection process
    if (isConnecting) {
      console.log("Skipping provider update during active connection");
      return;
    }
    
    // Skip if there's a pending operation
    if (pendingOperation.current) {
      console.log(`Skipping provider update during pending operation: ${pendingOperation.current}`);
      return;
    }
    
    const phantomConnected = phantom.isConnected && phantom.walletAddress;
    const lazorKitConnected = lazorKit.isConnected && lazorKit.walletAddress;
    
    console.log("Checking wallet connections:", {
      phantomConnected,
      lazorKitConnected,
      currentActiveProvider: activeProvider,
      connectionAttempts: connectionAttempts.current
    });

    // Set the appropriate provider based on connection state
    if (phantomConnected && !lazorKitConnected) {
      console.log("Setting active provider to phantom");
      setActiveProvider('phantom');
    } else if (lazorKitConnected && !phantomConnected) {
      console.log("Setting active provider to lazorkit");
      setActiveProvider('lazorkit');
    } else if (!phantomConnected && !lazorKitConnected) {
      console.log("No wallets connected, setting provider to null");
      setActiveProvider(null);
    } else if (phantomConnected && lazorKitConnected) {
      // Both connected - prioritize the active provider or default to phantom
      console.log("Both wallets connected, prioritizing active provider");
      if (activeProvider === 'lazorkit') {
        // If lazorkit is active, disconnect phantom
        phantom.disconnectWallet().catch(err => {
          console.error("Error disconnecting phantom while lazorkit is active:", err);
        });
      } else {
        // Default to phantom, disconnect lazorkit
        lazorKit.disconnectWallet().catch(err => {
          console.error("Error disconnecting lazorkit while phantom is active:", err);
        });
        setActiveProvider('phantom');
      }
    }
  }, [phantom.isConnected, phantom.walletAddress, lazorKit.isConnected, 
      lazorKit.walletAddress, isConnecting, activeProvider]);

  // Safely disconnect a specific wallet with timeout and error handling
  const safeDisconnect = async (provider: WalletProvider): Promise<boolean> => {
    if (!provider) return true;
    
    try {
      pendingOperation.current = `disconnecting-${provider}`;
      console.log(`Safely disconnecting ${provider}...`);
      
      // Set a timeout to prevent hanging
      const timeoutPromise = new Promise<boolean>((resolve) => {
        setTimeout(() => {
          console.warn(`Disconnect timeout for ${provider}, continuing anyway`);
          resolve(false);
        }, 2000);
      });
      
      // The actual disconnect operation
      const disconnectPromise = (async (): Promise<boolean> => {
        try {
          if (provider === 'phantom') {
            await phantom.disconnectWallet();
          } else if (provider === 'lazorkit') {
            await lazorKit.disconnectWallet();
          }
          return true;
        } catch (err) {
          console.error(`Error safely disconnecting ${provider}:`, err);
          return false;
        }
      })();
      
      // Race between timeout and actual disconnect
      return await Promise.race([disconnectPromise, timeoutPromise]);
    } finally {
      pendingOperation.current = null;
    }
  };

  // Completely disconnect all wallets with improved reliability
  const disconnectAllWallets = async () => {
    console.log("Disconnecting all wallets");
    pendingOperation.current = 'disconnecting-all';
    
    try {
      setIsConnecting(true);
      
      // Disconnect both providers with timeouts to prevent hanging
      await Promise.all([
        safeDisconnect('phantom'),
        safeDisconnect('lazorkit')
      ]);
      
      // Force clear state regardless of disconnect success
      setActiveProvider(null);
    } catch (err) {
      console.error("Error disconnecting wallets:", err);
    } finally {
      setIsConnecting(false);
      pendingOperation.current = null;
    }
  };

  // Improved connection logic with strict provider switching
  const connectWallet = async (provider: WalletProvider = 'phantom') => {
    try {
      // If we're already connecting or have a pending operation, don't start another
      if (isConnecting || pendingOperation.current) {
        console.log(`Connection already in progress or pending operation: ${pendingOperation.current}`);
        return null;
      }
      
      // Increment attempt counter
      connectionAttempts.current++;
      console.log(`Connecting to ${provider} wallet (attempt #${connectionAttempts.current})`);
      
      setError(null);
      setIsConnecting(true);
      pendingOperation.current = `connecting-${provider}`;
      
      // Always disconnect all wallets first
      await disconnectAllWallets();
      
      // Add a small delay after disconnect to ensure state is clean
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Set active provider before connection to ensure proper UI updates
      setActiveProvider(provider);
      
      let address = null;
      
      // Connect to the specified provider
      if (provider === 'phantom') {
        console.log("Initiating Phantom wallet connection");
        try {
          // Directly connect using phantom hook
          address = await phantom.connectWallet();
          console.log(`Phantom connected with address: ${address}`);
        } catch (err) {
          console.error("Error directly connecting to Phantom:", err);
          // If direct connection fails, let wallet adapter handle it
          setActiveProvider('phantom');
          return null;
        }
      } else if (provider === 'lazorkit') {
        console.log("Initiating LazorKit wallet connection");
        address = await lazorKit.connectWallet();
        console.log(`LazorKit connected with address: ${address}`);
      } else {
        throw new Error("Invalid wallet provider");
      }
      
      return address;
    } catch (error: any) {
      console.error(`Error connecting to ${provider}:`, error);
      setError(error.message || 'Failed to connect wallet');
      setActiveProvider(null);
      throw error;
    } finally {
      setIsConnecting(false);
      pendingOperation.current = null;
    }
  };

  // Improved disconnect that handles all connected wallets
  const disconnectWallet = async () => {
    try {
      if (pendingOperation.current) {
        console.log(`Cannot disconnect during pending operation: ${pendingOperation.current}`);
        return;
      }
      
      console.log("Disconnecting wallet");
      setError(null);
      await disconnectAllWallets();
    } catch (error: any) {
      console.error("Error in disconnectWallet:", error);
      setError(error.message || 'Failed to disconnect wallet');
      throw error;
    }
  };

  // Get the currently active wallet's properties
  const getActiveWalletData = () => {
    const getDefaultData = () => ({
      walletAddress: null,
      publicKey: null,
      isConnected: false,
      isLoading: false,
      balance: 0,
      novaBalance: 0,
      solBalance: 0,
      connection: phantom.connection // Using phantom's connection as default
    });

    // Return properties based on active provider and connection state
    if (activeProvider === 'phantom' && phantom.isConnected && phantom.walletAddress) {
      return {
        walletAddress: phantom.walletAddress,
        publicKey: phantom.publicKey,
        isConnected: phantom.isConnected,
        isLoading: phantom.isLoading,
        balance: phantom.balance,
        novaBalance: phantom.novaBalance,
        solBalance: phantom.solBalance,
        connection: phantom.connection
      };
    } else if (activeProvider === 'lazorkit' && lazorKit.isConnected && lazorKit.walletAddress) {
      return {
        walletAddress: lazorKit.walletAddress,
        publicKey: lazorKit.publicKey,
        isConnected: lazorKit.isConnected,
        isLoading: lazorKit.isLoading,
        balance: lazorKit.balance,
        novaBalance: lazorKit.novaBalance,
        solBalance: lazorKit.solBalance,
        connection: lazorKit.connection
      };
    } else if (phantom.isConnected && phantom.walletAddress) {
      // Fallback to Phantom if it's connected but not the active provider
      return {
        walletAddress: phantom.walletAddress,
        publicKey: phantom.publicKey,
        isConnected: phantom.isConnected,
        isLoading: phantom.isLoading,
        balance: phantom.balance,
        novaBalance: phantom.novaBalance,
        solBalance: phantom.solBalance,
        connection: phantom.connection
      };
    } else if (lazorKit.isConnected && lazorKit.walletAddress) {
      // Fallback to LazorKit if it's connected but not the active provider
      return {
        walletAddress: lazorKit.walletAddress,
        publicKey: lazorKit.publicKey,
        isConnected: lazorKit.isConnected,
        isLoading: lazorKit.isLoading,
        balance: lazorKit.balance,
        novaBalance: lazorKit.novaBalance,
        solBalance: lazorKit.solBalance,
        connection: lazorKit.connection
      };
    } else {
      // Default disconnected state
      return getDefaultData();
    }
  };

  // Get balances based on active provider
  const getBalances = () => {
    if (activeProvider === 'phantom' && phantom.isConnected) {
      return phantom.getBalances();
    } else if (activeProvider === 'lazorkit' && lazorKit.isConnected) {
      return lazorKit.getBalances();
    } else {
      return {
        solBalance: 0,
        novaBalance: 0
      };
    }
  };

  // Refresh balances based on active provider
  const refreshBalances = async () => {
    if (activeProvider === 'phantom' && phantom.isConnected) {
      await phantom.refreshBalances();
    } else if (activeProvider === 'lazorkit' && lazorKit.isConnected) {
      await lazorKit.refreshBalances();
    }
  };

  // Additional helper for the component
  const hasPendingOperation = () => pendingOperation.current !== null;

  // Get the active wallet data
  const walletData = getActiveWalletData();

  return {
    ...walletData,
    activeProvider,
    error,
    connectWallet,
    disconnectWallet,
    getBalances,
    refreshBalances,
    hasPendingOperation,
    isConnecting,
    // Pass through other required methods...
    signAndSendTransaction: async (transaction: Transaction) => {
      try {
        if (!activeProvider) throw new Error('No wallet connected');
        
        if (activeProvider === 'phantom' && phantom.isConnected) {
          return await phantom.signAndSendTransaction(transaction);
        } else if (activeProvider === 'lazorkit' && lazorKit.isConnected) {
          if (transaction.instructions.length === 0) {
            throw new Error('Transaction has no instructions');
          }
          return await lazorKit.signAndSendTransaction(transaction.instructions[0]);
        } else {
          throw new Error('Active wallet not connected');
        }
      } catch (error: any) {
        setError(error.message || 'Failed to sign transaction');
        throw error;
      }
    },
    createPasskey: async () => {
      try {
        if (activeProvider !== 'lazorkit' || !lazorKit.isConnected) {
          throw new Error('LazorKit wallet must be connected');
        }
        
        return await lazorKit.createPasskey();
      } catch (error: any) {
        setError(error.message || 'Failed to create passkey');
        return false;
      }
    },
    verifyPasskey: async () => {
      try {
        if (activeProvider !== 'lazorkit' || !lazorKit.isConnected) {
          return false;
        }
        
        return await lazorKit.verifyPasskey();
      } catch (error: any) {
        console.error('Failed to verify passkey:', error);
        return false;
      }
    },
    // For compatibility with other interfaces
    connect: (provider?: WalletProvider) => connectWallet(provider),
    disconnect: disconnectWallet,
  };
};