import { Home } from "lucide-react";
import Link from "next/link";

export function AuthHeader() {
  return (
    <div className="flex items-center space-x-2 font-bold mb-8">
      <div className="bg-primary text-primary-foreground p-2 rounded-lg">
        <Home className="w-5 h-5" />
      </div>
      <Link href="/" className="text-xl tracking-tight hover:text-primary transition-colors">
        RealAI Portal
      </Link>
    </div>
  );
}
