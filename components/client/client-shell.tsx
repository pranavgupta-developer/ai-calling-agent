"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  CalendarCheck,
  CreditCard,
  HeadphonesIcon,
  Home,
  LogOut,
  Menu,
  MessageSquareText,
  User,
} from "lucide-react";

import { useAuth } from "@/providers/auth-provider";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// ──────────────────────────────────────────────
// Nav items
// ──────────────────────────────────────────────

const navItems = [
  { href: "/client-portal", label: "Dashboard", icon: Home },
  {
    href: "/client-portal/appointments",
    label: "Appointments",
    icon: CalendarCheck,
  },
  { href: "/client-portal/payments", label: "Payments", icon: CreditCard },
  {
    href: "/client-portal/messages",
    label: "Messages",
    icon: MessageSquareText,
  },
  { href: "/client-portal/profile", label: "Profile", icon: User },
  { href: "/client-portal/support", label: "Support", icon: HeadphonesIcon },
];

// ──────────────────────────────────────────────
// Shell
// ──────────────────────────────────────────────

export function ClientShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex">
        <ClientSidebar />
      </div>

      {/* Mobile sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[260px] p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <ClientSidebar />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="flex h-16 shrink-0 items-center gap-4 border-b border-border bg-background/80 px-4 backdrop-blur-sm lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(true)}
            aria-label="Toggle navigation"
          >
            <Menu className="size-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Building2 className="size-5 text-primary" />
            <span className="text-sm font-semibold">Client Portal</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Sidebar
// ──────────────────────────────────────────────

function ClientSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  function isActive(href: string) {
    if (href === "/client-portal") return pathname === "/client-portal";
    return pathname.startsWith(href);
  }

  const displayName =
    (user?.user_metadata?.full_name as string) ??
    (user?.user_metadata?.first_name as string) ??
    user?.email ??
    "Client";

  const initials = displayName
    .split(" ")
    .map((w: string) => w.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <aside className="flex h-screen w-[260px] flex-col border-r border-sidebar-border bg-sidebar">
      {/* Brand */}
      <div className="flex h-16 items-center gap-3 px-4">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-sidebar-primary/10">
          <Building2 className="size-5 text-sidebar-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-sidebar-foreground">
            Client Portal
          </p>
          <p className="truncate text-[11px] text-sidebar-foreground/60">
            Real Estate AI
          </p>
        </div>
      </div>

      <Separator className="bg-sidebar-border" />

      {/* User info */}
      <div className="flex items-center gap-3 px-4 py-3">
        <Avatar className="size-9">
          <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-sidebar-foreground">
            {displayName}
          </p>
          <p className="truncate text-[11px] text-sidebar-foreground/60">
            {user?.email}
          </p>
        </div>
      </div>

      <Separator className="bg-sidebar-border" />

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Tooltip key={item.href}>
              <TooltipTrigger
                render={
                  <Link
                    href={item.href}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                    )}
                  >
                    {active && (
                      <motion.div
                        layoutId="client-sidebar-active"
                        className="absolute inset-0 rounded-lg bg-sidebar-accent"
                        transition={{
                          duration: 0.2,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                      />
                    )}
                    <item.icon className="relative z-10 size-[18px] shrink-0" />
                    <span className="relative z-10 truncate">{item.label}</span>
                  </Link>
                }
              />
              <TooltipContent side="right" className="lg:hidden">
                {item.label}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-4">
        <Separator className="mb-3 bg-sidebar-border" />
        <Button
          variant="ghost"
          onClick={logout}
          className="w-full justify-start gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive/80 hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="size-[18px] shrink-0" />
          <span className="truncate">Logout</span>
        </Button>
      </div>
    </aside>
  );
}
