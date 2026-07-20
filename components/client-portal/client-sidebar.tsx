"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, LayoutDashboard, LogOut, User, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/client/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/client/appointments", label: "Appointments", icon: CalendarDays },
  { href: "/client/profile", label: "Profile", icon: User },
  { href: "/client/notifications", label: "Notifications", icon: Bell },
];

export function ClientSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r bg-muted/40 hidden md:flex flex-col">
      <div className="p-6">
        <h2 className="text-xl font-semibold tracking-tight">Client Portal</h2>
      </div>
      
      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          
          return (
            <Link key={item.href} href={item.href}>
              <span
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t">
        <form action="/auth/signout" method="post">
          <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground">
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </Button>
        </form>
      </div>
    </aside>
  );
}
