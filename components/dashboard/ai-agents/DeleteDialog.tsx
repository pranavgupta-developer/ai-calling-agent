"use client";

import { useState } from "react";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface DeleteDialogProps {
  agentId: string;
  agentName: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: (id: string) => Promise<{ error?: string; success?: boolean }>;
  onSuccess?: () => void;
}

export function DeleteDialog({ agentId, agentName, isOpen, onOpenChange, onDelete, onSuccess }: DeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const result = await onDelete(agentId);
      
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Agent "${agentName}" deleted successfully`);
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      toast.error("An unexpected error occurred while deleting the agent.");
    } finally {
      setIsDeleting(false);
      onOpenChange(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Delete AI Agent
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{agentName}</strong>? This action cannot be undone and will immediately remove this agent from any assigned listings and services.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <Button 
            variant="destructive" 
            onClick={handleDelete} 
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Agent"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
