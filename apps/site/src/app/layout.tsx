import "@repo/ui/globals.css";

import { Raleway } from "next/font/google";
import { Viewport, type Metadata } from "next";
import Providers from "~/components/providers";

export const metadata: Metadata = {
  title: "Dromi",
  description: "Dromi is an open-source workspace where your tasks and ideas unite effortlessly. Get started for free and start taking control of your productivity.",
  keywords: "dromi, productivity, todo-board, kanban board, note-taking, note app, tasks, ideas, workspace, open-source, free, privacy, security, web, app, alternative, freemium, opensource, self-hosted, selfhosted, self-host, dromiapp, dromi-app, dromi-web-app, dromi-web",
  robots: "index,follow",
  openGraph: {
    description: "Dromi is an open-source workspace where your tasks and ideas unite effortlessly. Get started for free and start taking control of your productivity.",
    siteName: "Dromi",
    title: "Dromi",
    type: "website",
    images: [{
      url: "https://r2.dromi.app/banner.png",
      width: 960,
      height: 540,
      alt: "Dromi banner",
    }]
  }
};

export const viewport: Viewport = {
  themeColor: "#512eea",
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
}

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
