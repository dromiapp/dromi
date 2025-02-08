import { Button } from "@repo/ui/components/ui/button";
import { cn } from "@repo/ui/lib/utils";
import { ArrowUpRight } from "lucide-react";

export default function CTA() {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center gap-7",
      "w-full max-w-[700px] mx-auto",
      "bg-[radial-gradient(21%_42%_at_50%_50%,rgba(81,47,235,0.25)_0%,rgba(56,54,61,0)_100%)]"
    )}>
      <h3 className="text-center text-4xl font-bold">
        Ready to take control<br /> of your productivity?
      </h3>

      <p className="text-center text-lg text-secondary-foreground/80 font-semibold">
        Get started with our web app today<br /> for completely free.
      </p>

      <Button variant="dromi">
        Get started for free
        <ArrowUpRight />
      </Button>
    </div>
  )
}