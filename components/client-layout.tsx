"use client";

import React, { ReactNode, useEffect } from "react";
import { WalletContextProvider } from "@/lib/wallet-context-provider";
import { initializeLazorKitBridge } from "@/lib/lazorkit-bridge";
import dynamic from "next/dynamic";

// Dynamically import cursor component with no SSR
const MinimalCustomCursor = dynamic(() => import("@/components/custom-cursor"), {
  ssr: false,
});

interface ClientLayoutProps {
  children: ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  // Initialize LazorKit bridge on client-side
  useEffect(() => {
    // Initialize the bridge between custom hooks and wallet adapter
    initializeLazorKitBridge();
  }, []);
  
  return (
    <WalletContextProvider>
      {children}
      <MinimalCustomCursor />
    </WalletContextProvider>
  );
}

export default ClientLayout;