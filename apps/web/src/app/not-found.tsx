import { Button } from "@repo/ui/components/ui/button";
import Glow from "@repo/ui/components/ui/glow";
import { ArrowUpRight } from "lucide-react";
import Header from "~/components/header";
import Link from "next/link";

export default function NotFound() {
  return (
    <>
      <div className="relative min-h-[100vh]">
        <Header />

        <div className="flex flex-col gap-7 justify-center items-center pt-40 text-center">
          <h1 className="text-6xl font-bold">
            Uh oh... look's like you're lost.
          </h1>
          <p className="text-center text-lg text-secondary-foreground/80 font-semibold">
            We couldn't find the page you're looking for. <br />
            Click the button below to go back to the home page.
          </p>

          <Link href="/">
            <Button variant="dromi">
              Return home
              <ArrowUpRight />
            </Button>
          </Link>
        </div>

        <div className="absolute top-[30px] blur-[100px] h-32 w-[1050px] -left-12 z-[-1]">
          <Glow />
        </div>
        <div className="absolute bottom-[30px] blur-[100px] h-32 w-[1050px] -right-12 z-[-1]">
          <Glow align="right" />
        </div>
      </div>
    </>
  )
}