"use client";

import React from "react";
import CustomCursor from "./custom-cursor";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CustomCursor />
      {children}
    </>
  );
}