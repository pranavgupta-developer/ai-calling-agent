"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  BarChart3,
  BookOpen,
  Bot,
  Building2,
  CalendarCheck,
  ChevronLeft,
  CreditCard,
  Home,
  LogOut,
  Settings,
  Users,
} from "lucide-react";

import { useAuth } from "@/providers/auth-provider";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// ──────────────────────────────────────────────
// Nav items
// ──────────────────────────────────────────────

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard/properties", label: "Properties", icon: Building2 },
  { href: "/dashboard/leads", label: "Leads", icon: Users },
  { href: "/dashboard/ai-agents", label: "AI Agents", icon: Bot },
  {
    href: "/dashboard/appointments",
    label: "Appointments",
    icon: CalendarCheck,
  },
  {
    href: "/dashboard/knowledge-base",
    label: "Knowledge Base",
    icon: BookOpen,
  },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
];

const bottomItems = [
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

// ──────────────────────────────────────────────
// Sidebar
// ──────────────────────────────────────────────

type DashboardSidebarProps = {
  collapsed: boolean;
  onToggle: () => void;
};

export function DashboardSidebar({
  collapsed,
  onToggle,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const { agency, logout } = useAuth();

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex h-screen flex-col border-r border-sidebar-border bg-sidebar"
    >
      {/* Brand */}
      <div className="flex h-16 items-center gap-3 px-4">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-sidebar-primary/10">
          <Building2 className="size-5 text-sidebar-primary" />
        </div>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05, duration: 0.2 }}
            className="min-w-0 flex-1"
          >
            <p className="truncate text-sm font-semibold text-sidebar-foreground">
              {agency?.name ?? "Real Estate AI"}
            </p>
            <p className="truncate text-[11px] text-sidebar-foreground/60">
              Agency Platform
            </p>
          </motion.div>
        )}
      </div>

      <Separator className="bg-sidebar-border" />

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            active={isActive(item.href)}
            collapsed={collapsed}
          />
        ))}
      </nav>

      {/* Bottom nav */}
      <div className="space-y-1 px-3 pb-2">
        <Separator className="mb-2 bg-sidebar-border" />
        {bottomItems.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            active={isActive(item.href)}
            collapsed={collapsed}
          />
        ))}
        <NavButton
          label="Logout"
          icon={LogOut}
          collapsed={collapsed}
          onClick={logout}
          variant="destructive"
        />
      </div>

      {/* Collapse toggle */}
      <button
        type="button"
        onClick={onToggle}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="absolute -right-3 top-20 z-10 flex size-6 items-center justify-center rounded-full border border-sidebar-border bg-sidebar text-sidebar-foreground/70 shadow-sm transition hover:bg-sidebar-accent hover:text-sidebar-foreground"
      >
        <ChevronLeft
          className={cn(
            "size-3.5 transition-transform",
            collapsed && "rotate-180"
          )}
        />
      </button>
    </motion.aside>
  );
}

// ──────────────────────────────────────────────
// Nav item sub-component
// ──────────────────────────────────────────────

type NavItemProps = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  collapsed: boolean;
};

function NavItem({ href, label, icon: Icon, active, collapsed }: NavItemProps) {
  const content = (
    <Link
      href={href}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
        collapsed && "justify-center px-0"
      )}
    >
      {active && (
        <motion.div
          layoutId="sidebar-active"
          className="absolute inset-0 rounded-lg bg-sidebar-accent"
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        />
      )}
      <Icon className={cn("relative z-10 size-[18px] shrink-0")} />
      {!collapsed && (
        <span className="relative z-10 truncate">{label}</span>
      )}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger render={content} />
        <TooltipContent side="right" sideOffset={12}>
          {label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
}

// ──────────────────────────────────────────────
// Nav button sub-component (for logout)
// ──────────────────────────────────────────────

type NavButtonProps = {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  collapsed: boolean;
  onClick: () => void;
  variant?: "default" | "destructive";
};

function NavButton({
  label,
  icon: Icon,
  collapsed,
  onClick,
  variant = "default",
}: NavButtonProps) {
  const content = (
    <Button
      variant="ghost"
      onClick={onClick}
      className={cn(
        "w-full justify-start gap-3 rounded-lg px-3 py-2.5 text-sm font-medium",
        variant === "destructive"
          ? "text-destructive/80 hover:bg-destructive/10 hover:text-destructive"
          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
        collapsed && "justify-center px-0"
      )}
    >
      <Icon className="size-[18px] shrink-0" />
      {!collapsed && <span className="truncate">{label}</span>}
    </Button>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger render={content} />
        <TooltipContent side="right" sideOffset={12}>
          {label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
}
