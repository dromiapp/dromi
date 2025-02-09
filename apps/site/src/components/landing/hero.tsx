"use client"

import { Button } from "@repo/ui/components/ui/button";
import { cn } from "@repo/ui/lib/utils";
import { ArrowUpRight } from "lucide-react";
import { RotatingWord } from "~/components/landing/rotating-word";

export default function Hero() {
  return (
    <div className={cn(
      "flex justify-center items-center flex-col gap-8",
      "pt-48 md:px-0 px-6"
    )}>
      <h1 className={cn(
        "font-bold text-center flex items-center max-w-3xl flex-wrap justify-center",
        "md:text-6xl text-4xl",
      )}>
        A secure, open-source alternative to your favorite
        <RotatingWord words={["todo", "note-taking", "productivity"]} className="text-dromi-primary" />
        app.
      </h1>
      <p className="text-center text-lg text-secondary-foreground/80 font-semibold">
        Dromi is an open-source workspace where your tasks and ideas unite effortlessly. <br />
        Get started for free and start taking control of your productivity.
      </p>

      <div className="flex gap-4 items-center">
        <Button variant="outline">
          Learn more
        </Button>
        <Button variant="dromi">
          Get started for free
          <ArrowUpRight />
        </Button>
      </div>
    </div>
  )
}