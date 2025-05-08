"use client";

import React, { ReactNode, useEffect } from "react";
import { WalletContextProvider } from "@/lib/wallet-context-provider";
import { initializeLazorKitBridge } from "@/lib/lazorkit-bridge";

interface ClientLayoutProps {
  children: ReactNode;
}

export function ClientLayout({ children }: { children: React.ReactNode }) {

  // Initialize LazorKit bridge on client-side
  useEffect(() => {
    // Initialize the bridge between custom hooks and wallet adapter
    initializeLazorKitBridge();
  }, []);
  
  return (
    <>
      <WalletContextProvider>{children}</WalletContextProvider>
    </>
  );
}
