"use client";

import { ConvexProvider } from "convex/react";
import { ThemeProvider } from "@/components/theme-provider";
import { convex } from "@/lib/convex";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ConvexProvider client={convex}>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </ConvexProvider>
  );
}
