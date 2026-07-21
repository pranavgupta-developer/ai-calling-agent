"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ClientSignupSchema, ClientSignupInput } from "../schemas/signup.schema";
import { signupClient } from "../actions/signup";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { PasswordInput } from "./password-input";
import { AuthCard } from "./auth-card";
import Link from "next/link";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

export function SignupForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<ClientSignupInput>({
    resolver: zodResolver(ClientSignupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (data: ClientSignupInput) => {
    setError(null);
    startTransition(async () => {
      try {
        const result = await signupClient(data);
        if (result.error) {
          setError(result.error);
        } else if (result.success) {
          setSuccess(true);
        }
      } catch (err) {
        setError("An unexpected error occurred. Please try again.");
      }
    });
  };

  if (success) {
    return (
      <AuthCard 
        title="Check your email" 
        description="We've sent you a verification link to complete your registration."
      >
        <div className="flex flex-col items-center justify-center space-y-4 py-4">
          <CheckCircle2 className="w-16 h-16 text-green-500" />
          <p className="text-center text-sm text-muted-foreground">
            Please verify your email address to access the client portal.
          </p>
          <Link href="/client/login" className={cn(buttonVariants({ variant: "outline" }), "w-full mt-4")}>
            Return to login
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard 
      title="Create an account" 
      description="Enter your details below to create your client account"
      footer={
        <div className="text-sm text-muted-foreground mt-4">
          Already have an account?{" "}
          <Link href="/client/login" className="text-primary hover:underline underline-offset-4">
            Login
          </Link>
        </div>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" disabled={isPending} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="m@example.com" disabled={isPending} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number (Optional)</FormLabel>
                <FormControl>
                  <Input type="tel" placeholder="+1 (555) 000-0000" disabled={isPending} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <PasswordInput placeholder="••••••••" disabled={isPending} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <PasswordInput placeholder="••••••••" disabled={isPending} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign Up
          </Button>
        </form>
      </Form>
    </AuthCard>
  );
}
