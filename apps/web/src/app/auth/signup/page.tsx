"use client"

import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { ArrowRight, Loader2 } from "lucide-react";
import { env } from "~/env";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { FormProvider, useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@repo/ui/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import DromiLogo from "@repo/ui/components/ui/logo";
import { fetchClient } from "~/lib/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const steps = [
  {
    id: 1,
    title: "Let's get you started",
    description: "What's your email address?",
    fields: [{ name: "email", type: "email", placeholder: "Enter your email address", }],
  },
  {
    id: 2,
    title: "Create a secure password",
    description: "Choose a strong password.",
    fields: [
      { name: "password", type: "password", placeholder: "Enter your password" },
      { name: "confirmPassword", type: "password", placeholder: "Confirm your password" },
    ],
  },
  {
    id: 3,
    title: "Almost done!",
    description: "One last step to complete your signup.",
    fields: [{ name: "displayName", type: "text", placeholder: "Choose a display name" }],
  },
];

type SignupFormData = {
  email: string;
  password: string;
  confirmPassword: string;
  displayName: string;
};

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }).min(1, "Email is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Password confirmation is required"),
  displayName: z.string().min(1, "Display name is required").max(16, "Display name must be less than 16 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});


export default function SignupPage() {
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const form = useForm<SignupFormData>({
    shouldUnregister: false,
    defaultValues: { email: "", password: "", confirmPassword: "", displayName: "" },
    mode: 'onChange',
    resolver: zodResolver(formSchema),
  });

  const { control, handleSubmit, formState, trigger } = form;


  const nextStep = async () => {
    // TODO: add intermediary email validation
    const currentStepFields = steps[step]?.fields.map(f => f.name as keyof SignupFormData); // validate current step fields
    const isStepValid = await trigger(currentStepFields);

    if (isStepValid) {
      setStep((prev) => prev + 1);
    }
  };

  const onSubmit = (data: SignupFormData) => {
    setIsLoading(true);

    fetchClient.POST("/auth/signup", {
      body: {
        email: data.email,
        password: data.password,
        displayName: data.displayName,
      },
    }).then((res) => {
      if (res.response.status === 200) {
        setIsLoading(false);
        router.push("/welcome");
      } else {
        setIsLoading(false);
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

      <FormProvider {...form}>
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-7 items-center">
            <AnimatePresence mode="wait">
              {steps[step] && (
                <motion.div
                  key={step}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="flex flex-col gap-7 justify-center items-center w-full"
                >
                  <div className="flex flex-col gap-2 text-center">
                    <h1 className="text-3xl font-bold">{steps[step].title}</h1>
                    <p className="text-lg text-secondary-foreground/80 font-semibold">
                      {steps[step].description}
                    </p>
                  </div>

                  <div className="flex flex-col gap-4 w-full">
                    {steps[step].fields.map((field) => (
                      <FormField
                        key={field.name}
                        control={control}
                        name={field.name as keyof SignupFormData}
                        render={({ field: controllerField }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                type={field.type}
                                placeholder={field.placeholder}
                                {...controllerField}
                              />
                            </FormControl>
                            {formState.touchedFields[field.name as keyof SignupFormData] &&
                              formState.errors[field.name as keyof SignupFormData] && (
                                <FormMessage>{formState.errors[field.name as keyof SignupFormData]?.message}</FormMessage>
                              )}
                          </FormItem>
                        )}
                      />
                    ))}

                    <Button
                      type="button"
                      variant="dromi"
                      className="group"
                      disabled={isLoading}
                      onClick={step < steps.length - 1 ? nextStep : handleSubmit(onSubmit)}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          {step < steps.length - 1 ? "Continue" : "Finish"}
                          <ArrowRight className="group-hover:translate-x-1 transition-transform duration-300" />
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="flex flex-col gap-2 text-center">
                    {step === 0 && (
                      <p className="text-muted-foreground text-sm">
                        By continuing, you agree to our{" "}
                        <Link href={`${env.NEXT_PUBLIC_SITE_URL}/terms`} className="text-primary underline">
                          Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link href={`${env.NEXT_PUBLIC_SITE_URL}/privacy`} className="text-primary underline">
                          Privacy Policy
                        </Link>
                      </p>
                    )}

                    <p className="text-muted-foreground text-sm">
                      Already have an account?{" "}
                      <Link className="text-primary underline cursor-pointer" href="/auth/signin">
                        Sign in
                      </Link>
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </Form>
      </FormProvider>
    </motion.div>
  )
}