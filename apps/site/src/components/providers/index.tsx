import { ThemeProvider } from "~/components/providers/theme"

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