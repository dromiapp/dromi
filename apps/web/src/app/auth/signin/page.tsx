"use client"

import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import DromiLogo from "@repo/ui/components/ui/logo";
import { motion } from "motion/react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { fetchClient } from "~/lib/api";
import { toast } from "sonner";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@repo/ui/components/ui/form";

type SigninForm = {
  identifier: string;
  password: string;
}

const formSchema = z.object({
  identifier: z.string().email({ message: "Invalid email address" }).min(1, "Email is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export default function SigninPage() {
  const form = useForm<SigninForm>({
    shouldUnregister: false,
    defaultValues: { identifier: "", password: "" },
    mode: 'onChange',
    resolver: zodResolver(formSchema),
  });

  const { control, handleSubmit, formState, trigger } = form;
  const router = useRouter();

  const onSubmit = (data: SigninForm) => {
    fetchClient.POST("/auth/signin", {
      body: {
        identifier: data.identifier,
        password: data.password,
      },
    }).then((res) => {
      if (res.response.status === 200) {
        // TODO: if lastselectedworkspace, redirect to workspace
        router.push("/welcome");
      } else {
        toast("Something went wrong. Please try again later.");
      }
    })
  };

  return (
    <motion.div
      className="flex flex-col gap-7 justify-center items-center pt-52 max-w-[400px] mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <DromiLogo size={8} />
      {/* Form */}
      <FormProvider {...form}>
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-7 items-center">
            <div className="flex flex-col gap-2 text-center">
              <h1 className="text-3xl font-bold">
                Welcome back
              </h1>
              <p className="text-lg text-secondary-foreground/80 font-semibold">
                Enter your account credentials to continue.
              </p>
            </div>

            <div className="flex flex-col gap-4 w-full">
              {/* inputs */}
              <FormField
                control={control}
                name="identifier"
                render={({ field: controllerField }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter your email address"
                        {...controllerField}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="password"
                render={({ field: controllerField }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter your password"
                        {...controllerField}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="button"
                variant="dromi"
                className="group"
                onClick={handleSubmit(onSubmit)}
              >
                Sign in
                <ArrowRight className="group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </div>

            <div className="flex flex-col gap-2 text-center">
              <p className="text-muted-foreground text-sm">
                Already have an account?{" "}
                <Link className="text-primary underline cursor-pointer" href="/auth/signin">
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </Form>
      </FormProvider>


      <div className="flex flex-col gap-2 text-center">
        <p className="text-muted-foreground text-sm">
          Don't have an account? <Link className="text-primary underline cursor-pointer" href="/auth/signup">Sign up</Link>
        </p>
      </div>
    </motion.div>
  )
}