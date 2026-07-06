"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Building2, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

type AuthShellProps = {
  children: React.ReactNode;
  hero: React.ReactNode;
};

export function AuthShell({ children, hero }: AuthShellProps) {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("reai-theme");
    const prefersDark = stored ? stored === "dark" : true;
    setIsDark(prefersDark);
    document.documentElement.classList.toggle("dark", prefersDark);
  }, []);

  function toggleTheme() {
    setIsDark((current) => {
      const next = !current;
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem("reai-theme", next ? "dark" : "light");
      return next;
    });
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.14),transparent_45%)]"
      />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col lg:flex-row">
        <div className="flex flex-1 flex-col px-6 py-8 sm:px-10 lg:px-12">
          <header className="mb-8 flex items-center justify-between">
            <Link
              href="/"
              className="group inline-flex items-center gap-3 transition-opacity hover:opacity-90"
            >
              <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
                <Building2 className="size-5 text-primary" aria-hidden />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  Real Estate AI
                </p>
                <p className="text-sm font-semibold">Premium Agency Platform</p>
              </div>
            </Link>

            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              className="inline-flex size-10 items-center justify-center rounded-xl border border-border/70 bg-background/70 backdrop-blur transition hover:bg-muted/60"
            >
              {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </button>
          </header>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center pb-10"
          >
            {children}
          </motion.div>

          <AuthFooter />
        </div>

        <div className="hidden flex-1 items-center justify-center p-8 lg:flex lg:p-12">
          {hero}
        </div>
      </div>
    </div>
  );
}

function AuthFooter() {
  return (
    <footer className="mt-auto border-t border-border/60 pt-6 text-center text-xs text-muted-foreground sm:text-left">
      <p>© 2026 Real Estate AI</p>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 sm:justify-start">
        <Link href="/privacy" className="transition hover:text-foreground">
          Privacy Policy
        </Link>
        <span aria-hidden className="hidden sm:inline">
          |
        </span>
        <Link href="/terms" className="transition hover:text-foreground">
          Terms of Service
        </Link>
        <span aria-hidden className="hidden sm:inline">
          |
        </span>
        <Link href="/support" className="transition hover:text-foreground">
          Contact Support
        </Link>
      </div>
    </footer>
  );
}

export function AuthCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-border/70 bg-card/70 p-8 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.45)] backdrop-blur-xl sm:p-10",
        className
      )}
    >
      {children}
    </div>
  );
}
