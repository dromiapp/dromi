import { Button } from "@repo/ui/components/ui/button";
import { cn } from "@repo/ui/lib/utils";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { env } from "~/env";

export default function Header() {
  return (
    <nav className={cn(
      "w-full flex items-center justify-center overflow-hidden relative pt-6 z-[1]",
      "md:px-0 px-5"
    )}>
      <div className={cn(
        "w-full max-w-screen-xl",
        "backdrop-blur-sm bg-transparent/50",
        "border border-white/10 rounded-md",
        "py-3 px-5",
        "flex justify-between items-center",
      )}>
        <Link href="/">
          <div className="flex gap-2 items-center select-none">
            {/* Branding */}
            <img src="https://r2.dromi.app/logo.svg" alt="dromi" className="h-4 w-4" />
            <span className="text-xl font-bold">dromi</span>
          </div>
        </Link>
        <div>
          {/* Links */}
        </div>
        <div>
          {/* Actions */}
          <Link href={env.NEXT_PUBLIC_APP_URL}>
            <Button variant="dromi">
              Get started
              <ArrowUpRight />
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  )
}