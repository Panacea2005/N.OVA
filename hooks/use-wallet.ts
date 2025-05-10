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

  // Check which wallet is connected when the component mounts
  useEffect(() => {
    if (phantom.isConnected) {
      setActiveProvider('phantom');
    } else if (lazorKit.isConnected) {
      setActiveProvider('lazorkit');
    } else {
      setActiveProvider(null);
    }
  }, [phantom.isConnected, lazorKit.isConnected]);

  // Connect to a wallet provider
  const connectWallet = async (provider: WalletProvider = 'phantom') => {
    try {
      setError(null);
      
      if (provider === 'phantom') {
        await phantom.connectWallet();
        setActiveProvider('phantom');
        return phantom.walletAddress;
      } else if (provider === 'lazorkit') {
        await lazorKit.connectWallet();
        setActiveProvider('lazorkit');
        return lazorKit.walletAddress;
      } else {
        throw new Error("Invalid wallet provider");
      }
    } catch (error: any) {
      setError(error.message || 'Failed to connect wallet');
      throw error;
    }
  };

  // Disconnect the active wallet
  const disconnectWallet = async () => {
    try {
      if (activeProvider === 'phantom') {
        await phantom.disconnectWallet();
      } else if (activeProvider === 'lazorkit') {
        await lazorKit.disconnectWallet();
      }
      
      setActiveProvider(null);
    } catch (error: any) {
      setError(error.message || 'Failed to disconnect wallet');
      throw error;
    }
  };

  // Sign and send a transaction using the active wallet
  const signAndSendTransaction = async (transaction: Transaction): Promise<string> => {
    try {
      if (activeProvider === 'phantom') {
        return await phantom.signAndSendTransaction(transaction);
      } else if (activeProvider === 'lazorkit') {
        if (transaction.instructions.length === 0) {
          throw new Error('Transaction has no instructions');
        }
        // Pass the first TransactionInstruction to LazorKit
        return await lazorKit.signAndSendTransaction(transaction.instructions[0]);
      } else {
        throw new Error('No wallet connected');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to sign and send transaction');
      throw error;
    }
  };

  // Get the public key, wallet address, and other properties based on the active provider
  const getWalletProps = () => {
    if (activeProvider === 'phantom') {
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
    } else if (activeProvider === 'lazorkit') {
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
      return {
        walletAddress: null,
        publicKey: null,
        isConnected: false,
        isLoading: false,
        balance: 0,
        novaBalance: 0,
        solBalance: 0,
        connection: phantom.connection // Using phantom's connection as default
      };
    }
  };

  // Get balances based on active provider
  const getBalances = () => {
    if (activeProvider === 'phantom') {
      return phantom.getBalances();
    } else if (activeProvider === 'lazorkit') {
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
    if (activeProvider === 'phantom') {
      await phantom.refreshBalances();
    } else if (activeProvider === 'lazorkit') {
      await lazorKit.refreshBalances();
    }
  };

  // Get the wallet props
  const walletProps = getWalletProps();

  return {
    ...walletProps,
    activeProvider,
    error,
    connectWallet,
    disconnectWallet,
    signAndSendTransaction,
    getBalances,
    refreshBalances
  };
};