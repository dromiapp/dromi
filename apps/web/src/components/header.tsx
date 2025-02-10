import { cn } from "@repo/ui/lib/utils";
import Link from "next/link";
import { env } from "~/env";
import DromiLogo from "@repo/ui/components/ui/logo";

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
        "flex"
      )}>
        <Link href={env.NEXT_PUBLIC_SITE_URL}>
          <div className="flex gap-2 items-center select-none">
            {/* Branding */}
            <DromiLogo size={4} />
            <span className="text-xl font-bold">dromi</span>
          </div>
        </Link>
      </div>
    </nav>
  )
}