import "@repo/ui/globals.css";

import { Raleway } from "next/font/google";
import { type Metadata } from "next";
import Providers from "~/components/providers";

export const metadata: Metadata = {
  title: "Dromi",
};

const font = Raleway({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <html lang="en" className={font.className} suppressHydrationWarning>
        <body className="bg-background w-screen h-full overflow-y-auto overflow-x-hidden">
          <Providers>
            {children}
          </Providers>
        </body>
      </html>
    </>
  );
}
