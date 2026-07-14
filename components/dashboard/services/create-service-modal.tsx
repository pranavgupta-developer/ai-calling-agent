"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ServiceForm } from "./service-form";
import { CreateServiceValues } from "@/lib/validations/service";
import { createService } from "@/lib/actions/services/create-service";

interface CreateServiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateServiceModal({ open, onOpenChange, onSuccess }: CreateServiceModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: CreateServiceValues) => {
    setIsSubmitting(true);
    try {
      const result = await createService(data);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Service created successfully");
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast.error("Failed to create service");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Service</DialogTitle>
          <DialogDescription>
            Add a new service that your agency offers.
          </DialogDescription>
        </DialogHeader>
        <ServiceForm onSubmit={onSubmit} isSubmitting={isSubmitting} />
      </DialogContent>
    </Dialog>
  );
}
