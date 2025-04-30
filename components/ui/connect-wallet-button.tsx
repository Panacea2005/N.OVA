"use client"

import { usePhantom } from "@/hooks/use-phantom";
import { motion } from "framer-motion";
import { Wallet } from "lucide-react";
import { useRouter } from "next/navigation";

export const ConnectWalletButton = () => {
    const { isConnected, connectWallet, disconnectWallet, walletAddress } = usePhantom();
    const router = useRouter();

    const handleWalletAction = async () => {
        if (isConnected) {
            await disconnectWallet();
        } else {
            await connectWallet();
            router.push('/profile');
        }
    };

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleWalletAction}
            className={`
        relative group px-6 py-3 rounded-lg font-medium
        bg-gradient-to-r from-purple-600 to-blue-500
        text-white shadow-lg hover:shadow-xl
        transition-all duration-300 ease-in-out
        overflow-hidden
      `}
        >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                {isConnected ? (
                    <span className="truncate max-w-[150px]">
                        {walletAddress?.slice(0, 4)}...{walletAddress?.slice(-4)}
                    </span>
                ) : (
                    "Connect Wallet"
                )}
            </div>
        </motion.button>
    );
}; 