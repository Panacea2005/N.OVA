"use client"

import { useState, useEffect } from 'react';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';

declare global {
    interface Window {
        solana?: any;
    }
}

export const usePhantom = () => {
    const [walletAddress, setWalletAddress] = useState<string | null>(null);
    const [balance, setBalance] = useState<number>(0);
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [connection] = useState<Connection>(new Connection(clusterApiUrl('mainnet-beta')));

    useEffect(() => {
        const checkIfWalletIsConnected = async () => {
            try {
                const { solana } = window;
                if (solana && solana.isPhantom) {
                    const response = await solana.connect({ onlyIfTrusted: true });
                    setWalletAddress(response.publicKey.toString());
                    setIsConnected(true);
                    await getBalance(response.publicKey);
                }
            } catch (error) {
                console.error('Error checking wallet connection:', error);
                // Reset state if there's an error
                setWalletAddress(null);
                setIsConnected(false);
                setBalance(0);
            }
        };

        const handleDisconnect = () => {
            setWalletAddress(null);
            setIsConnected(false);
            setBalance(0);
        };

        // Add event listeners for Phantom wallet
        if (window.solana) {
            window.solana.on('disconnect', handleDisconnect);
            window.solana.on('accountChanged', checkIfWalletIsConnected);
        }

        checkIfWalletIsConnected();

        // Cleanup event listeners
        return () => {
            if (window.solana) {
                window.solana.removeListener('disconnect', handleDisconnect);
                window.solana.removeListener('accountChanged', checkIfWalletIsConnected);
            }
        };
    }, []);

    const connectWallet = async () => {
        try {
            const { solana } = window;
            if (solana && solana.isPhantom) {
                const response = await solana.connect();
                setWalletAddress(response.publicKey.toString());
                setIsConnected(true);
                await getBalance(response.publicKey);
            } else {
                window.open('https://phantom.app/', '_blank');
            }
        } catch (error) {
            console.error('Error connecting wallet:', error);
            // Reset state if there's an error
            setWalletAddress(null);
            setIsConnected(false);
            setBalance(0);
        }
    };

    const disconnectWallet = async () => {
        try {
            const { solana } = window;
            if (solana) {
                await solana.disconnect();
                setWalletAddress(null);
                setIsConnected(false);
                setBalance(0);
            }
        } catch (error) {
            console.error('Error disconnecting wallet:', error);
            // Still reset state even if there's an error
            setWalletAddress(null);
            setIsConnected(false);
            setBalance(0);
        }
    };

    const getBalance = async (publicKey: PublicKey) => {
        try {
            const balance = await connection.getBalance(publicKey);
            setBalance(balance / 1e9); // Convert lamports to SOL
        } catch (error) {
            console.error('Error getting balance:', error);
            setBalance(0);
        }
    };

    return {
        walletAddress,
        balance,
        isConnected,
        connectWallet,
        disconnectWallet,
    };
}; 