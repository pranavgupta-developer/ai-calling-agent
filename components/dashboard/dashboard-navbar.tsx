"use client";

import { Bell, Menu, Search } from "lucide-react";

import { useAuth } from "@/providers/auth-provider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

type DashboardNavbarProps = {
  onMobileMenuToggle: () => void;
};

export function DashboardNavbar({ onMobileMenuToggle }: DashboardNavbarProps) {
  const { user, agency, logout } = useAuth();

  const initials = (() => {
    const firstName =
      (user?.user_metadata?.first_name as string) ?? "";
    const lastName =
      (user?.user_metadata?.last_name as string) ?? "";

    if (firstName || lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }

    return (user?.email?.charAt(0) ?? "U").toUpperCase();
  })();

  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b border-border bg-background/80 px-4 backdrop-blur-sm lg:px-6">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onMobileMenuToggle}
        className="lg:hidden"
        aria-label="Toggle navigation"
      >
        <Menu className="size-5" />
      </Button>

      {/* Search */}
      <div className="relative hidden flex-1 md:block md:max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search properties, leads, agents..."
          className="h-9 pl-9 text-sm"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Search (mobile) */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Search"
        >
          <Search className="size-5" />
        </Button>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Notifications"
        >
          <Bell className="size-5" />
          <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-blue-500" />
        </Button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                className="relative ml-1 flex items-center gap-2 rounded-lg px-2 py-1.5"
              >
                <Avatar className="size-8">
                  <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden text-left lg:block">
                  <p className="text-sm font-medium leading-tight">
                    {(user?.user_metadata?.first_name as string) ??
                      user?.email ??
                      "User"}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {agency?.name ?? "Agency"}
                  </p>
                </div>
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <p className="text-sm font-medium">
                {user?.user_metadata?.first_name as string}{" "}
                {user?.user_metadata?.last_name as string}
              </p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<a href="/dashboard/settings">Settings</a>} />
            <DropdownMenuItem render={<a href="/dashboard/billing">Billing</a>} />
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={logout}
              className="text-destructive focus:text-destructive"
            >
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
