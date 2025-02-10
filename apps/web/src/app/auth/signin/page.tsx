"use client"

import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { ArrowRight } from "lucide-react";
import { env } from "~/env";
import Link from "next/link";
import DromiLogo from "@repo/ui/components/ui/logo";
import { motion } from "motion/react";

export default function SigninPage() {
  return (
    <motion.div
      className="flex flex-col gap-7 justify-center items-center pt-52 max-w-[400px] mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <DromiLogo size={8} />
      <h1 className="text-3xl font-bold">
        Welcome back
      </h1>

      {/* Form */}
      <div className="flex flex-col gap-4 w-full">
        <Input placeholder="Enter your email address" type="email" />
        <Input placeholder="Enter your password" type="password" />
        <Button variant="dromi">
          Sign in
          <ArrowRight />
        </Button>
      </div>


      <div className="flex flex-col gap-2 text-center">
        <p className="text-muted-foreground text-sm">
          Don't have an account? <Link className="text-primary underline cursor-pointer" href="/auth/signup">Sign up</Link>
        </p>
      </div>
    </motion.div>
  )
}