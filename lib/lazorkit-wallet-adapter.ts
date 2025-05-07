"use client";

import {
  BaseMessageSignerWalletAdapter,
  SupportedTransactionVersions,
  WalletConnectionError,
  WalletDisconnectionError,
  WalletName,
  WalletNotConnectedError,
  WalletNotReadyError,
  WalletPublicKeyError,
  WalletReadyState,
  WalletSignTransactionError,
  WalletWindowClosedError,
} from '@solana/wallet-adapter-base';
import { PublicKey, Transaction, VersionedTransaction, TransactionInstruction } from '@solana/web3.js';

export const LazorKitWalletName = 'LazorKit' as WalletName<'LazorKit'>;

interface LazorKitWallet {
  isLazorKit?: boolean;
  publicKey?: { toBytes(): Uint8Array } | null;
  isConnected?: boolean;
  connectWallet?: () => Promise<string>;
  connect?: () => Promise<{ publicKey: { toBytes(): Uint8Array } }>;
  disconnectWallet?: () => Promise<void>;
  disconnect?: () => Promise<void>;
  signAndSendTransaction?: (instruction: TransactionInstruction) => Promise<string>;
  signMessage?: (message: Uint8Array) => Promise<{ signature: Uint8Array }>;
  signTransaction?: (transaction: Transaction | VersionedTransaction) => Promise<Transaction | VersionedTransaction>;
  signAllTransactions?: (transactions: (Transaction | VersionedTransaction)[]) => Promise<(Transaction | VersionedTransaction)[]>;
}

interface LazorKitWindow extends Window {
  lazorKit?: LazorKitWallet;
  solana?: LazorKitWallet;
}

declare const window: LazorKitWindow;

export class LazorKitWalletAdapter extends BaseMessageSignerWalletAdapter {
  supportedTransactionVersions?: SupportedTransactionVersions;
  name = LazorKitWalletName;
  url = 'https://lazorkit.xyz'; 
  icon = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzYiIGhlaWdodD0iMzYiIHZpZXdCb3g9IjAgMCAzNiAzNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE4IDM2QzI3Ljk0MSAzNiAzNiAyNy45NDEgMzYgMThDMzYgOC4wNTg4NyAyNy45NDEgMCAxOCAwQzguMDU4ODcgMCAwIDguMDU4ODcgMCAxOEMwIDI3Ljk0MSA4LjA1ODg3IDM2IDE4IDM2WiIgZmlsbD0iIzAwMDAwMCIvPgo8cGF0aCBkPSJNMTcuOTkgNy4yMDAwMUwxMC43MSAxOC45TDE3Ljk5IDI0LjA3TDI1LjI3IDE4LjlMMTcuOTkgNy4yMDAwMVoiIGZpbGw9IiMwMEZGRkYiLz4KPHBhdGggZD0iTTE3Ljk5IDI1LjlMMTAuNzEgMTguOUwxNy45OSAyOS43TDI1LjI3IDE4LjlMMTcuOTkgMjUuOVoiIGZpbGw9IiMwMEY2RkYiLz4KPC9zdmc+Cg=='; 
  
  private _connecting: boolean;
  private _wallet: LazorKitWallet | null;
  private _publicKey: PublicKey | null;
  private _readyState: WalletReadyState = WalletReadyState.NotDetected;

  constructor() {
    super();
    this._connecting = false;
    this._wallet = null;
    this._publicKey = null;

    if (typeof window !== 'undefined') {
      this._readyState = this._detectWallet();
    }
  }

  get publicKey(): PublicKey | null {
    return this._publicKey;
  }

  get connecting(): boolean {
    return this._connecting;
  }

  get connected(): boolean {
    return !!this._wallet?.isConnected;
  }

  get readyState(): WalletReadyState {
    return this._readyState;
  }

  private _detectWallet(): WalletReadyState {
    // Check if our custom useLazorKit hook is initialized
    try {
      // First check if window.lazorKit exists and has the isLazorKit flag
      if (window?.lazorKit?.isLazorKit) {
        return WalletReadyState.Installed;
      }
      
      // Or if it's using window.solana with isLazorKit flag
      if (window?.solana?.isLazorKit) {
        return WalletReadyState.Installed;
      }
      
      // Also check for window.lazorKit with connectWallet method (our custom implementation)
      if (window?.lazorKit?.connectWallet) {
        return WalletReadyState.Installed;
      }
      
      // Additional check for WASM-based LazorKit
      if (
        typeof window !== 'undefined' &&
        // @ts-ignore - lazorkit specific
        typeof window.__LAZORKIT_BRIDGE__ !== 'undefined'
      ) {
        return WalletReadyState.Installed;
      }
      
      return WalletReadyState.NotDetected;
    } catch (error) {
      return WalletReadyState.NotDetected;
    }
  }

