import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { ArrowRight } from "lucide-react";
import { env } from "~/env";
import Link from "next/link";

export default function SignupPage() {
  return (
    <div className="flex flex-col gap-7 justify-center items-center pt-40 max-w-[400px] mx-auto">
      <img src="https://r2.dromi.app/logo.svg" alt="dromi" className="h-8 w-8" />
      <h1 className="text-3xl font-bold">
        Let's get you started
      </h1>

      {/* Form */}
      <div className="flex flex-col gap-4 w-full">
        <Input placeholder="Enter your email address" type="email" />
        <Input placeholder="Create a password" type="password" />
        <Button variant="dromi">
          Create my account
          <ArrowRight />
        </Button>
      </div>


      <div className="flex flex-col gap-2 text-center">
        <p className="text-muted-foreground text-sm">
          By signing up, you agree to our <Link href={env.NEXT_PUBLIC_SITE_URL + "/terms"} className="text-primary underline">Terms of Service</Link> and <Link href={env.NEXT_PUBLIC_SITE_URL + "/privacy"} className="text-primary underline">Privacy Policy</Link>
        </p>

        <p className="text-muted-foreground text-sm">
          Already have an account? <Link className="text-primary underline cursor-pointer" href="/auth/signin">Sign in</Link>
        </p>
      </div>
    </div>
  )
}