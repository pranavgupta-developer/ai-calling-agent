"use client";

import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/button";
import { UsersIcon, PlusIcon } from "lucide-react";

export default function ClientsPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Clients</h2>
        <div className="flex items-center space-x-2">
          <Button>
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Client
          </Button>
        </div>
      </div>
      
      <div className="mt-8">
        <EmptyState
          title="No Clients Found"
          description="Your client list is empty. Add a client manually, or they will be created automatically when booking an appointment."
          icon={<UsersIcon className="w-6 h-6" />}
          actionLabel="Add Client"
          onAction={() => console.log('Create client modal...')}
        />
      </div>
    </div>
  );
}
