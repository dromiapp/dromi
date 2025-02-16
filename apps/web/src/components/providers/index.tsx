"use client"

import { ThemeProvider } from "@repo/ui/components/providers/theme";
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { Toaster } from "@repo/ui/components/ui/sonner";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    }
  }
})

export default function Providers({ children }: React.PropsWithChildren<{}>) {
  return (
    <>
      <Toaster />
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </QueryClientProvider>
    </>
  )
}