"use client";

import { Header } from "@/components/refine-ui/layout/header";
import { ThemeProvider } from "@/components/refine-ui/theme/theme-provider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import type { PropsWithChildren } from "react";
import { Sidebar } from "./sidebar";

export function Layout({ children }: PropsWithChildren) {
  return (
    <ThemeProvider>
      <SidebarProvider>
        <Sidebar />
        <SidebarInset>
          <Header />
          <main
            className={cn(
              "@container/main",
              "relative",
              "w-full",
              "flex",
              "flex-col",
              "flex-1",
              "bg-brand-paper",
              "px-4",
              "pb-4",
              "pt-2",
              "md:px-5",
              "md:pb-5"
            )}
          >
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </ThemeProvider>
  );
}

Layout.displayName = "Layout";
