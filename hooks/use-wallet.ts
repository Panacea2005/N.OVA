"use client"

import { useState, useEffect, useCallback } from 'react';
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

  // Modified effect to properly track wallet connections
  useEffect(() => {
    console.log("Checking wallet connections:", {
      phantomConnected: phantom.isConnected,
      lazorKitConnected: lazorKit.isConnected,
      activeProvider,
      isConnecting
    });

    // Only update provider when not in the middle of connecting
    if (!isConnecting) {
      if (phantom.isConnected && !lazorKit.isConnected) {
        console.log("Setting active provider to phantom");
        setActiveProvider('phantom');
      } else if (lazorKit.isConnected && !phantom.isConnected) {
        console.log("Setting active provider to lazorkit");
        setActiveProvider('lazorkit');
      } else if (!phantom.isConnected && !lazorKit.isConnected) {
        console.log("No wallets connected, setting provider to null");
        setActiveProvider(null);
      }
    }
  }, [phantom.isConnected, lazorKit.isConnected, isConnecting]);

  // Completely disconnect all wallets
  const disconnectAllWallets = async () => {
    console.log("Disconnecting all wallets");
    
    // Disconnect phantom if connected
    if (phantom.isConnected) {
      try {
        console.log("Disconnecting Phantom wallet");
        await phantom.disconnectWallet();
      } catch (err) {
        console.error("Error disconnecting Phantom:", err);
      }
    }
    
    // Disconnect LazorKit if connected
    if (lazorKit.isConnected) {
      try {
        console.log("Disconnecting LazorKit wallet");
        await lazorKit.disconnectWallet();
      } catch (err) {
        console.error("Error disconnecting LazorKit:", err);
      }
    }
  };

  // Improved connection logic with strict provider switching
  const connectWallet = async (provider: WalletProvider = 'phantom') => {
    try {
      console.log(`Connecting to ${provider} wallet`);
      setError(null);
      setIsConnecting(true);
      
      // Always disconnect all wallets first
      await disconnectAllWallets();
      
      // Set active provider before connection to ensure proper UI updates
      setActiveProvider(provider);
      
      let address = null;
      
      // Connect to the specified provider
      if (provider === 'phantom') {
        console.log("Initiating Phantom wallet connection");
        
        // For Phantom, the connection may happen via the wallet adapter UI
        // so we don't directly call connectWallet here
        setActiveProvider('phantom');
        
        // We just return null and let the wallet adapter handle the connection
        return null;
      } else if (provider === 'lazorkit') {
        console.log("Initiating LazorKit wallet connection");
        address = await lazorKit.connectWallet();
        console.log(`LazorKit connected with address: ${address}`);
        return address;
      } else {
        throw new Error("Invalid wallet provider");
      }
    } catch (error: any) {
      console.error(`Error connecting to ${provider}:`, error);
      setError(error.message || 'Failed to connect wallet');
      setActiveProvider(null);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  // Improved disconnect that handles all connected wallets
  const disconnectWallet = async () => {
    try {
      console.log("Disconnecting wallet");
      setError(null);
      setIsConnecting(true);
      
      await disconnectAllWallets();
      setActiveProvider(null);
    } catch (error: any) {
      console.error("Error in disconnectWallet:", error);
      setError(error.message || 'Failed to disconnect wallet');
      throw error;
    } finally {
      setIsConnecting(false);
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

    console.log("Getting active wallet data for:", {
      activeProvider,
      phantomConnected: phantom.isConnected,
      lazorKitConnected: lazorKit.isConnected
    });
    
    // Return properties based on active provider and connection state
    if (activeProvider === 'phantom' && phantom.isConnected) {
      console.log("Returning Phantom wallet data");
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
    } else if (activeProvider === 'lazorkit' && lazorKit.isConnected) {
      console.log("Returning LazorKit wallet data");
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
    } else if (phantom.isConnected) {
      // Fallback to Phantom if it's connected but not the active provider
      console.log("Fallback to Phantom wallet data");
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
    } else if (lazorKit.isConnected) {
      // Fallback to LazorKit if it's connected but not the active provider
      console.log("Fallback to LazorKit wallet data");
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
      console.log("No wallet connected, returning default data");
      return getDefaultData();
    }
  };

  // Improved transaction signing with better provider handling
  const signAndSendTransaction = async (transaction: Transaction): Promise<string> => {
    try {
      setError(null);
      
      if (!activeProvider) {
        throw new Error('No wallet connected');
      }
      
      if (activeProvider === 'phantom' && phantom.isConnected) {
        return await phantom.signAndSendTransaction(transaction);
      } else if (activeProvider === 'lazorkit' && lazorKit.isConnected) {
        if (transaction.instructions.length === 0) {
          throw new Error('Transaction has no instructions');
        }
        // Pass the first TransactionInstruction to LazorKit
        return await lazorKit.signAndSendTransaction(transaction.instructions[0]);
      } else {
        throw new Error('Active wallet not connected');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to sign and send transaction');
      throw error;
    }
  };

  // Create passkey function specifically for LazorKit
  const createPasskey = async (): Promise<boolean> => {
    try {
      setError(null);
      
      if (activeProvider !== 'lazorkit' || !lazorKit.isConnected) {
        throw new Error('LazorKit wallet must be connected to create a passkey');
      }
      
      if (typeof lazorKit.createPasskey === 'function') {
        return await lazorKit.createPasskey();
      } else {
        throw new Error('Passkey creation not supported');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to create passkey');
      return false;
    }
  };

  // Verify if a passkey exists
  const verifyPasskey = async (): Promise<boolean> => {
    try {
      setError(null);
      
      if (activeProvider !== 'lazorkit' || !lazorKit.isConnected) {
        return false;
      }
      
      if (typeof lazorKit.verifyPasskey === 'function') {
        return await lazorKit.verifyPasskey();
      } else {
        return false;
      }
    } catch (error: any) {
      console.error('Failed to verify passkey:', error);
      return false;
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

  // Get the active wallet data
  const walletData = getActiveWalletData();

  return {
    ...walletData,
    activeProvider,
    error,
    connectWallet,
    disconnectWallet,
    signAndSendTransaction,
    getBalances,
    refreshBalances,
    createPasskey,
    verifyPasskey,
    // For compatibility with other interfaces
    connect: connectWallet,
    disconnect: disconnectWallet,
  };
};