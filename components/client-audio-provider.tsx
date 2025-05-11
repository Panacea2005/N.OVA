"use client";

import { useState, useEffect } from "react";
import { AudioProvider } from "@/lib/audio-context-provider";

export const ClientAudioProvider = ({ 
  children 
}: { 
  children: React.ReactNode 
}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    // Return a placeholder with the same structure but without actual functionality
    // to prevent hydration errors
    return <>{children}</>;
  }

  return <AudioProvider>{children}</AudioProvider>;
};