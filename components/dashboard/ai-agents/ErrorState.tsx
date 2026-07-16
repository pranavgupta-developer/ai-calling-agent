import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Something went wrong",
  message = "Failed to load the content. Please try again.",
  onRetry
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg border-red-100 bg-red-50/50">
      <AlertCircle className="w-8 h-8 text-red-500 mb-4" />
      <h3 className="text-lg font-medium text-red-900">{title}</h3>
      <p className="mt-2 text-sm text-red-700 max-w-[400px] mb-6">{message}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry} className="bg-white border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      )}
    </div>
  );
}