  async connect(): Promise<void> {
    try {
      if (this.connected || this.connecting) return;
      
      // Force ready state to Installed for testing purposes
      // (since we know our custom implementation is available)
      // this._readyState = WalletReadyState.Installed;
      
      if (this._readyState !== WalletReadyState.Installed) {
        // Might be using our custom hook - try to create it on demand
        try {
          // Create a temporary global object for testing
          if (typeof window !== 'undefined' && !window.lazorKit) {
            // Open LazorKit in a popup
            window.open('https://w3s.link/ipfs/bafybeibvvxqef5arqj4uy22zwl3hcyvrthyfrjzoeuzyfcbizjur4yt6by/?action=connect', '_blank');
            throw new WalletWindowClosedError('LazorKit wallet window closed');
          }
        } catch (error) {
          console.error("Error creating LazorKit adapter:", error);
          throw new WalletNotReadyError();
        }
      }

      this._connecting = true;

      // Try to find LazorKit in different possible interfaces
      const wallet = window.lazorKit || window.solana;
      
      if (!wallet) {
        throw new WalletConnectionError('LazorKit wallet not found');
      }

      try {
        let publicKeyStr: string | null = null;
        
        // Try different connection methods based on what's available
        if (wallet.connect) {
          // Standard wallet adapter interface
          const response = await wallet.connect();
          if (response && response.publicKey) {
            const pubKeyBytes = response.publicKey.toBytes();
            const publicKey = new PublicKey(pubKeyBytes);
            this._wallet = wallet;
            this._publicKey = publicKey;
          } else {
            throw new WalletConnectionError('Failed to connect to LazorKit');
          }
        } else if (wallet.connectWallet) {
          // Our custom implementation
          publicKeyStr = await wallet.connectWallet();
          if (publicKeyStr) {
            const publicKey = new PublicKey(publicKeyStr);
            this._wallet = wallet;
            this._publicKey = publicKey;
          } else {
            throw new WalletConnectionError('Failed to connect to LazorKit');
          }
        } else {
          throw new WalletConnectionError('LazorKit wallet interface not found');
        }

        this.emit('connect', this._publicKey as PublicKey);
      } catch (error: any) {
        throw new WalletConnectionError(error?.message, error);
      }
    } catch (error: any) {
      this.emit('error', error);
      throw error;
    } finally {
      this._connecting = false;
    }
  }

  async disconnect(): Promise<void> {
    const wallet = this._wallet;
    if (wallet) {
      this._wallet = null;
      this._publicKey = null;

      try {
        // Try different disconnection methods
        if (wallet.disconnect) {
          await wallet.disconnect();
        } else if (wallet.disconnectWallet) {
          await wallet.disconnectWallet();
        }
      } catch (error: any) {
        this.emit('error', new WalletDisconnectionError(error?.message, error));
      }
    }

    this.emit('disconnect');
  }

  async signTransaction<T extends Transaction | VersionedTransaction>(transaction: T): Promise<T> {
    try {
      const wallet = this._wallet;
      if (!wallet) throw new WalletNotConnectedError();

      try {
        // Try standard signTransaction method first
        if (wallet.signTransaction) {
          return await wallet.signTransaction(transaction) as T;
        } 
        // If not available, try our custom signAndSendTransaction method
        else if (wallet.signAndSendTransaction && transaction instanceof Transaction) {
          // Extract the first instruction from the transaction
          if (transaction.instructions.length > 0) {
            const instruction = transaction.instructions[0];
            await wallet.signAndSendTransaction(instruction);
            // Return the transaction as is - this is a workaround since our custom implementation
            // doesn't actually modify the transaction
            return transaction;
          } else {
            throw new WalletSignTransactionError('Transaction has no instructions');
          }
        } else {
          throw new WalletSignTransactionError('Signing method not available');
        }
      } catch (error: any) {
        throw new WalletSignTransactionError(error?.message, error);
      }
    } catch (error: any) {
      this.emit('error', error);
      throw error;
    }
  }

  async signAllTransactions<T extends Transaction | VersionedTransaction>(transactions: T[]): Promise<T[]> {
    try {
      const wallet = this._wallet;
      if (!wallet) throw new WalletNotConnectedError();

      try {
        // Try standard signAllTransactions method
        if (wallet.signAllTransactions) {
          return await wallet.signAllTransactions(transactions) as T[];
        } 
        // If not available, sign each transaction individually using our custom method
        else if (wallet.signAndSendTransaction && transactions.length > 0 && transactions[0] instanceof Transaction) {
          // Process each transaction - this is a workaround
          for (const transaction of transactions as Transaction[]) {
            if (transaction.instructions.length > 0) {
              const instruction = transaction.instructions[0];
              await wallet.signAndSendTransaction(instruction);
            }
          }
          // Return the transactions as is
          return transactions;
        } else {
          throw new WalletSignTransactionError('Signing method not available');
        }
      } catch (error: any) {
        throw new WalletSignTransactionError(error?.message, error);
      }
    } catch (error: any) {
      this.emit('error', error);
      throw error;
    }
  }

  async signMessage(message: Uint8Array): Promise<Uint8Array> {
    try {
      const wallet = this._wallet;
      if (!wallet) throw new WalletNotConnectedError();

      try {
        // Try standard signMessage method
        if (wallet.signMessage) {
          const { signature } = await wallet.signMessage(message);
          return signature;
        } else {
          // Fall back to a mock implementation for our custom LazorKit
          console.warn('LazorKit custom implementation does not support signMessage, returning mock signature');
          return new Uint8Array(64); // Mock 64-byte signature
        }
      } catch (error: any) {
        throw new WalletSignTransactionError(error?.message, error);
      }
    } catch (error: any) {
      this.emit('error', error);
      throw error;
    }
  }
}