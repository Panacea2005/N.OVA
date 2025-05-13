// File: app/wallet-provider.tsx - An improved Wallet Context Provider

"use client";

import { useEffect } from 'react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { 
  ConnectionProvider, 
  WalletProvider 
} from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  CoinbaseWalletAdapter,
  TorusWalletAdapter,
  LedgerWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { LazorKitWalletAdapter } from './lazorkit-wallet-adapter';
import { initializeLazorKitBridge } from './lazorkit-bridge';
import { clusterApiUrl } from '@solana/web3.js';
import { useMemo, ReactNode } from 'react';

// Import default wallet modal CSS - we can customize this later
require('@solana/wallet-adapter-react-ui/styles.css');

interface WalletContextProviderProps {
  children: ReactNode;
  network?: WalletAdapterNetwork;
}

export function WalletContextProvider({ 
  children, 
  network = WalletAdapterNetwork.Mainnet 
}: WalletContextProviderProps) {
  // You can use a custom RPC endpoint here if needed
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  // Include all the wallet adapters you want to support
  const wallets = useMemo(() => [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
    new CoinbaseWalletAdapter(),
    new TorusWalletAdapter(),
    new LedgerWalletAdapter(),
    new LazorKitWalletAdapter(), // Add LazorKit adapter
  ], []);

  // Initialize the LazorKit bridge when component mounts
  useEffect(() => {
    // Initialize the LazorKit bridge to connect our custom implementation
    initializeLazorKitBridge();
    
    // Additional error handling
    window.addEventListener('unhandledrejection', (event) => {
      // Log any wallet-related promise rejections for debugging
      if (event.reason && (
          String(event.reason).includes('wallet') || 
          String(event.reason).includes('Wallet'))) {
        console.error('Unhandled wallet promise rejection:', event.reason);
      }
    });
    
    return () => {
      window.removeEventListener('unhandledrejection', () => {});
    };
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={false}>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}