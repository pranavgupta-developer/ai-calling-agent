import { AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function ErrorState({ message = "Something went wrong." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="h-16 w-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-6">
        <AlertCircle className="h-8 w-8" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight mb-2">Appointment Not Found</h1>
      <p className="text-muted-foreground max-w-md mb-8">
        {message}
      </p>
      <Link href="/client/appointments">
        <Button variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Appointments
        </Button>
      </Link>
    </div>
  );
}
