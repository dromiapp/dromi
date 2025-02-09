"use client"

import { ThemeProvider } from "@repo/ui/components/providers/theme";

export default function Providers({ children }: React.PropsWithChildren<{}>) {
  return (
    <>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </>
  )
}