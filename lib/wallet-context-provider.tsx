"use client";

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
    // Add any other wallet adapters you want to support
  ], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}