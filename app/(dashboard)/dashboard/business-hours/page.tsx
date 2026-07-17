"use client";

import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/button";
import { ClockIcon, PlusIcon } from "lucide-react";

export default function BusinessHoursPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Business Hours</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Exception
          </Button>
        </div>
      </div>
      
      <div className="mt-8">
        <EmptyState
          title="Configure Business Hours"
          description="Set up your weekly availability and block out exceptions like holidays or personal time."
          icon={<ClockIcon className="w-6 h-6" />}
          actionLabel="Set Up Hours"
          onAction={() => console.log('Open business hours config...')}
        />
      </div>
    </div>
  );
}
