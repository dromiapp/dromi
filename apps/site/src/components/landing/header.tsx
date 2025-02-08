import { Button } from "@repo/ui/components/ui/button";
import { cn } from "@repo/ui/lib/utils";
import { ArrowUpRight } from "lucide-react";

export default function Header() {
  return (
    <nav className={cn(
      "w-full flex items-center justify-center overflow-hidden relative pt-6 z-[1]",
      "xl:px-0 px-5"
    )}>
      <div className={cn(
        "w-full max-w-screen-xl",
        "backdrop-blur-sm bg-transparent/50",
        "border border-white/10 rounded-md",
        "py-3 px-5",
        "flex justify-between items-center",
      )}>
        <div>
          {/* Branding */}
          <span className="text-xl font-bold">dromi</span>
        </div>
        <div>
          {/* Links */}
        </div>
        <div>
          {/* Actions */}
          <Button variant="dromi">
            Get started
            <ArrowUpRight />
          </Button>
        </div>
      </div>
    </nav>
  )
}