import { CheckCircle2, Clock, XCircle, AlertCircle } from "lucide-react";
import { AppointmentStatus } from "@/types/client-portal";
import { cn } from "@/lib/utils";

export function AppointmentTimeline({ status }: { status: AppointmentStatus }) {
  const steps = [
    { id: "pending", label: "Requested", icon: Clock },
    { id: "confirmed", label: "Confirmed", icon: CheckCircle2 },
    { id: "completed", label: "Completed", icon: CheckCircle2 },
  ];

  if (status === "cancelled") {
    steps[1] = { id: "cancelled", label: "Cancelled", icon: XCircle };
    steps.pop(); // Remove completed
  }
  
  if (status === "no_show") {
    steps[2] = { id: "no_show", label: "No Show", icon: AlertCircle };
  }

  const currentStepIndex = steps.findIndex(s => s.id === status);
  // If status is not found, assume it's pending (index 0) or handle appropriately
  const activeIndex = currentStepIndex === -1 ? 0 : currentStepIndex;

  return (
    <div className="relative flex justify-between">
      {/* Connecting Line */}
      <div className="absolute top-4 left-0 w-full h-[2px] bg-muted -z-10" />
      
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isActive = index <= activeIndex;
        const isCurrent = index === activeIndex;
        const isError = step.id === "cancelled" || step.id === "no_show";

        return (
          <div key={step.id} className="flex flex-col items-center gap-2 bg-background px-2">
            <div 
              className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full border-2 bg-background",
                isActive ? (isError ? "border-red-500 text-red-500" : "border-primary text-primary") : "border-muted text-muted-foreground",
                isCurrent && !isError && "bg-primary text-primary-foreground"
              )}
            >
              <Icon className="w-4 h-4" />
            </div>
            <span className={cn(
              "text-xs font-medium",
              isActive ? (isError ? "text-red-500" : "text-foreground") : "text-muted-foreground"
            )}>
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
