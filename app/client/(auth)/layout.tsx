import { Building2 } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Left sidebar - hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-zinc-950 p-12 text-white border-r">
        <div>
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Building2 className="h-6 w-6" />
            <span>RealAI Portal</span>
          </Link>
        </div>
        
        <div className="space-y-6 max-w-md">
          <h1 className="text-4xl font-semibold tracking-tight">
            Manage your real estate portfolio intelligently.
          </h1>
          <p className="text-zinc-400 text-lg">
            Access AI-driven insights, communicate with your agents, and track all your appointments in one unified platform.
          </p>
        </div>

        <div className="flex items-center space-x-4 text-sm text-zinc-500">
          <span>&copy; {new Date().getFullYear()} RealAI Inc.</span>
          <Link href="/terms" className="hover:text-zinc-300 transition-colors">Terms</Link>
          <Link href="/privacy" className="hover:text-zinc-300 transition-colors">Privacy</Link>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:w-1/2 lg:px-20 xl:px-24 bg-background">
        <div className="mx-auto w-full max-w-sm lg:max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 flex justify-center">
            <Link href="/" className="flex items-center gap-2 font-bold text-2xl">
              <Building2 className="h-8 w-8" />
              <span>RealAI Portal</span>
            </Link>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
